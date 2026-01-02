// @ts-ignore
import { Shield, KeyRound, Activity, Fingerprint } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface ExecutionContextProps {
    lang: Language
    aktivitasId: string
    setAktivitasId: (val: string) => void
    cookies: string
    setCookies: (val: string) => void
    loginMode: 'manual' | 'auto'
    setLoginMode: (val: 'manual' | 'auto') => void
    username: string
    setUsername: (val: string) => void
    password: string
    setPassword: (val: string) => void
    handleLogin: () => void
    isLoggingIn: boolean
}

export default function ExecutionContext({
    lang,
    aktivitasId,
    setAktivitasId,
    cookies,
    setCookies,
    loginMode,
    setLoginMode,
    username,
    setUsername,
    password,
    setPassword,
    handleLogin,
    isLoggingIn
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

            {/* Mode Toggle */}
            <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl mb-8 border border-[var(--border)]">
                <button
                    onClick={() => setLoginMode('manual')}
                    className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'manual' ? 'bg-[var(--prime)] text-white shadow-lg shadow-[var(--prime-glow)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                    {t.login_mode_manual}
                </button>
                <button
                    onClick={() => setLoginMode('auto')}
                    className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${loginMode === 'auto' ? 'bg-[var(--prime)] text-white shadow-lg shadow-[var(--prime-glow)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                    {t.login_mode_auto}
                </button>
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

                {loginMode === 'manual' ? (
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
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                                <Activity className="w-4 h-4 text-[var(--prime)]" />
                                {t.username_label}
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={lang === 'id' ? "Username Anda..." : "Your Username..."}
                                className="input-field w-full"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                                <KeyRound className="w-4 h-4 text-[var(--prime)]" />
                                {t.password_label}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input-field w-full"
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            disabled={isLoggingIn || !username || !password}
                            className={`btn-primary w-full flex items-center justify-center gap-3 !py-4 ${isLoggingIn ? 'animate-pulse opacity-70' : ''}`}
                        >
                            <Shield className="w-5 h-5" />
                            {isLoggingIn ? t.logging_in : t.login_button}
                        </button>

                        {cookies && (
                            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center gap-4 animate-in zoom-in-95">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-[11px] font-black text-green-500 uppercase tracking-widest">{t.login_success}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-12 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <p className="text-[11px] text-blue-500/80 font-medium leading-relaxed italic uppercase tracking-wider">
                    {t.sec_notice}
                </p>
            </div>
        </section>
    )
}
