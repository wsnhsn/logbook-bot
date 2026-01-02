// @ts-ignore
import { Shield, KeyRound, Activity, Fingerprint } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface ExecutionContextProps {
    lang: Language
    aktivitasId: string
    setAktivitasId: (val: string) => void
    cookies: string
    setCookies: (val: string) => void
}

export default function ExecutionContext({
    lang,
    aktivitasId,
    setAktivitasId,
    cookies,
    setCookies
}: ExecutionContextProps) {
    const t = translations[lang]

    return (
        <section className="card p-8 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-11 h-11 rounded-2xl bg-[var(--prime-bg)] flex items-center justify-center text-[var(--prime)] shadow-inner border border-[var(--prime)]/10">
                    <Shield className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">{t.exec_context}</h3>
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.portal_param}</p>
                </div>
            </div>

            <div className="space-y-10 flex-1">
                <div className="space-y-4">
                    <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                        <Fingerprint className="w-4 h-4 text-[var(--prime)]" />
                        {t.id_activity}
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={aktivitasId}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.includes('/Index/')) {
                                    const extracted = val.split('/Index/').pop()?.split(/[?#]/)[0];
                                    setAktivitasId(extracted || '');
                                } else {
                                    setAktivitasId(val);
                                }
                            }}
                            placeholder={lang === 'id' ? "Tempel URL atau ID Aktivitas..." : "Paste URL or Activity ID..."}
                            className="input-field w-full font-mono"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                        <KeyRound className="w-4 h-4 text-[var(--prime)]" />
                        {t.cookies_label}
                    </label>
                    <div className="relative group">
                        <textarea
                            value={cookies}
                            onChange={(e) => setCookies(e.target.value)}
                            placeholder={t.cookies_placeholder}
                            rows={8}
                            className="input-field w-full font-mono text-[11px] resize-none leading-relaxed"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-12 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-5">
                <Activity className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-500/80 font-medium leading-relaxed italic uppercase tracking-wider">
                    {t.sec_notice}
                </p>
            </div>
        </section>
    )
}
