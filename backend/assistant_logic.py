from typing import List, Dict
import re

# Simple Knowledge Base for the Assistant based on User Guide
GUIDE_KB = {
    "id": [
        {
            "keywords": ["cookies", "kuki", "cookie", "aspnetcore", "login", "nim", "password", "kata sandi"],
            "answer": "Ada dua cara ambil Cookies:\n\n1. **Otomatis**: Masukkan NIM & Password di Step 1 (Aman, data TIDAK disimpan).\n2. **Manual**: Buka portal IPB, tekan F12, tab Application, menu Cookies, lalu copy value '.AspNetCore.Cookies'."
        },
        {
            "keywords": ["format excel", "xlsx", "csv", "template", "header"],
            "answer": "Pastikan menggunakan template kami. Header wajib: Waktu, Tstart, Tend, JenisLogId, IsLuring, Lokasi, Keterangan, Dosen, NamaFile."
        },
        {
            "keywords": ["error", "gagal", "merah", "tidak jalan"],
            "answer": "Cek apakah Cookies masih aktif (biasanya expired dalam beberapa jam) dan pastikan ID Aktivitas sudah benar. Pastikan juga file Excel sudah tertutup di komputer Anda sebelum diunggah."
        },
        {
            "keywords": ["cara pakai", "tutorial", "panduan", "mulai"],
            "answer": "Langkah cepat:\n\n1. Set Cookies & ID Aktivitas\n2. Unggah file Excel\n3. Unggah Foto Bukti (opsional)\n4. Klik 'Mulai Proses'\n\nCek 'User Guide' untuk detail lebih lanjut."
        },
        {
            "keywords": ["dosen", "pembimbing"],
            "answer": "Pilih dosen di Excel dengan urutan angka (misal: 1 untuk dosen pertama, 2 untuk kedua). Jika lebih dari satu, gunakan koma: 1,2."
        }
    ],
    "en": [
        {
            "keywords": ["cookies", "cookie", "session", "login", "nim", "password"],
            "answer": "Two ways to get Cookies:\n\n1. **Automatic**: Enter NIM & Password in Step 1 (Secure, data is NOT stored).\n2. **Manual**: Open IPB portal, press F12, Application tab, Cookies menu, then copy '.AspNetCore.Cookies' value."
        },
        {
            "keywords": ["activity id", "id", "url"],
            "answer": "Activity ID is the number at the end of your logbook URL (e.g., /Index/12345). You can also just paste the entire URL into the bot."
        },
        {
            "keywords": ["excel format", "xlsx", "csv", "template", "header"],
            "answer": "Make sure to use our template. Required headers: Waktu, Tstart, Tend, JenisLogId, IsLuring, Lokasi, Keterangan, Dosen, NamaFile."
        },
        {
            "keywords": ["error", "failed", "red", "not working"],
            "answer": "Check if Cookies are still active (expired in few hours) and ensure Activity ID is correct. Also, close the Excel file on your computer before uploading."
        },
        {
            "keywords": ["how to use", "tutorial", "guide", "start"],
            "answer": "Quick start:\n\n1. Set Cookies & Activity ID\n2. Upload Excel file\n3. Upload Evidence Photos (optional)\n4. Click 'Start Process'\n\nSee 'User Guide' for more details."
        },
        {
            "keywords": ["lecturer", "supervisor", "dosen"],
            "answer": "Select lecturers in Excel by their order number (e.g., 1 for first, 2 for second). Use commas for multiple: 1,2."
        }
    ]
}

def get_assistant_response(query: str, lang: str = "id") -> str:
    query = query.lower()
    target_lang = lang if lang in GUIDE_KB else "id"
    kb = GUIDE_KB[target_lang]
    
    # Simple word matching
    best_match = None
    max_score = 0
    
    for entry in kb:
        score = 0
        for kw in entry["keywords"]:
            if kw in query:
                score += 1
        
        if score > max_score:
            max_score = score
            best_match = entry["answer"]
            
    if best_match:
        return best_match
    
    return None # Will trigger generic fallback on frontend
