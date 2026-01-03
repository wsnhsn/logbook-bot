from typing import List, Dict
import re

# Simple Knowledge Base for the Assistant based on User Guide
GUIDE_KB = {
    "id": [
        {
            "keywords": ["cookies", "kuki", "cookie", "aspnetcore", "login", "username", "password", "kata sandi", "nim"],
            "answer": "Ada dua cara ambil Cookies:\n\n1. **Otomatis**: Masukkan Username & Password di Step 1 (Aman, data TIDAK disimpan).\n2. **Manual**: Buka portal IPB, tekan F12, tab Application, menu Cookies, lalu copy value '.AspNetCore.Cookies'."
        },
        {
            "keywords": ["format excel", "xlsx", "csv", "template", "header", "format file"],
            "answer": "Gunakan template kami. Header wajib: Waktu, Tstart, Tend, JenisLogId, IsLuring (Tipe Penyelenggara), Lokasi, Keterangan, Dosen, FilePath. Mendukung Excel (.xlsx), CSV, dan lampiran PDF/JPG/PNG."
        },
        {
            "keywords": ["error", "gagal", "merah", "tidak jalan"],
            "answer": "Cek apakah Cookies masih aktif dan pastikan ID Aktivitas/URL benar. Pastikan file Excel sudah tertutup sebelum diunggah."
        },
        {
            "keywords": ["manual mode", "tanpa file", "tambah manual", "input langsung"],
            "answer": "Gunakan fitur 'Mulai Tanpa File' di Langkah 2. Setelah itu, Anda bisa menambah, mengedit, atau menghapus record langsung di halaman 'Kelola Data' tanpa perlu upload Excel."
        },
        {
            "keywords": ["tipe penyelenggara", "luring", "daring", "hybrid"],
            "answer": "Tipe Penyelenggara (kolom IsLuring) menentukan mode kegiatan: 0 untuk Online, 1 untuk Offline, dan 2 untuk Hybrid."
        },
        {
            "keywords": ["foto", "lampiran", "pdf", "file", "bukti"],
            "answer": "Unggah bukti kegiatan di Langkah 3. Pastikan nama file di komputermu SAMA PERSIS dengan kolom 'FilePath' di data. Mendukung format image (.jpg/.png) dan dokumen (.pdf)."
        },
        {
            "keywords": ["cara pakai", "tutorial", "panduan", "mulai"],
            "answer": "Langkah cepat:\n\n1. Atur Sesi (Step 1)\n2. Input Data (Step 2 - bisa upload file atau klik 'Mulai Tanpa File')\n3. Unggah Lampiran (Step 3)\n4. Klik 'Mulai Proses'\n\nDetail lengkap ada di 'User Guide'."
        }
    ],
    "en": [
        {
            "keywords": ["cookies", "cookie", "session", "login", "username", "password", "nim"],
            "answer": "Two ways to get Cookies:\n\n1. **Automatic**: Enter Username & Password in Step 1 (Secure, data is NOT stored).\n2. **Manual**: Open IPB portal, press F12, Application tab, Cookies menu, then copy '.AspNetCore.Cookies' value."
        },
        {
            "keywords": ["excel format", "xlsx", "csv", "template", "header", "file format"],
            "answer": "Use our template. Required headers: Waktu, Tstart, Tend, JenisLogId, IsLuring (Organizer Type), Lokasi, Keterangan, Dosen, FilePath. Supports Excel, CSV, and PDF/JPG/PNG attachments."
        },
        {
            "keywords": ["manual mode", "without file", "manual input", "direct entry"],
            "answer": "Click 'Start Without File' in Step 2. You can then add, edit, or delete records directly on the 'Manage Data' page without uploading an Excel file."
        },
        {
            "keywords": ["organizer type", "offline", "online", "hybrid"],
            "answer": "Organizer Type (IsLuring column) defines the mode: 0 for Online, 1 for Offline, and 2 for Hybrid."
        },
        {
            "keywords": ["error", "failed", "red", "not working"],
            "answer": "Check if Cookies are still active and ensure Activity ID is correct. Close the Excel file on your computer before uploading."
        },
        {
            "keywords": ["photo", "attachment", "pdf", "evidence"],
            "answer": "Upload evidence in Step 3. Ensure the filename on your computer matches the 'FilePath' column exactly. Supports images (.jpg/.png) and documents (.pdf)."
        },
        {
            "keywords": ["how to use", "tutorial", "guide", "start"],
            "answer": "Quick start:\n\n1. Set Session (Step 1)\n2. Input Data (Step 2 - upload file or 'Start Without File')\n3. Upload Attachments (Step 3)\n4. Click 'Start Process'\n\nSee 'User Guide' for more details."
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
