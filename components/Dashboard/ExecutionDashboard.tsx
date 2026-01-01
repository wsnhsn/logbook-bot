// @ts-ignore
import { Terminal, Download, Clock, Check, AlertCircle, FileText, ChevronRight, Activity } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface ExecutionDashboardProps {
    lang: Language
    status: any
    results: any[]
    exportLog: () => void
}

export default function ExecutionDashboard({ lang, status, results, exportLog }: ExecutionDashboardProps) {
    const t = translations[lang]

    return (
        <section className="card p-8 h-full flex flex-col bg-black/[0.01] dark:bg-white/[0.01]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--prime-bg)] flex items-center justify-center text-[var(--prime)]">
                        <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">{t.control_dash}</h3>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.realtime_monitor}</p>
                    </div>
                </div>
                <button
                    onClick={exportLog}
                    disabled={results.length === 0}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-[var(--border)] text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] hover:bg-white/10 transition-all disabled:opacity-30 active:scale-95"
                >
                    <Download className="w-5 h-5" />
                    {t.export_log}
                </button>
            </div>

            <div className="mb-8 p-6 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--border)]">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">{t.sys_status}</p>
                        <p className="text-[13px] font-black text-[var(--text-primary)] uppercase italic leading-none">
                            {status?.is_running ? t.processing : (status?.message || t.sys_ready)}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-black text-[var(--prime)] italic leading-none">{status?.progress ? Math.round(status.progress) : 0}%</span>
                    </div>
                </div>
                <div className="progress-bar h-3">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${status?.progress || 0}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-4 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-tighter">
                    <span className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4" />
                        Row: {status?.current_row || 0} / {status?.total || 0}
                    </span>
                    <span className="flex items-center gap-2.5">
                        <Activity className="w-4 h-4" />
                        Status: {status?.is_running ? t.active : t.standby}
                    </span>
                </div>
            </div>

            <div className="flex-1 min-h-[400px] flex flex-col">
                <div className="flex items-center gap-3 px-4 py-3 rounded-t-2xl bg-black/10 dark:bg-white/5 border-x border-t border-[var(--border)]">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="text-[10px] font-mono font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-3">{t.console_out}</span>
                </div>
                <div className="flex-1 rounded-b-2xl border border-[var(--border)] bg-black/[0.1] dark:bg-black/60 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 font-mono custom-scrollbar">
                        {results.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                <Activity className="w-12 h-12 mb-6 animate-pulse" />
                                <p className="text-[11px] font-black uppercase tracking-[0.3em]">{t.waiting_init}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results.map((res, i) => (
                                    <div key={i} className="flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-300 border-b border-white/5 pb-3 last:border-0">
                                        <div className={`mt-0.5 shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase ${res.status === 'SUCCESS' ? 'bg-[var(--prime-bg)] text-[var(--prime)]' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {res.status}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] text-[var(--text-primary)] font-bold flex items-center gap-3 mb-1">
                                                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                                                Row {res.row} | {res.waktu}
                                            </p>
                                            <p className={`text-[11px] truncate ${res.status === 'SUCCESS' ? 'text-[var(--text-muted)]' : 'text-red-400 font-medium'}`}>
                                                {res.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
