# LOGBOOK-BOT
### Logbook Automation for IPB Students

[![Stateless Architecture](https://img.shields.io/badge/Architecture-Stateless-green.svg)](https://github.com/wsnhsn/logboot-bot)
[![Secure Data](https://img.shields.io/badge/Security-Memory--Only-blue.svg)](https://github.com/wsnhsn/logboot-bot)
[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)

**LOGBOOK-BOT** is a high-performance automation suite designed to help IPB University students manage their Kampus Merdeka Logbook entries with surgical precision and absolute privacy. 

> [!IMPORTANT]
> **V2.0.0 UPDATE: FULL STATELESS ENGINE**  
> Every byte of data—from Excel manifests to photo proof—is processed entirely in RAM. We store **nothing** on our disks. Once your submission session ends, the memory is purged instantly.

---

## Features

### Security First (Stateless Engine)
- **Zero Disk Footprint**: No local storage- [x] Fix Manual Mode Data Persistence
    - [x] Refine sync logic in `records.tsx` to prevent auto-clearing empty manual sessions
    - [x] Implement session recovery mechanism for manual sessions
- **Stateless Processing**: Your session data exists only during the transmission window.
- **Transparency**: High-visibility security marquee ensures you know exactly how your data is handled.

### Modern Dashboard (Next.js 15)
- **Glassmorphism UI**: A premium, translucent interface with smooth micro-animations.
- **Dark/Light Theme**: Seamless theme switching with system preference detection.
- **Progressive Feedback**: Real-time progress bars and success/failure tallies.
- **Multi-Documentation Support**: Upload dozens of photos as a single batch directly to RAM.
- **Dynamic Language Support**: Seamless switching between Indonesian and English.
- **Responsive Design**: Perfect experience on mobile, tablet, and desktop.

---

## Quick Start

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **Python 3.10+**

### Installation

#### 1. Install Frontend Dependencies
```bash
npm install
```

#### 2. Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

#### 3. Run Development Servers

**Frontend (Terminal 1):**
```bash
npm run dev
```

**Backend (Terminal 2):**
```bash
cd backend
python api.py
```

Frontend will be available at `http://localhost:3000`

---

## How to Operate
1. **Login** to IPB Student Portal.
2. **Find AktivitasId & Cookies** as guided in the dashboard.
3. **Upload Excel Manifest** with your logbook entries.
4. **Upload Photo Documentation** for each entry.
5. **Click Execute** and watch real-time progress.
6. **Download Execution Log** after completion.

---

## Alternative CLI Version
For developers who prefer terminal-based tools, check out the original **Terminal CLI version** at:
 [IPB-Student-Portal-Logbook-Bot](https://github.com/Anro128/IPB-Student-Portal-Logbook-Bot)

---

## Development Team
- **Anro**: Core Logic & Bot Architecture | [GitHub](https://github.com/Anro128) | [LinkedIn](https://www.linkedin.com/in/ahmad-nur-rohim-6065a4337)
- **Saen**: UI/UX & Modern Dashboard | [GitHub](https://github.com/wsnhsn) | [LinkedIn](https://linkedin.com/in/wisnu-al-hussaeni)

---

## License
This project is for educational purposes to help IPB University students manage their logbook entries more efficiently.

---

**Made with ❤️ for IPB Students. Smart Work, Better Future.**