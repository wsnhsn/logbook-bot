// @ts-ignore
import { Heart, ChevronRight, ShieldCheck, Zap, Github, Linkedin } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface DonationFooterProps {
    lang: Language
}

export default function DonationFooter({ lang }: DonationFooterProps) {
    const t = translations[lang]

    return (
        <div className="mt-16 flex flex-col items-center">
            <div className="w-full grid lg:grid-cols-2 gap-8 items-stretch">
                {/* Card 1: Support Developer */}
                <div className="card p-6 bg-[var(--prime-bg)] border-[var(--prime)]/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2.5 rounded-xl bg-red-500/10">
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </div>
                        <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider">{t.support_dev}</h3>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] lg:text-[13px] leading-relaxed mb-6 uppercase tracking-tighter">
                        {t.support_desc}
                    </p>
                    <div className="flex items-center gap-5">
                        <a
                            href="https://saweria.co/saen"
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary flex items-center gap-3 px-8 h-11 text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_4px_0_#149c43] active:translate-y-[2px] active:shadow-none"
                        >
                            {t.donate_saweria}
                            <ChevronRight className="w-4 h-4 opacity-70" />
                        </a>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-[var(--border)] text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold">
                            <ShieldCheck className="w-5 h-5 text-[var(--prime)]" />
                            {lang === 'id' ? 'Aman' : 'Secure'}
                        </div>
                    </div>
                </div>

                {/* Card 2: Manifest Engine */}
                <div className="card p-6 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border)] flex items-center justify-center shrink-0">
                        <Zap className="w-8 h-8 text-[var(--prime)] animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-[var(--prime)] uppercase tracking-[0.2em] mb-1.5">Manifest Engine</div>
                        <h4 className="text-[13px] font-black text-[var(--text-primary)] tracking-tighter uppercase italic">LOG-BOT SYSTEM v1.5.0</h4>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1.5 font-mono uppercase tracking-widest leading-relaxed border-l-2 border-[var(--prime)]/30 pl-4">
                            Automated Student Protocol Suite <br />
                            IPB University Standardized SOE
                        </p>
                    </div>
                </div>
            </div>

            <footer className="mt-20 pb-10 w-full flex flex-col items-center gap-6 border-t border-[var(--border)] pt-10">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">{t.dev_credits}</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-50">Anro :</span>
                            <a href="https://github.com/Anro128" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--prime)] hover:text-[var(--prime)] transition-all">
                                <Github className="w-3.5 h-3.5" />
                            </a>
                            <a href="https://www.linkedin.com/in/ahmad-nur-rohim-6065a4337" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[#0a66c2] hover:text-[#0a66c2] transition-all">
                                <Linkedin className="w-3.5 h-3.5" />
                            </a>
                        </div>
                        <div className="w-[1px] h-4 bg-[var(--border)]" />
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-50">Saen :</span>
                            <a href="https://github.com/wsnhsn" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--prime)] hover:text-[var(--prime)] transition-all">
                                <Github className="w-3.5 h-3.5" />
                            </a>
                            <a href="https://linkedin.com/in/wisnu-al-hussaeni" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[#0a66c2] hover:text-[#0a66c2] transition-all">
                                <Linkedin className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-tighter opacity-60 italic">{t.feedback_msg}</p>
                </div>

                <div className="opacity-30 hover:opacity-100 transition-opacity mt-4">
                    <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.4em] font-mono font-black text-center">
                        &copy; MMXXV LOGBOOK-BOT
                    </p>
                </div>
            </footer>
        </div>
    )
}
