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
import ai_engine
import assistant_logic

app = FastAPI(title="IPB Student Portal Logbook Bot API")

# CORS Configuration - Fixed for Production Deployment
ALLOWED_ORIGINS = ["*"] 
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: Incoming request {request.method} {request.url}")
    response = await call_next(request)
    print(f"DEBUG: Response status {response.status_code}")
    return response

# In-Memory Storage (Stateless)
IN_MEMORY_STORAGE = {
    "manifests": {},    
    "attachments": {}  
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

class PromptRequest(BaseModel):
    prompt: str
    lang: str = "id"

class LoginRequest(BaseModel):
    username: str
    password: str

class AssistantRequest(BaseModel):
    query: str
    lang: str = "id"

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
            df = pd.read_csv(file_io)
        else:
            try:
                # Primary attempt: openpyxl
                df = pd.read_excel(file_io, sheet_name='Sheet1', engine='openpyxl')
            except Exception as e:
                print(f"Sheet1 failed, trying default: {str(e)}")
                file_io.seek(0)
                df = pd.read_excel(file_io, engine='openpyxl')
        
        # --- DATA NORMALIZATION ---
        # 1. Normalize Date (Waktu) to DD/MM/YYYY
        if 'Waktu' in df.columns:
            # Handle mixed formats (strings and datetime objects)
            df['Waktu'] = pd.to_datetime(df['Waktu'], dayfirst=True, errors='coerce').dt.strftime('%d/%m/%Y')
            # Fill NaN (failures) with empty string to avoid processing errors
            df['Waktu'] = df['Waktu'].fillna('')

        # 2. Normalize Time (Tstart, Tend) to HH:MM
        for col in ['Tstart', 'Tend']:
            if col in df.columns:
                # Convert to string and take first 5 chars if it's longer (e.g., HH:MM:SS)
                df[col] = df[col].astype(str).str.strip().apply(lambda x: x[:5] if ':' in x else x)
        
        return df
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
                # Validation
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
                
                # Fetch Modal for CSRF and Dosen List
                modal_url = f"{BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah?AktivitasId={aktivitas_id}&idLog={row['JenisLogId']}"
                response = session.get(modal_url)
                if response.status_code != 200: raise ValueError(f"Portal access denied (HTTP {response.status_code}).")
                
                soup = BeautifulSoup(response.text, 'html.parser')
                csrf_token = soup.find('input', {'name': '__RequestVerificationToken'})
                if not csrf_token: raise ValueError("CSRF token not found. Session expired?")
                csrf_value = csrf_token['value']
                
                # Auto-detect form fields and count lecturers
                all_inputs = soup.find_all(['input', 'select', 'textarea'])
                initial_data = {inp.get('name'): inp.get('value', '') for inp in all_inputs if inp.get('name')}
                portal_fields = list(initial_data.keys())
                
                def find_field(possible_names):
                    for p_name in possible_names:
                        match = next((f for f in portal_fields if f.lower() == p_name.lower()), None)
                        if match: return match
                    return None

                # Date and Logic
                waktu_formatted = str(row['Waktu'])
                is_luring_val = int(row['IsLuring'])
                is_luring_str = "true" if is_luring_val == 1 else "false" if is_luring_val == 0 else ""
                
                # Field Mappings
                data = initial_data.copy()
                data.update({
                    find_field(['__RequestVerificationToken']) or '__RequestVerificationToken': csrf_value,
                    find_field(['AktivitasId', 'IdAktivitas']) or 'AktivitasId': aktivitas_id,
                    find_field(['Waktu', 'Tanggal']) or 'Waktu': waktu_formatted,
                    find_field(['Tmw', 'JamMulai', 'TStart']) or 'Tmw': str(row['Tstart']),
                    find_field(['Tsw', 'JamSelesai', 'TEnd']) or 'Tsw': str(row['Tend']),
                    find_field(['JenisLogbookKegiatanKampusMerdekaId', 'JenisLogId']) or 'JenisLogId': str(int(row['JenisLogId'])),
                    find_field(['IsLuring']) or 'IsLuring': is_luring_str,
                    find_field(['Lokasi']) or 'Lokasi': str(row['Lokasi']),
                    find_field(['Keterangan']) or 'Keterangan': str(row['Keterangan']),
                })

                # Dosen Pembimbing Logic (Anro's Logic)
                lecturer_cnt = sum(1 for k, v in data.items() if k.startswith("ListDosenPembimbing") and k.endswith(".Key.PembimbingId") and v)
                
                # Check for "Dosen" or "DosenPenggerak" column
                dosen_val = row.get("Dosen") if "Dosen" in row else row.get("DosenPenggerak", "1")
                dosen_str = str(dosen_val)
                
                dosen_ids = [
                    int(d) if d.strip().isdigit() and int(d) <= lecturer_cnt else 1
                    for d in dosen_str.split(",")
                    if d.strip()
                ]

                if len(dosen_ids) > 1:
                    for d_id in dosen_ids:
                        data.update({f"ListDosenPembimbing[{d_id - 1}].Value": "true"})
                else:
                    data.update({"ListDosenPembimbing[0].Value": "true"})

                # File Handling
                import mimetypes
                ctype, _ = mimetypes.guess_type(file_name)
                files = {"File": (file_name, io.BytesIO(file_bytes), ctype or ("application/pdf" if file_name.lower().endswith('.pdf') else "image/jpeg"))}
                
                submit_url = f"{BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Tambah?AktivitasId={aktivitas_id}"
                submit_response = session.post(submit_url, files=files, data=data, allow_redirects=False)
                
                # Success Validation Logic (Anro's Logic)
                is_success = False
                portal_message = ""
                
                if submit_response.status_code == 302:
                    # Verification: Check if description exists in the index page
                    list_url = f"{BASE_URL}/Kegiatan/LogAktivitasKampusMerdeka/Index/{aktivitas_id}"
                    r_list = session.get(list_url)
                    if str(row['Keterangan']) in r_list.text:
                        is_success = True
                        portal_message = "Uploaded successfully (Verified via 302 & Content)"
                    else:
                        is_success = False
                        portal_message = "Redirected but content not found in index."
                else:
                    # Fallback to JSON or text check
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

@app.delete("/manifest/{manifest_id}")
async def delete_manifest(manifest_id: str):
    """Delete uploaded manifest from memory"""
    try:
        if manifest_id in IN_MEMORY_STORAGE["manifests"]:
            IN_MEMORY_STORAGE["manifests"].pop(manifest_id)
            return {"success": True, "message": "Manifest deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Manifest not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    print(f"DEBUG: Received manifest upload: {file.filename}")
    try:
        content = await file.read()
        if not file.filename.lower().endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Clear existing manifests to prevent "ghost" data when switching files
        IN_MEMORY_STORAGE["manifests"].clear()
        
        manifest_id = f"{uuid.uuid4()}_{file.filename}"
        IN_MEMORY_STORAGE["manifests"][manifest_id] = content
        
        df = load_dataframe_from_bytes(content, file.filename)
        
        # Header Validation
        required_columns = ['Waktu', 'Tstart', 'Tend', 'JenisLogId', 'IsLuring', 'Lokasi', 'Keterangan', 'FilePath']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(status_code=400, detail=f"Invalid Template! Missing columns: {', '.join(missing_columns)}")

        # Extract expected filenames (basename only)
        # We use os.path.basename because FilePath might be a path or just a filename
        import os
        expected_files = df['FilePath'].dropna().astype(str).map(lambda x: os.path.basename(x.strip())).unique().tolist()

        preview = []
        for idx, row in df.head(5).iterrows():
            preview.append({
                'row': int(idx + 1), 'Waktu': str(row.get('Waktu', '')), 
                'Tstart': str(row.get('Tstart', '')), 'Tend': str(row.get('Tend', ''))
            })
        
        return {
            'success': True, 
            'server_filename': manifest_id, 
            'filename': file.filename, 
            'total_rows': len(df), 
            'preview': preview,
            'expected_files': expected_files
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload-attachments")
async def upload_attachments(files: List[UploadFile] = File(...)):
    print(f"DEBUG: Received {len(files)} attachments for upload")
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

@app.post("/init-manual")
async def init_manual():
    """Initialize an empty manifest for manual entry"""
    try:
        # Clear existing manifests to ensure a fresh manual session
        IN_MEMORY_STORAGE["manifests"].clear()
        
        manifest_id = f"{uuid.uuid4()}_manual_session.xlsx"
        df = pd.DataFrame(columns=['Waktu', 'Tstart', 'Tend', 'JenisLogId', 'IsLuring', 'Lokasi', 'Keterangan', 'FilePath', 'Dosen'])
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        
        IN_MEMORY_STORAGE["manifests"][manifest_id] = output.getvalue()
        return {
            'success': True, 
            'server_filename': manifest_id, 
            'filename': 'Manual Session', 
            'total_rows': 0,
            'expected_files': []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        'JenisLogId': [1], 'Dosen': ['1'],
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

@app.post("/login")
async def login(request: LoginRequest):
    """
    Automated login to IPB Student Portal to retrieve cookies.
    """
    session = requests.Session()
    login_url = "https://studentportal.ipb.ac.id/Account/Login"
    
    try:
        # 1. Get Login Page to extract CSRF Token
        response = session.get(login_url, timeout=10)
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        
        token_input = soup.find('input', {'name': '__RequestVerificationToken'})
        if not token_input:
            # Try finding it in another way or maybe it's not required
            token = ""
        else:
            token = token_input.get('value', '')

        # 2. Perform Login
        payload = {
            "Username": request.username,
            "Password": request.password,
            "__RequestVerificationToken": token,
            "RememberMe": "false"
        }
        
        # IPB Portal usually redirects or returns 200 with success info
        login_response = session.post(login_url, data=payload, timeout=15)
        
        # 3. Extract Cookies
        cookies_dict = session.cookies.get_dict()
        auth_cookie = cookies_dict.get('.AspNetCore.Cookies')
        
        if auth_cookie:
            return {
                "success": True, 
                "cookies": auth_cookie,
                "full_cookies": "; ".join([f"{k}={v}" for k, v in cookies_dict.items()])
            }
        else:
            # Check for error messages in HTML
            error_soup = BeautifulSoup(login_response.text, 'html.parser')
            val_summary = error_soup.find('div', {'class': 'validation-summary-errors'})
            error_msg = val_summary.text.strip() if val_summary else "Authentication failed. Invalid credentials or portal blocked bot access."
            return {"success": False, "message": error_msg}
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return {"success": False, "message": f"Connection error: {str(e)}"}

@app.post("/assistant")
async def assistant_query(request: AssistantRequest):
    """
    Handle user guide queries from the Assistant Buddy.
    """
    response = assistant_logic.get_assistant_response(request.query, request.lang)
    return {"success": True, "response": response}

@app.get("/records")
async def get_records():
    """Get all uploaded records from manifests"""
    try:
        all_records = []
        for manifest_id, manifest_bytes in IN_MEMORY_STORAGE["manifests"].items():
            try:
                df = load_dataframe_from_bytes(manifest_bytes, manifest_id)
                for idx, row in df.iterrows():
                    record = {
                        'manifest_id': manifest_id,
                        'row_index': int(idx),
                        'Waktu': str(row.get('Waktu', '')),
                        'Tstart': str(row.get('Tstart', '')),
                        'Tend': str(row.get('Tend', '')),
                        'JenisLogId': int(row.get('JenisLogId', 0)),
                        'IsLuring': int(row.get('IsLuring', 0)),
                        'Lokasi': str(row.get('Lokasi', '')),
                        'Keterangan': str(row.get('Keterangan', '')),
                        'FilePath': str(row.get('FilePath', '')),
                        'Dosen': str(row.get('Dosen', row.get('DosenPenggerak', '1')))
                    }
                    all_records.append(record)
            except Exception as e:
                print(f"Error loading manifest {manifest_id}: {str(e)}")
                continue
        return {'success': True, 'records': all_records, 'count': len(all_records)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/records/{manifest_id}/{row_index}")
async def update_record(manifest_id: str, row_index: int, record: Dict):
    """Update a specific record"""
    try:
        manifest_bytes = IN_MEMORY_STORAGE["manifests"].get(manifest_id)
        if not manifest_bytes:
            raise HTTPException(status_code=404, detail="Manifest not found")
        
        df = load_dataframe_from_bytes(manifest_bytes, manifest_id)
        
        if row_index < 0 or row_index >= len(df):
            raise HTTPException(status_code=404, detail="Record not found")
        
        # Update the dataframe
        for key, value in record.items():
            if key in df.columns:
                df.at[row_index, key] = value
        
        # Save back to memory
        output = io.BytesIO()
        if manifest_id.lower().endswith('.csv'):
            df.to_csv(output, index=False)
        else:
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False)
        
        IN_MEMORY_STORAGE["manifests"][manifest_id] = output.getvalue()
        
        return {'success': True, 'message': 'Record updated successfully'}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/records/dummy")
async def add_dummy_records(request: Dict):
    """Add template records to the session"""
    count = request.get('count', 1)
    try:
        # Get existing manifest or create a new one
        manifest_id = None
        if IN_MEMORY_STORAGE["manifests"]:
            manifest_id = list(IN_MEMORY_STORAGE["manifests"].keys())[0]
            content = IN_MEMORY_STORAGE["manifests"][manifest_id]
            df = load_dataframe_from_bytes(content, manifest_id)
        else:
            manifest_id = f"{uuid.uuid4()}_manual_records.xlsx"
            df = pd.DataFrame(columns=['Waktu', 'Tstart', 'Tend', 'JenisLogId', 'IsLuring', 'Lokasi', 'Keterangan', 'FilePath', 'Dosen'])

        new_rows = []
        for _ in range(count):
            new_rows.append({
                'Waktu': datetime.now().strftime('%d/%m/%Y'),
                'Tstart': '09:00',
                'Tend': '17:00',
                'JenisLogId': 3,
                'IsLuring': 1,
                'Lokasi': 'Kantor',
                'Keterangan': 'Melaksanakan tugas magang harian',
                'FilePath': 'dokumentasi.png',
                'Dosen': '1'
            })
        
        df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
        
        # Save back to memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        
        IN_MEMORY_STORAGE["manifests"][manifest_id] = output.getvalue()
        return {'success': True, 'count': count, 'total': len(df)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/records/all")
async def delete_all_records():
    """Delete all records from all manifests"""
    try:
        count = 0
        for manifest_id in list(IN_MEMORY_STORAGE["manifests"].keys()):
            IN_MEMORY_STORAGE["manifests"].pop(manifest_id)
            count += 1
        return {'success': True, 'message': f'Deleted all records from {count} manifests'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/records/{manifest_id}/{row_index}")
async def delete_record(manifest_id: str, row_index: int):
    """Delete a specific record"""
    try:
        manifest_bytes = IN_MEMORY_STORAGE["manifests"].get(manifest_id)
        if not manifest_bytes:
            raise HTTPException(status_code=404, detail="Manifest not found")
        
        df = load_dataframe_from_bytes(manifest_bytes, manifest_id)
        
        if row_index < 0 or row_index >= len(df):
            raise HTTPException(status_code=404, detail="Record not found")
        
        # Delete the row
        df = df.drop(row_index).reset_index(drop=True)
        
        # Save back to memory
        output = io.BytesIO()
        if manifest_id.lower().endswith('.csv'):
            df.to_csv(output, index=False)
        else:
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False)
        
        IN_MEMORY_STORAGE["manifests"][manifest_id] = output.getvalue()
        
        return {'success': True, 'message': 'Record deleted successfully', 'remaining': len(df)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-ai")
async def generate_ai(request: PromptRequest):
    """
    Generate or refine activity descriptions using the AI Engine module.
    """
    prompt = request.prompt.strip()
    if not prompt:
        return {"success": False, "message": "Prompt is empty"}

    try:
        refined_text = ai_engine.get_ai_refinement(prompt, request.lang)
        return {"success": True, "result": refined_text}
    except Exception as e:
        print(f"AI Engine Error: {str(e)}")
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
