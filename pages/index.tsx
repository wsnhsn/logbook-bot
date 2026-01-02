import { useState, useEffect } from 'react'
import Head from 'next/head'
// @ts-ignore
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'
import { useTheme } from 'next-themes'
import { Language, translations } from '@/utils/translations'

// Components
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Dashboard/Header'
import SecurityMarquee from '@/components/UI/SecurityMarquee'
import ScrollToTop from '@/components/UI/ScrollToTop'
import UserGuideDetailed from '@/components/Dashboard/UserGuideDetailed'
import DataIngestion from '@/components/Dashboard/DataIngestion'
import DocumentationBuffer from '@/components/Dashboard/DocumentationBuffer'
import ExecutionContext from '@/components/Dashboard/ExecutionContext'
import ExecutionDashboard from '@/components/Dashboard/ExecutionDashboard'
import DonationFooter from '@/components/Dashboard/DonationFooter'
import AssistantBuddy from '@/components/Assistant/AssistantBuddy'
import { Record } from '@/types/record'

// Types
interface UploadResponse {
  filename: string
  server_filename: string
  total_rows: number
  expected_files?: string[]
}

interface SubmissionStatus {
  is_running: boolean
  progress: number
  total: number
  current_row: number
  results: any[]
  message: string
}

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [lang, setLang] = useState<Language>('id')

  // State
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingAttachments, setIsDraggingAttachments] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null)
  const [attachments, setAttachments] = useState<string[]>([])
  const [aktivitasId, setAktivitasId] = useState('')
  const [cookies, setCookies] = useState('')
  const [status, setStatus] = useState<SubmissionStatus | null>(null)
  const [results, setResults] = useState<any[]>([])

  // Login Mode State
  const [loginMode, setLoginMode] = useState<'manual' | 'auto'>('manual')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const t = translations[lang]

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('logbook_config')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAktivitasId(parsed.aktivitasId || '')
        setCookies(parsed.cookies || '')
        if (parsed.lang) setLang(parsed.lang)
        if (parsed.uploadedFile) setUploadedFile(parsed.uploadedFile)
        if (parsed.attachments) setAttachments(parsed.attachments)
      } catch (e) {
        console.error('Error loading config', e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('logbook_config', JSON.stringify({
        aktivitasId,
        cookies,
        lang,
        uploadedFile,
        attachments
      }))
    }
  }, [aktivitasId, cookies, lang, uploadedFile, attachments, mounted])



  useEffect(() => {
    let interval: any
    if (status?.is_running) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get<SubmissionStatus>('/api/status')
          setStatus(res.data)
          if (res.data.results && res.data.results.length > 0) {
            setResults(res.data.results)
          }
          if (!res.data.is_running) {
            clearInterval(interval)
            toast.success(lang === 'id' ? 'Eksekusi Selesai' : 'Execution Finished')
          }
        } catch (e) {
          console.error('Status fetch error', e)
        }
      }, 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [status?.is_running, lang])

  const handleFileUpload = async (file: File) => {
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await axios.post<UploadResponse>('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadedFile(response.data)
      toast.success(`${t.entries_detected}: ${response.data.total_rows}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || (lang === 'id' ? 'Gagal mengunggah file' : 'Failed to upload file'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleAttachmentsUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    // Validation
    const allowedExtensions = ['png', 'jpg', 'jpeg']
    const invalidFormatFiles: string[] = []
    const mismatchFiles: string[] = []
    const validFiles: File[] = []

    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (!allowedExtensions.includes(ext)) {
        invalidFormatFiles.push(file.name)
        return
      }

      if (uploadedFile?.expected_files) {
        if (!uploadedFile.expected_files.includes(file.name)) {
          mismatchFiles.push(file.name)
          return
        }
      }

      validFiles.push(file)
    })

    if (invalidFormatFiles.length > 0) {
      toast.error(lang === 'id'
        ? `Format tidak didukung (.png/.jpg saja): ${invalidFormatFiles.slice(0, 2).join(', ')}${invalidFormatFiles.length > 2 ? '...' : ''}`
        : `Unsupported format (.png/.jpg only): ${invalidFormatFiles.slice(0, 2).join(', ')}${invalidFormatFiles.length > 2 ? '...' : ''}`)
    }

    if (mismatchFiles.length > 0) {
      toast.error(lang === 'id'
        ? `Nama file tidak ada di Excel: ${mismatchFiles.slice(0, 2).join(', ')}${mismatchFiles.length > 2 ? '...' : ''}`
        : `Filename not found in Excel: ${mismatchFiles.slice(0, 2).join(', ')}${mismatchFiles.length > 2 ? '...' : ''}`)
    }

    if (validFiles.length === 0) return

    setIsUploadingAttachments(true)
    const formData = new FormData()
    validFiles.forEach(file => {
      formData.append('files', file)
    })
    try {
      const response = await axios.post('/api/upload-attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (response.data.files && Array.isArray(response.data.files)) {
        setAttachments(prev => [...prev, ...response.data.files])
      }
      toast.success(lang === 'id' ? `Berhasil Mengunggah ${response.data.count} file` : `Successfully uploaded ${response.data.count} files`)
    } catch (error) {
      toast.error(lang === 'id' ? 'Gagal mengunggah dokumentasi' : 'Failed to upload documentation')
    } finally {
      setIsUploadingAttachments(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleDropAttachments = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingAttachments(false)
    if (e.dataTransfer.files.length > 0) {
      handleAttachmentsUpload(e.dataTransfer.files)
    }
  }

  const handleSubmit = async () => {
    // Stage 1: Validation in step order
    if (!cookies || !aktivitasId) return toast.error((t as any).err_step1)
    if (!uploadedFile) return toast.error((t as any).err_step2)
    if (attachments.length === 0) return toast.error((t as any).err_step3)

    const promise = axios.post('/api/submit', {
      aktivitas_id: aktivitasId,
      cookies_string: cookies,
      manifest_id: uploadedFile.server_filename
    })

    toast.promise(promise, {
      loading: lang === 'id' ? 'Menghubungkan ke Portal...' : 'Connecting to Portal...',
      success: (res) => {
        setStatus({
          is_running: true,
          progress: 0,
          total: (uploadedFile as any).total_rows,
          current_row: 0,
          results: [],
          message: lang === 'id' ? 'Menginisialisasi...' : 'Initializing...'
        })
        setResults([])
        return lang === 'id' ? 'Proses Dimulai' : 'Process Started'
      },
      error: (err) => err.response?.data?.detail || (lang === 'id' ? 'Gagal memulai proses' : 'Failed to start process')
    })
  }

  const handleLogin = async () => {
    if (!username || !password) return
    setIsLoggingIn(true)
    try {
      const response = await axios.post('/api/login', { username, password })
      if (response.data.success) {
        setCookies(response.data.cookies)
        toast.success(t.login_success)
        // Switch to manual mode so user can see the cookies or just stay in auto
      } else {
        toast.error(response.data.message || t.login_error)
      }
    } catch (e: any) {
      toast.error(t.login_error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const resetSubmission = async () => {
    const promise = axios.post('/api/reset')

    toast.promise(promise, {
      loading: lang === 'id' ? 'Membersihkan Cache...' : 'Clearing Cache...',
      success: () => {
        setStatus(null)
        setResults([])
        setUploadedFile(null)
        setAttachments([])
        setAktivitasId('')
        setCookies('')
        setUsername('')
        setPassword('')

        localStorage.setItem('logbook_config', JSON.stringify({
          aktivitasId: '',
          cookies: '',
          lang: lang,
          uploadedFile: null,
          attachments: []
        }))
        return lang === 'id' ? 'Seluruh Cache Berhasil Direset' : 'All Cache Successfully Reset'
      },
      error: lang === 'id' ? 'Gagal mereset state' : 'Failed to reset state'
    })
  }

  const downloadTemplate = () => {
    window.open('/api/download-template', '_blank')
  }

  const exportLog = () => {
    window.open('/api/export-log', '_blank')
  }

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>LOGBOOK BOT | {t.title}</title>
        <meta name="description" content="Automated Student Logbook IPB" />
      </Head>


      <SecurityMarquee lang={lang} />

      <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Sidebar
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
          downloadTemplate={downloadTemplate}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 lg:ml-[280px] transition-all pt-20 lg:pt-8">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 py-12 space-y-12">
            <Header
              lang={lang}
              resetSubmission={resetSubmission}
              handleSubmit={handleSubmit}
              status={status}
              isMobileMenuOpen={isMobileMenuOpen}
              toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />

            <UserGuideDetailed lang={lang} downloadTemplate={downloadTemplate} />



            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-12 min-w-0">
                <ExecutionContext
                  lang={lang}
                  aktivitasId={aktivitasId}
                  setAktivitasId={setAktivitasId}
                  cookies={cookies}
                  setCookies={setCookies}
                  loginMode={loginMode}
                  setLoginMode={setLoginMode}
                  username={username}
                  setUsername={setUsername}
                  password={password}
                  setPassword={setPassword}
                  handleLogin={handleLogin}
                  isLoggingIn={isLoggingIn}
                />

                <DataIngestion
                  lang={lang}
                  isUploading={isUploading}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  uploadedFile={uploadedFile}
                  setUploadedFile={setUploadedFile}
                  handleFileUpload={handleFileUpload}
                  handleDrop={handleDrop}
                />

                <DocumentationBuffer
                  lang={lang}
                  isUploadingAttachments={isUploadingAttachments}
                  isDraggingAttachments={isDraggingAttachments}
                  setIsDraggingAttachments={setIsDraggingAttachments}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  handleAttachmentsUpload={handleAttachmentsUpload}
                  handleDropAttachments={handleDropAttachments}
                />
              </div>

              <div className="min-w-0 h-full">
                <ExecutionDashboard
                  lang={lang}
                  status={status}
                  results={results}
                  exportLog={exportLog}
                />
              </div>
            </div>

            <DonationFooter lang={lang} />
          </div>
        </main>
      </div>

      <ScrollToTop />
      <AssistantBuddy lang={lang} />

      <style jsx global>{`
        :root {
          --prime: #1ba94c;
          --prime-glow: rgba(27, 169, 76, 0.4);
          --prime-bg: rgba(27, 169, 76, 0.08);
        }

        [data-theme='light'] {
          --bg-primary: #f8fafc;
          --bg-secondary: rgba(255, 255, 255, 0.9);
          --text-primary: #0f172a;
          --text-secondary: #334155;
          --text-muted: #64748b;
          --border: rgba(226, 232, 240, 0.8);
          --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }

        [data-theme='dark'] {
          --bg-primary: #020617;
          --bg-secondary: rgba(15, 23, 42, 0.8);
          --text-primary: #f8fafc;
          --text-secondary: #cbd5e1;
          --text-muted: #94a3b8;
          --border: rgba(30, 41, 59, 0.7);
          --card-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        body {
          background-image: 
            radial-gradient(at 0% 0%, var(--prime-bg) 0, transparent 40%),
            radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.03) 0, transparent 40%);
          background-attachment: fixed;
          @apply antialiased selection:bg-[var(--prime)] selection:text-white;
          font-size: 15px;
        }

        h1 { font-size: 2.1rem; }
        h2 { font-size: 1.7rem; }
        h3 { font-size: 1.3rem; }
        h4 { font-size: 1.1rem; }
        
        button, input, select, textarea {
          font-size: 0.95rem;
        }
        
        label {
          font-size: 0.95rem;
        }

        .glass {
          background: var(--bg-secondary);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          box-shadow: var(--card-shadow);
        }

        .btn-primary {
          @apply bg-[var(--prime)] text-white rounded-xl font-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-50;
          box-shadow: 0 4px 0 rgba(20, 156, 67, 0.5);
          font-size: 14px;
          padding: 14px 28px;
        }
        
        .btn-primary:active {
          box-shadow: 0 0 0 transparent;
          transform: translateY(2px);
        }

        .card {
          @apply glass rounded-2xl transition-all duration-300;
        }

        .card:hover {
          border-color: var(--prime);
          box-shadow: 0 8px 24px -8px var(--prime-glow);
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: var(--prime-bg); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--prime); }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }

        .animate-pulse-soft {
          animation: pulse-soft 2s infinite ease-in-out;
        }

        .sidebar-link {
          @apply flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-black text-[var(--text-muted)] transition-all hover:bg-white/5 hover:text-[var(--prime)] mb-2 uppercase tracking-widest;
        }

        .sidebar-link.active {
          @apply bg-[var(--prime-bg)] text-[var(--prime)] border-r-4 border-[var(--prime)] rounded-r-none;
        }
      `}</style>
    </>
  )
}
