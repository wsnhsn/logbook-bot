// @ts-ignore
import { Upload, Package, AlertCircle, FileText, Database } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface DocumentationBufferProps {
    lang: Language
    isUploadingAttachments: boolean
    isDraggingAttachments: boolean
    setIsDraggingAttachments: (val: boolean) => void
    attachments: string[]
    setAttachments: (val: any) => void
    handleAttachmentsUpload: (files: FileList) => void
    handleDropAttachments: (e: React.DragEvent) => void
}

export default function DocumentationBuffer({
    lang,
    isUploadingAttachments,
    isDraggingAttachments,
    setIsDraggingAttachments,
    attachments,
    setAttachments,
    handleAttachmentsUpload,
    handleDropAttachments
}: DocumentationBufferProps) {
    const t = translations[lang]

    return (
        <section className="card p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--prime-bg)] flex items-center justify-center text-[var(--prime)]">
                    <Package className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">{t.buffer_title}</h3>
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.storage_desc}</p>
                </div>
            </div>

            <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingAttachments(true); }}
                onDragLeave={() => setIsDraggingAttachments(false)}
                onDrop={handleDropAttachments}
                className={`
                    cursor-pointer border-2 border-dashed rounded-2xl p-8 mb-6 transition-all
                    ${isDraggingAttachments ? 'border-[var(--prime)] bg-[var(--prime-bg)]' : 'border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.02]'}
                `}
                onClick={() => document.getElementById('attachments-upload')?.click()}
            >
                <input
                    id="attachments-upload"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                        if (e.target.files) {
                            handleAttachmentsUpload(e.target.files)
                            e.target.value = ''
                        }
                    }}
                />
                <div className="flex items-center justify-center gap-5">
                    <Upload className={`w-6 h-6 ${isUploadingAttachments ? 'animate-bounce text-[var(--prime)]' : 'text-[var(--text-muted)]'}`} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                        {isUploadingAttachments ? t.syncing : t.upload_doc}
                    </span>
                </div>
            </div>

            {attachments.length > 0 && (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-[var(--border)] group hover:border-[var(--prime)]/30 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                                <FileText className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--prime)]" />
                                <span className="text-[11px] font-bold text-[var(--text-primary)] truncate uppercase tracking-tight">{file}</span>
                            </div>
                            <button
                                onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-colors"
                            >
                                <AlertCircle className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {attachments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-30">
                    <Database className="w-10 h-10 mb-3" />
                    <p className="text-[11px] font-black uppercase tracking-widest leading-none">{t.waiting_data}</p>
                </div>
            )}
        </section>
    )
}
