import Link from 'next/link'
// @ts-ignore
import { Upload, FileText, Table, Check } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

// Custom Trash Icon
const TrashIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
)

interface DataIngestionProps {
    lang: Language
    isUploading: boolean
    isDragging: boolean
    setIsDragging: (val: boolean) => void
    uploadedFile: any
    setUploadedFile: (val: any) => void
    handleFileUpload: (file: File) => void
    handleManualMode: () => void
    handleDrop: (e: React.DragEvent) => void
}

export default function DataIngestion({
    lang,
    isUploading,
    isDragging,
    setIsDragging,
    uploadedFile,
    setUploadedFile,
    handleFileUpload,
    handleManualMode,
    handleDrop
}: DataIngestionProps) {
    const t = translations[lang]

    return (
        <section className="card p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--prime-bg)] flex items-center justify-center text-[var(--prime)]">
                    <Table className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">{t.input_manifest}</h3>
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.dataset_type}</p>
                </div>
            </div>

            {!uploadedFile ? (
                <>
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`
                            relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 transition-all duration-300
                            ${isDragging
                                ? 'border-[var(--prime)] bg-[var(--prime)]/10 scale-[0.99]'
                                : 'border-[var(--border)] hover:border-[var(--prime)]/50 bg-black/[0.02] dark:bg-white/[0.02]'}
                        `}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleFileUpload(e.target.files[0])
                                    e.target.value = ''
                                }
                            }}
                        />
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`p-4 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] transition-transform duration-500 ${isUploading ? 'animate-bounce' : 'group-hover:scale-110'}`}>
                                <Upload className={`w-6 h-6 ${isUploading ? 'text-[var(--prime)]' : 'text-[var(--text-muted)]'}`} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                                    {isUploading ? t.uploading : t.drop_file}
                                </p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 font-medium italic">Format: .xlsx, .xls, .csv</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-[1px] flex-1 bg-[var(--border)]" />
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{lang === 'id' ? 'Atau' : 'Or'}</span>
                            <div className="h-[1px] flex-1 bg-[var(--border)]" />
                        </div>

                        <button
                            onClick={handleManualMode}
                            className="w-full flex items-center justify-center gap-4 p-5 rounded-2xl bg-white/5 border border-[var(--border)] hover:border-[var(--prime)]/50 hover:bg-[var(--prime-bg)] transition-all group overflow-hidden relative"
                        >
                            <div className="absolute inset-y-0 left-0 w-1 bg-[var(--prime)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] group-hover:scale-110 transition-transform">
                                <Check className="w-5 h-5 text-[var(--prime)]" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">{t.manual_mode}</p>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">{t.manual_mode_desc}</p>
                            </div>
                        </button>
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-[var(--prime-bg)] border border-[var(--prime)]/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center justify-between gap-5">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-[var(--prime)]/20">
                                    <FileText className="w-6 h-6 text-[var(--prime)] shadow-[0_0_10px_var(--prime)]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black text-[var(--text-primary)] uppercase truncate tracking-wider">{uploadedFile.filename}</p>
                                    <p className="text-[11px] font-bold text-[var(--prime)] uppercase tracking-widest mt-1">{uploadedFile.total_rows} {t.entries_detected}</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    if (uploadedFile?.server_filename) {
                                        try {
                                            await fetch(`/api/manifest/${uploadedFile.server_filename}`, {
                                                method: 'DELETE'
                                            })
                                        } catch (error) {
                                            console.error('Error deleting manifest:', error)
                                        }
                                    }
                                    setUploadedFile(null)
                                }}
                                className="p-3 rounded-xl hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 active:scale-90"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </div>

                    <Link
                        href="/records"
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--prime-bg)] border border-[var(--prime)]/10 hover:border-[var(--prime)]/30 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 border border-[var(--border)] group-hover:text-[var(--prime)]">
                                <Table className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                {t.edit_data_shortcut} <span className="text-[var(--prime)] underline decoration-dotted underline-offset-4">{t.manage_data}</span>
                            </span>
                        </div>
                        <svg className="w-4 h-4 text-[var(--prime)] transform transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}

            <div className="mt-8 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <p className="text-[11px] text-blue-500/80 font-medium leading-relaxed uppercase tracking-wider italic">
                    {t.template_hint}
                </p>
            </div>
        </section>
    )
}
