// @ts-ignore
import { LayoutDashboard, FileText, Download, Sun, Moon, Bot, AlertCircle, Languages, Globe } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface SidebarProps {
    theme?: string
    setTheme: (theme: string) => void
    lang: Language
    setLang: (lang: Language) => void
    downloadTemplate: () => void
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ theme, setTheme, lang, setLang, downloadTemplate, isOpen, onClose }: SidebarProps) {
    const t = translations[lang]

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
        fixed left-0 top-10 h-[calc(100vh-2.5rem)] w-[280px] glass border-r border-[var(--border)] z-50 flex flex-col p-8 overflow-y-auto custom-scrollbar
        transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--prime)] text-white flex items-center justify-center shadow-[0_0_20px_var(--prime-glow)]">
                            <Bot className="w-7 h-7" />
                        </div>
                        <div className="font-black text-[10px] uppercase tracking-[0.3em] leading-tight italic">
                            Logbook<br /><span className="text-[var(--prime)]">Bot</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 text-[var(--text-muted)] hover:text-red-500">
                        <AlertCircle className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-[0.4em] mb-6 ml-4">{t.system_hub}</p>
                    <a href="#" className="sidebar-link active">
                        <LayoutDashboard className="w-5 h-5" />
                        {t.dashboard}
                    </a>
                    <button onClick={downloadTemplate} className="sidebar-link w-full">
                        <Download className="w-5 h-5" />
                        {t.template}
                    </button>
                </nav>

                <div className="mt-auto space-y-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:bg-white/5 transition-all group active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            {theme === 'dark' ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                                {theme === 'dark' ? t.theme_dark : t.theme_light}
                            </span>
                        </div>
                        <div className="w-10 h-5 rounded-full bg-black/10 dark:bg-white/10 relative">
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${theme === 'dark' ? 'right-0.5 bg-blue-400' : 'left-0.5 bg-yellow-500'}`}></div>
                        </div>
                    </button>

                    {/* Language Toggle */}
                    <div className="p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.02] border border-[var(--border)]">
                        <div className="flex items-center gap-3 mb-4 ml-1">
                            <Languages className="w-4 h-4 text-[var(--text-muted)]" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">{t.language}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setLang('id')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-black uppercase transition-all ${lang === 'id' ? 'bg-[var(--prime-bg)] text-[var(--prime)] border border-[var(--prime)]/20' : 'bg-transparent text-[var(--text-muted)] border border-transparent hover:bg-white/5'}`}
                            >
                                <span className="text-sm">🇮🇩</span> ID
                            </button>
                            <button
                                onClick={() => setLang('en')}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-black uppercase transition-all ${lang === 'en' ? 'bg-[var(--prime-bg)] text-[var(--prime)] border border-[var(--prime)]/20' : 'bg-transparent text-[var(--text-muted)] border border-transparent hover:bg-white/5'}`}
                            >
                                <span className="text-sm">🇺🇸</span> EN
                            </button>
                        </div>
                    </div>

                    {/* Secure Status */}
                    <div className="p-5 rounded-xl bg-black/[0.03] dark:bg-white/[0.02] border border-[var(--border)] group hover:border-[var(--prime)]/30 transition-all">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-3 h-3 rounded-full bg-[var(--prime)] animate-pulse shadow-[0_0_10px_var(--prime)]"></div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)]">{t.secure_bot}</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed italic font-medium uppercase tracking-tighter">
                            {t.secure_desc}
                        </p>
                    </div>
                </div>
            </aside>
        </>
    )
}
