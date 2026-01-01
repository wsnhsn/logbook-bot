// @ts-ignore
import { Upload, FileText, Table, AlertCircle, Check } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface DataIngestionProps {
    lang: Language
    isUploading: boolean
    isDragging: boolean
    setIsDragging: (val: boolean) => void
    uploadedFile: any
    setUploadedFile: (val: any) => void
    handleFileUpload: (file: File) => void
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
            ) : (
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
                            onClick={() => setUploadedFile(null)}
                            className="p-3 rounded-xl hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 active:scale-90"
                        >
                            <AlertCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}
