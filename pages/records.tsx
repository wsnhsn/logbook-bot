import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'
import { useTheme } from 'next-themes'
import { Language, translations } from '@/utils/translations'
import { Record } from '@/types/record'
// @ts-ignore
import { AlertCircle, Search, Filter, ArrowUpDown, X } from 'lucide-react'
import Sidebar from '@/components/Layout/Sidebar'
import ScrollToTop from '@/components/UI/ScrollToTop'
import SecurityMarquee from '@/components/UI/SecurityMarquee'
import RecordsTable from '@/components/Records/RecordsTable'
import EditRecordModal from '@/components/Records/EditRecordModal'
import DeleteConfirmDialog from '@/components/Records/DeleteConfirmDialog'
import VisualAnalytics from '@/components/Dashboard/VisualAnalytics'

const DatabaseIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
)

const MenuIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
)

export default function RecordsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [lang, setLang] = useState<Language>('id')
    const [records, setRecords] = useState<Record[]>([])
    const [loading, setLoading] = useState(true)
    const [editingRecord, setEditingRecord] = useState<Record | null>(null)
    const [deletingRecord, setDeletingRecord] = useState<Record | null>(null)

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all') // all, luring, daring, hybrid

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10;

    const t = translations[lang]

    // Load language from localStorage
    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem('logbook_config')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                if (parsed.lang) setLang(parsed.lang)
            } catch (e) {
                console.error('Error loading config', e)
            }
        }
        fetchRecords()
    }, [])

    const fetchRecords = async () => {
        setLoading(true)
        try {
            const response = await axios.get<{ success: boolean; records: Record[]; count: number }>('/api/records')
            setRecords(response.data.records)
        } catch (error) {
            console.error('Error fetching records:', error)
            toast.error(lang === 'id' ? 'Gagal memuat data' : 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (record: Record) => {
        setEditingRecord(record)
    }

    const handleDelete = (record: Record) => {
        setDeletingRecord(record)
    }

    const handleSaveEdit = async (updatedRecord: Partial<Record>) => {
        if (!editingRecord) return

        try {
            await axios.put(`/api/records/${editingRecord.manifest_id}/${editingRecord.row_index}`, updatedRecord)
            toast.success(t.record_updated)
            setEditingRecord(null)
            fetchRecords()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || (lang === 'id' ? 'Gagal mengupdate record' : 'Failed to update record'))
        }
    }

    const handleConfirmDelete = async () => {
        if (!deletingRecord) return

        try {
            await axios.delete(`/api/records/${deletingRecord.manifest_id}/${deletingRecord.row_index}`)
            toast.success(t.record_deleted)
            setDeletingRecord(null)
            fetchRecords()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || (lang === 'id' ? 'Gagal menghapus record' : 'Failed to delete record'))
        }
    }

    const downloadTemplate = () => {
        window.open('/api/download-template', '_blank')
    }

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, filterType])

    const filteredRecords = records.filter(rec => {
        const matchesSearch = rec.Keterangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rec.Lokasi.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterType === 'all' ||
            (filterType === 'luring' && rec.IsLuring === 1) ||
            (filterType === 'daring' && rec.IsLuring === 0) ||
            (filterType === 'hybrid' && rec.IsLuring === 2)

        return matchesSearch && matchesFilter
    })

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    if (!mounted) return null

    return (
        <>
            <Head>
                <title>LOGBOOK BOT | {t.records}</title>
                <meta name="description" content="Manage Uploaded Records" />
            </Head>

            <Toaster position="top-right" />
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

                <main className="flex-1 lg:ml-[280px] transition-all pt-20 lg:pt-8 min-w-0 overflow-hidden">
                    <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 py-8 space-y-6 w-full">
                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="lg:hidden p-3 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text-primary)] transition-all active:scale-95"
                                >
                                    <MenuIcon />
                                </button>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="p-1.5 rounded-lg bg-[var(--prime-bg)] text-[var(--prime)]">
                                            <DatabaseIcon />
                                        </div>
                                        <span className="text-[10px] font-black tracking-[0.3em] text-[var(--text-muted)] uppercase">{t.records_page_title}</span>
                                    </div>
                                    <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">{t.records_page_subtitle}</h1>
                                </div>
                            </div>
                        </div>

                        {/* Visual Analytics */}
                        {records.length > 0 && (
                            <div className="mb-6">
                                <VisualAnalytics lang={lang} records={records} />
                            </div>
                        )}

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    placeholder={t.search_records}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field pl-4 pr-11 w-full"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--prime)] text-[var(--text-muted)]">
                                    {searchQuery ? (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="pointer-events-auto hover:text-[var(--text-primary)]"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <Search className="w-4 h-4" />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="p-3 rounded-xl glass border border-[var(--border)] text-[var(--text-muted)]">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="input-field min-w-[160px]"
                                >
                                    <option value="all">{t.filter_all}</option>
                                    <option value="luring">{t.filter_luring}</option>
                                    <option value="daring">{t.filter_daring}</option>
                                    <option value="hybrid">{t.filter_hybrid}</option>
                                </select>
                            </div>
                        </div>

                        {/* Sync Notice */}
                        <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-[11px] text-blue-500/80 font-black uppercase tracking-widest leading-relaxed">
                                {t.sync_notice}
                            </p>
                        </div>

                        {/* Records Table */}
                        {loading ? (
                            <div className="glass rounded-2xl p-12 border border-[var(--border)] text-center">
                                <div className="animate-pulse-soft">
                                    <div className="flex justify-center text-[var(--prime)] mb-4">
                                        <DatabaseIcon />
                                    </div>
                                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-wider text-sm">
                                        {t.loading_records}
                                    </p>
                                </div>
                            </div>
                        ) : filteredRecords.length === 0 ? (
                            <div className="glass rounded-2xl p-12 border border-[var(--border)] text-center">
                                <AlertCircle className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4 opacity-50" />
                                <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 uppercase">
                                    {t.no_records}
                                </h3>
                                <p className="text-[var(--text-muted)] text-sm">{t.no_records_desc}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="glass rounded-2xl overflow-hidden min-h-[300px]">
                                    <RecordsTable
                                        records={paginatedRecords}
                                        loading={loading}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        lang={lang}
                                    />
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                            {String((t as any).showing_records || '')
                                                .replace('{start}', ((currentPage - 1) * itemsPerPage + 1).toString())
                                                .replace('{end}', Math.min(currentPage * itemsPerPage, filteredRecords.length).toString())
                                                .replace('{total}', filteredRecords.length.toString())}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="p-3 rounded-xl glass border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--prime-bg)] hover:text-[var(--prime)] transition-all active:scale-95"
                                            >
                                                <div className="flex items-center gap-2 px-2">
                                                    <ArrowUpDown className="w-4 h-4 rotate-90" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{String((t as any).page_prev || '')}</span>
                                                </div>
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }).map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all active:scale-95 ${currentPage === i + 1
                                                            ? 'bg-[var(--prime)] text-white shadow-lg shadow-[var(--prime-glow)]'
                                                            : 'glass border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--prime)] hover:text-[var(--prime)]'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-3 rounded-xl glass border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--prime-bg)] hover:text-[var(--prime)] transition-all active:scale-95"
                                            >
                                                <div className="flex items-center gap-2 px-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{String((t as any).page_next || '')}</span>
                                                    <ArrowUpDown className="w-4 h-4 -rotate-90" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main >
            </div >

            <ScrollToTop />

            {/* Modals */}
            {
                editingRecord && (
                    <EditRecordModal
                        record={editingRecord}
                        onSave={handleSaveEdit}
                        onClose={() => setEditingRecord(null)}
                        lang={lang}
                    />
                )
            }

            {
                deletingRecord && (
                    <DeleteConfirmDialog
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setDeletingRecord(null)}
                        lang={lang}
                    />
                )
            }

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
