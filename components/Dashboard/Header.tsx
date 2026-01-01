// @ts-ignore
import { Terminal, Shield, Play, RotateCcw, Menu, AlertCircle } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface HeaderProps {
    lang: Language
    resetSubmission: () => void
    handleSubmit: () => void
    status: any
    isMobileMenuOpen: boolean
    toggleMobileMenu: () => void
}

export default function Header({
    lang,
    resetSubmission,
    handleSubmit,
    status,
    isMobileMenuOpen,
    toggleMobileMenu
}: HeaderProps) {
    const t = translations[lang]

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-8 border-b border-[var(--border)]">
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-3 rounded-xl bg-white/5 border border-[var(--border)] text-[var(--text-primary)] transition-all active:scale-95"
                >
                    {isMobileMenuOpen ? <AlertCircle className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <Terminal className="w-5 h-5 text-[var(--prime)]" />
                        <span className="text-[10px] font-black tracking-[0.3em] text-[var(--text-muted)] uppercase">{t.system_hub}</span>
                    </div>
                    <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">{t.title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-5">
                <button
                    onClick={resetSubmission}
                    className="flex items-center gap-3 px-6 h-12 rounded-xl bg-white/5 border border-[var(--border)] text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-white/10 transition-all active:scale-95"
                >
                    <RotateCcw className="w-5 h-5" />
                    {t.clear_cache}
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={status?.is_running}
                    className="btn-primary flex items-center gap-4 px-10 h-12 text-[11px] uppercase tracking-widest shadow-[0_4px_0_#149c43] active:translate-y-[2px] active:shadow-none"
                >
                    <Play className="w-5 h-5 fill-white" />
                    {t.start_process}
                </button>
            </div>
        </div>
    )
}
