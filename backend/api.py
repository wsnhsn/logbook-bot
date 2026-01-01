import io
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import pandas as pd
import requests
from bs4 import BeautifulSoup
import os
from datetime import datetime
from typing import Optional, List, Dict
import uuid

app = FastAPI(title="IPB Student Portal Logbook Bot API")

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Storage (Stateless)
# This replaces the 'uploads/' and 'attachments/' folders
IN_MEMORY_STORAGE = {
    "manifests": {},    # {uuid + filename: bytes}
    "attachments": {}   # {filename: bytes}
}

# Global state for submission progress
submission_state = {
    "is_running": False,
    "progress": 0,
    "total": 0,
    "current_row": 0,
    "results": [],
    "message": "",
    "manifest_id": ""
}

# ============== MODELS ==============

class SubmitRequest(BaseModel):
    aktivitas_id: str
    cookies_string: str
    manifest_id: str

# ============== COOKIE PARSING ==============

def parse_cookies_string(cookies_string: str) -> Dict[str, str]:
    cookies = {}
    cookies_string = cookies_string.strip()
    if not cookies_string: return cookies
    
    try:
        import json
        cookies = json.loads(cookies_string)
        if isinstance(cookies, dict): return cookies
    except: pass
    
    if ';' in cookies_string or '=' in cookies_string:
        try:
            parts = cookies_string.split(';')
            for part in parts:
                part = part.strip()
                if '=' in part:
                    key, value = part.split('=', 1)
                    cookies[key.strip()] = value.strip()
            if cookies: return cookies
        except: pass
    
    if cookies_string and not cookies:
        cookies['.AspNetCore.Cookies'] = cookies_string
    return cookies


# ============== VALIDATION ==============

def is_valid_date(tanggal_str: str) -> bool:
    if hasattr(tanggal_str, 'strftime'): return True
    tanggal_str = str(tanggal_str).strip()
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            val = tanggal_str.split()[0] if ' ' in tanggal_str else tanggal_str
            datetime.strptime(val, fmt)
            return True
        except: pass
    return False

def is_valid_time(waktu_str: str) -> bool:
    try:
        datetime.strptime(str(waktu_str), "%H:%M")
        return True
    except: return False

def load_dataframe_from_bytes(file_bytes: bytes, filename: str) -> pd.DataFrame:
    file_io = io.BytesIO(file_bytes)
    print(f"Loading dataframe from: {filename}")
    try:
        if filename.lower().endswith('.csv'):
            return pd.read_csv(file_io)
        else:
            try:
                # Primary attempt: openpyxl
                return pd.read_excel(file_io, sheet_name='Sheet1', engine='openpyxl')
            except Exception as e:
                print(f"Sheet1 failed, trying default: {str(e)}")
                file_io.seek(0)
                return pd.read_excel(file_io, engine='openpyxl')
    except Exception as e:
        print(f"Dataframe load error: {str(e)}")
        raise e

# ============== SUBMISSION LOGIC ==============
def submit_logbook_entries(aktivitas_id: str, cookies_string: str, manifest_id: str):
    global submission_state
    
    try:
        submission_state['is_running'] = True
        submission_state['results'] = []
        submission_state['manifest_id'] = manifest_id
        
        # Get Manifest from cache
        manifest_bytes = IN_MEMORY_STORAGE["manifests"].get(manifest_id)
        if not manifest_bytes:
            submission_state['message'] = "Error: Manifest not found in memory."
            submission_state['is_running'] = False
            return

        # manifest_id contains original filename after the underscore
        df = load_dataframe_from_bytes(manifest_bytes, manifest_id)
        
        required_columns = ['Waktu', 'Tstart', 'Tend', 'JenisLogId', 'IsLuring', 'Lokasi', 'Keterangan', 'FilePath']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            submission_state['message'] = f"Error: Missing columns: {', '.join(missing_columns)}"
            submission_state['is_running'] = False
            return

        submission_state['total'] = len(df)
        COOKIE_JAR = parse_cookies_string(cookies_string)
        
        if not COOKIE_JAR:
            submission_state['message'] = "Error: Invalid cookies format."
            submission_state['is_running'] = False
            return

        BASE_URL = "https://studentportal.ipb.ac.id"
        session = requests.Session()
        session.cookies.update(COOKIE_JAR)
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "*/*",
            "X-Requested-With": "XMLHttpRequest",
        })

        results = []

        for idx, row in df.iterrows():
            submission_state['current_row'] = idx + 1
            submission_state['progress'] = ((idx + 1) / len(df)) * 100
            
            try:
                if not is_valid_date(str(row['Waktu'])): raise ValueError(f"Invalid date format (DD/MM/YYYY).")
                if not is_valid_time(str(row['Tstart'])): raise ValueError(f"Invalid start time (HH:MM).")
                if not is_valid_time(str(row['Tend'])): raise ValueError(f"Invalid end time (HH:MM).")
                
                time_start = datetime.strptime(str(row['Tstart']), "%H:%M")
                time_end = datetime.strptime(str(row['Tend']), "%H:%M")
                if time_start >= time_end: raise ValueError(f"Start time must be before end time.")
                
                file_name = os.path.basename(str(row['FilePath']))
                file_bytes = IN_MEMORY_STORAGE["attachments"].get(file_name)
                
                if not file_bytes:
                    raise ValueError(f"Attachment not found: {file_name}. Ensure filenames match exactly.")
                
                submission_state['message'] = f'Submitting row {idx + 1} of {len(df)}...'
                
                modal_url = f"{BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah?AktivitasId={aktivitas_id}&idLog={row['JenisLogId']}"
                response = session.get(modal_url)
                if response.status_code != 200: raise ValueError(f"Portal access denied (HTTP {response.status_code}).")
                
                soup = BeautifulSoup(response.text, 'html.parser')
                csrf_token = soup.find('input', {'name': '__RequestVerificationToken'})
                if not csrf_token: raise ValueError("CSRF token not found. Session expired?")
                csrf_value = csrf_token['value']
                
                # Date Formatting
                waktu_value = row['Waktu']
                if hasattr(waktu_value, 'strftime'):
                    waktu_formatted = waktu_value.strftime("%d/%m/%Y")
                else:
                    waktu_str = str(waktu_value).strip()
                    try:
                        if ' ' in waktu_str: waktu_str = waktu_str.split()[0]
                        waktu_formatted = datetime.strptime(waktu_str, "%Y-%m-%d").strftime("%d/%m/%Y")
                    except: waktu_formatted = waktu_str
                
                # Logic: 0=Online, 1=Offline, 2=Hybrid
                is_luring_val = int(row['IsLuring'])
                if is_luring_val == 1: # Offline
                    is_luring_str = "true"; tipe_value = "1"
                elif is_luring_val == 2: # Hybrid
                    is_luring_str = "true"; tipe_value = "3"
                else: # Online
                    is_luring_str = "false"; tipe_value = "2"
                
                # Auto-detect form fields
                all_inputs = soup.find_all(['input', 'select', 'textarea'])
                data = {inp.get('name'): inp.get('value', '') for inp in all_inputs if inp.get('name')}
                portal_fields = list(data.keys())
                
                def find_field(possible_names):
                    for p_name in possible_names:
                        match = next((f for f in portal_fields if f.lower() == p_name.lower()), None)
                        if match: return match
                    return None

                mappings = {
                    find_field(['__RequestVerificationToken']) or '__RequestVerificationToken': csrf_value,
                    find_field(['AktivitasId', 'IdAktivitas']) or 'AktivitasId': aktivitas_id,
                    find_field(['Waktu', 'Tanggal']) or 'Waktu': waktu_formatted,
                    find_field(['Tmw', 'JamMulai', 'TStart']) or 'Tmw': str(row['Tstart']),
                    find_field(['Tsw', 'JamSelesai', 'TEnd']) or 'Tsw': str(row['Tend']),
                    find_field(['JenisLogbookKegiatanKampusMerdekaId', 'JenisLogId']) or 'JenisLogId': str(int(row['JenisLogId'])),
                    find_field(['TipePenyelenggaraan']) or 'TipePenyelenggaraan': tipe_value,
                    find_field(['IsLuring']) or 'IsLuring': is_luring_str,
                    find_field(['Lokasi']) or 'Lokasi': str(row['Lokasi']),
                    find_field(['Keterangan']) or 'Keterangan': str(row['Keterangan']),
                    "ListDosenPembimbing[0].Value": "true"
                }
                
                dosen_field = find_field(['DosenPenggerak', 'IdDosen'])
                dosen_value = str(row.get('DosenPenggerak', '')).strip()
                if dosen_value and dosen_value.lower() not in ['nan', 'none', '', '0']:
                    mappings[dosen_field or 'DosenPenggerak'] = dosen_value

                data.update({k: v for k, v in mappings.items() if k})
                file_field_name = find_field(['File', 'BuktiAktivitas']) or 'File'
                
                import mimetypes
                ctype, _ = mimetypes.guess_type(file_name)
                # Use in-memory file object
                files = {file_field_name: (file_name, io.BytesIO(file_bytes), ctype or "image/jpeg")}
                
                submit_url = f"{BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah?AktivitasId={aktivitas_id}"
                submit_response = session.post(submit_url, files=files, data=data)
                
                is_success = False
                portal_message = ""
                try:
                    resp_json = submit_response.json()
                    is_success = resp_json.get('status') is True
                    portal_message = resp_json.get('message', '')
                except:
                    if submit_response.status_code == 200:
                        is_success = 'success' in submit_response.text.lower()
                
                status_str = 'SUCCESS' if is_success else 'FAILED'
                results.append({'row': idx + 1, 'status': status_str, 'waktu': waktu_formatted, 'message': portal_message or ('Done' if is_success else 'Error')})

            except Exception as e:
                results.append({'row': idx + 1, 'status': 'ERROR', 'waktu': str(row.get('Waktu', 'N/A')), 'message': str(e)})

        submission_state['results'] = results
        submission_state['message'] = 'Complete!'
        
        # CLEANUP STORAGE
        IN_MEMORY_STORAGE["manifests"].pop(manifest_id, None)
        IN_MEMORY_STORAGE["attachments"].clear()
            
    except Exception as e:
        submission_state['message'] = f"Error: {str(e)}"
    finally:
        submission_state['is_running'] = False

# ============== API ENDPOINTS ==============

@app.get("/")
async def read_root(): return {"message": "IPB Logbook Bot API (Stateless)", "version": "3.0.0"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if not file.filename.lower().endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        manifest_id = f"{uuid.uuid4()}_{file.filename}"
        IN_MEMORY_STORAGE["manifests"][manifest_id] = content
        
        df = load_dataframe_from_bytes(content, file.filename)
        preview = []
        for idx, row in df.head(5).iterrows():
            preview.append({
                'row': int(idx + 1), 'Waktu': str(row.get('Waktu', '')), 
                'Tstart': str(row.get('Tstart', '')), 'Tend': str(row.get('Tend', ''))
            })
        
        return {'success': True, 'server_filename': manifest_id, 'filename': file.filename, 'total_rows': len(df), 'preview': preview}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload-attachments")
async def upload_attachments(files: List[UploadFile] = File(...)):
    try:
        count = 0
        filenames = []
        for file in files:
            IN_MEMORY_STORAGE["attachments"][file.filename] = await file.read()
            filenames.append(file.filename)
            count += 1
        return {'success': True, 'count': count, 'files': filenames}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/submit")
async def submit(request: SubmitRequest, background_tasks: BackgroundTasks):
    global submission_state
    if submission_state['is_running']: raise HTTPException(status_code=400, detail="Process running")
    background_tasks.add_task(submit_logbook_entries, request.aktivitas_id, request.cookies_string, request.manifest_id)
    return {'success': True, 'message': 'Started'}

@app.get("/status")
async def get_status(): return submission_state

@app.get("/download-template")
async def download_template():
    template = {
        'Waktu': ['11/08/2024'], 'Tstart': ['09:00'], 'Tend': ['11:00'],
        'JenisLogId': [1], 'DosenPenggerak': ['196412041991032001'],
        'IsLuring': [1], 'Lokasi': ['Room A'], 'Keterangan': ['Desc'], 'FilePath': ['foto.png']
    }
    df = pd.DataFrame(template)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=template.xlsx"})

@app.post("/reset")
async def reset_state():
    global submission_state
    if not submission_state['is_running']:
        submission_state = {"is_running": False, "progress": 0, "total": 0, "current_row": 0, "results": [], "message": "", "manifest_id": ""}
        IN_MEMORY_STORAGE["manifests"].clear()
        IN_MEMORY_STORAGE["attachments"].clear()
        return {"success": True}
    return {"success": False, "message": "Bot is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
