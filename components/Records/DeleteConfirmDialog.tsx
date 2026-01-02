import { translations } from '../../utils/translations'
import { AlertCircle } from 'lucide-react'

interface DeleteConfirmDialogProps {
    onConfirm: () => void
    onCancel: () => void
    lang: 'id' | 'en'
}

export default function DeleteConfirmDialog({ onConfirm, onCancel, lang }: DeleteConfirmDialogProps) {
    const t = translations[lang]

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass rounded-2xl w-full max-w-md p-8 border-2 border-red-500/20">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-black text-center text-[var(--text-primary)] mb-3 uppercase tracking-tight">
                    {t.delete_confirm}
                </h3>
                <p className="text-center text-[var(--text-muted)] mb-8 text-sm">
                    {t.delete_message}
                </p>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-4 rounded-xl bg-red-500 text-white font-black text-sm uppercase tracking-wider hover:brightness-110 transition-all active:scale-95 shadow-[0_4px_0_rgba(220,38,38,0.5)]"
                    >
                        {t.delete}
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-4 rounded-xl border-2 border-[var(--border)] text-[var(--text-primary)] font-black text-sm uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
                    >
                        {t.cancel}
                    </button>
                </div>
            </div>
        </div>
    )
}
