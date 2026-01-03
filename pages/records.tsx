import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'
import { useTheme } from 'next-themes'
import { Language, translations } from '@/utils/translations'
import { Record } from '@/types/record'
// @ts-ignore
import { Trash2, AlertCircle, Search, Filter, ArrowUpDown, X } from 'lucide-react'
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
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
    const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false)
    const [isAddingRecords, setIsAddingRecords] = useState(false)

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

    // Unsaved Changes warning (Browser tab close/refresh)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (editingRecord) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [editingRecord])

    const fetchRecords = async () => {
        setLoading(true)
        try {
            const response = await axios.get<{ success: boolean; records: Record[]; count: number }>('/api/records')
            const fetchedRecords = response.data.records
            setRecords(fetchedRecords)

            // Sync with localStorage so Dashboard reflects the current state
            const stored = localStorage.getItem('logbook_config')
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    if (fetchedRecords.length === 0) {
                        // If no records left, clear the uploadedFile state
                        parsed.uploadedFile = null
                    } else if (parsed.uploadedFile) {
                        // Update the row count metadata
                        parsed.uploadedFile.total_rows = fetchedRecords.length
                    }
                    localStorage.setItem('logbook_config', JSON.stringify(parsed))
                } catch (e) {
                    console.error('Error syncing localStorage:', e)
                }
            }
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

    const handleConfirmDeleteAll = async () => {
        try {
            await axios.delete('/api/records/all')
            toast.success(lang === 'id' ? 'Seluruh data berhasil dihapus' : 'All data deleted successfully')
            setShowDeleteAllConfirm(false)
            fetchRecords()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || (lang === 'id' ? 'Gagal menghapus seluruh data' : 'Failed to delete all data'))
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

    const handleAddRecords = async (count: number) => {
        setIsAddingRecords(true)
        setIsAddDropdownOpen(false)
        try {
            await axios.post('/api/records/dummy', { count })
            toast.success(lang === 'id' ? `Berhasil menambah ${count} record` : `Successfully added ${count} records`)
            fetchRecords()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || (lang === 'id' ? 'Gagal menambah record' : 'Failed to add record'))
        } finally {
            setIsAddingRecords(false)
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

                <main className="flex-1 lg:ml-[280px] transition-all pt-20 lg:pt-8 min-w-0">
                    <div className="w-full mx-auto px-6 sm:px-10 lg:px-12 py-8 space-y-6">
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
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--prime-bg)] flex items-center justify-center text-[var(--prime)] border border-[var(--prime)]/20 shadow-sm shadow-[var(--prime-glow)]">
                                            <DatabaseIcon />
                                        </div>
                                        <span className="text-[10px] font-black tracking-[0.3em] text-[var(--text-muted)] uppercase">{t.records_page_title}</span>
                                    </div>
                                    <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] uppercase italic leading-none">{t.records_page_subtitle}</h1>
                                </div>
                            </div>

                            {/* Action Buttons Group */}
                            <div className="flex items-center gap-3">
                                {/* Add Record Button */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                                        disabled={isAddingRecords}
                                        className="btn-primary flex items-center gap-3 !py-3.5 !px-8 group active:scale-95 transition-all h-[52px]"
                                    >
                                        <div className={`p-1.5 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors ${isAddingRecords ? 'animate-spin' : ''}`}>
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap">{t.add_record}</span>
                                        <div className={`transition-transform duration-300 ${isAddDropdownOpen ? 'rotate-180' : ''}`}>
                                            <ArrowUpDown className="w-4 h-4 opacity-50" />
                                        </div>
                                    </button>

                                    {isAddDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-56 glass rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
                                            {[1, 5, 10].map((count) => (
                                                <button
                                                    key={count}
                                                    onClick={() => handleAddRecords(count)}
                                                    className="w-full flex items-center gap-4 px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--prime-bg)] hover:text-[var(--prime)] transition-all border-b border-[var(--border)] last:border-0"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-[var(--prime)]" />
                                                    {(t as any)[`add_${count}`]}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Delete All Button - Only if records exist */}
                                {records.length > 0 && (
                                    <button
                                        onClick={() => setShowDeleteAllConfirm(true)}
                                        className="flex items-center gap-3 px-6 h-[52px] rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black text-[11px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t.delete_all}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Visual Analytics */}
                        {records.length > 0 && (
                            <div className="mb-6">
                                <VisualAnalytics lang={lang} records={records} />
                            </div>
                        )}

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col md:flex-row gap-5 mb-8">
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    placeholder={t.search_records}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field pl-5 pr-12 w-full !py-4 shadow-sm border-[var(--border)] group-hover:border-[var(--prime)]/50 focus:!border-[var(--prime)] transition-all"
                                />
                                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--prime)] text-[var(--text-muted)]">
                                    {searchQuery ? (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="pointer-events-auto hover:text-rose-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <Search className="w-4 h-4 opacity-40 group-focus-within:opacity-100" />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-4 rounded-xl glass border border-[var(--border)] text-[var(--text-muted)] shadow-sm">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="input-field min-w-[200px] !py-4 font-bold appearance-none cursor-pointer border-[var(--border)] hover:border-[var(--prime)]/50 focus:!border-[var(--prime)] shadow-sm"
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
                        {filteredRecords.length === 0 && !loading ? (
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

            {
                showDeleteAllConfirm && (
                    <DeleteConfirmDialog
                        onConfirm={handleConfirmDeleteAll}
                        onCancel={() => setShowDeleteAllConfirm(false)}
                        lang={lang}
                        title={t.delete_all_confirm}
                        message={t.delete_all_message}
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
