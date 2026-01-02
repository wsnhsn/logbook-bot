import { useState } from 'react'
// @ts-ignore
import { BookOpen, FileText, Package, Info, ChevronRight, Download, Terminal, ChevronDown, ExternalLink } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface UserGuideDetailedProps {
    lang: Language
    downloadTemplate: () => void
}

export default function UserGuideDetailed({ lang, downloadTemplate }: UserGuideDetailedProps) {
    const t = translations[lang] || translations['id']
    const [isCollapsed, setIsCollapsed] = useState(true)

    if (!t) return null

    const steps = [
        {
            id: '01',
            title: t.step1_title,
            desc: t.step1_desc,
            icon: <Info className="w-4 h-4" />,
            color: 'text-yellow-500',
            subSteps: [
                { text: t.step3_sub1, icon: <ExternalLink className="w-2.5 h-2.5" /> },
                { text: t.step3_sub2, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.step3_sub3, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.step3_sub4, icon: <ExternalLink className="w-2.5 h-2.5" /> },
                { text: t.step3_sub5, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.step3_sub6, icon: <ChevronRight className="w-2.5 h-2.5" /> }
            ]
        },
        {
            id: '02',
            title: t.step2_title,
            desc: (
                <div className="space-y-2">
                    <p>{t.step2_desc}</p>
                    <p className="text-[10px] text-[var(--prime)] font-black uppercase tracking-widest bg-[var(--prime-bg)] inline-block px-3 py-1 rounded-lg border border-[var(--prime)]/20">
                        💡 {t.edit_guide_link}
                    </p>
                </div>
            ),
            icon: <FileText className="w-4 h-4" />,
            color: 'text-blue-500',
            subSteps: [
                { text: t.col_waktu, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.col_tstart, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.col_tend, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.col_jenis, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.col_luring, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.col_lokasi, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.col_ket, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.col_dosen, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.col_file, icon: <ChevronRight className="w-2.5 h-2.5" /> }
            ]
        },
        {
            id: '03',
            title: t.step3_title,
            desc: t.step3_desc,
            icon: <Package className="w-4 h-4" />,
            color: 'text-purple-500',
            subSteps: [
                { text: t.filename_match, icon: <ChevronRight className="w-2.5 h-2.5" /> }
            ]
        },
        {
            id: '04',
            title: t.step4_title,
            desc: t.step4_desc,
            icon: <Terminal className="w-4 h-4" />,
            color: 'text-emerald-500',
            subSteps: [
                { text: t.step4_sub1, icon: <ChevronRight className="w-2.5 h-2.5" /> },
                { text: t.step4_sub2, icon: <ExternalLink className="w-2.5 h-2.5" /> },
                { text: t.step4_sub3, icon: <ChevronRight className="w-2.5 h-2.5" /> }
            ]
        }
    ]

    return (
        <section className="card p-5 overflow-hidden transition-all duration-500">
            <div
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[var(--prime-bg)] flex items-center justify-center text-[var(--prime)] shadow-inner border border-[var(--prime)]/10 transition-transform group-hover:scale-110">
                        <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-base font-black tracking-tighter text-[var(--text-primary)] uppercase italic">{t.guide_title}</h2>
                            <ChevronDown className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
                        </div>
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{t.guide_subtitle}</p>
                    </div>
                </div>

                {!isCollapsed && (
                    <button
                        onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                        className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-[var(--prime-bg)] text-[var(--prime)] border border-[var(--prime)]/20 text-[11px] font-black uppercase tracking-widest hover:bg-[var(--prime)] hover:text-white transition-all active:scale-95 group/btn"
                    >
                        <Download className="w-5 h-5 group-hover/btn:animate-bounce" />
                        {t.download_template}
                    </button>
                )}
            </div>

            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-[2500px] opacity-100 mt-8'}`}>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                    {steps.map((step) => (
                        <div key={step.id} className="group p-6 rounded-2xl border border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.01] hover:border-[var(--prime)]/30 hover:bg-[var(--prime-bg)]/20 transition-all flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-white/5 border border-[var(--border)] ${step.color}`}>
                                    {step.icon}
                                </div>
                                <span className="text-lg font-black text-[var(--text-muted)] group-hover:text-[var(--prime)] opacity-10 group-hover:opacity-100 transition-all">
                                    {step.id}
                                </span>
                            </div>
                            <h4 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">{step.title}</h4>
                            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed italic mb-4">
                                {step.desc}
                            </div>
                            {step.subSteps && (
                                <div className={`space-y-2 mt-auto pt-4 border-t border-[var(--border)] group-hover:border-[var(--prime)]/10 grid ${step.id === '02' ? 'grid-cols-1 xl:grid-cols-2 gap-x-4' : 'grid-cols-1'}`}>
                                    {step.subSteps.map((sub, i) => (
                                        <div key={i} className="flex items-start gap-3 text-[11px] text-[var(--text-primary)] font-bold uppercase tracking-tight">
                                            <div className="mt-0.5 text-[var(--prime)] shrink-0">{sub.icon}</div>
                                            <span className="break-words leading-relaxed">{sub.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex items-center gap-4 px-5 py-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                    <Info className="w-5 h-5 text-yellow-500 shrink-0" />
                    <p className="text-[11px] text-yellow-500/80 font-black uppercase tracking-widest leading-relaxed">
                        {t.succ_notice}
                    </p>
                </div>
            </div>
        </section>
    )
}
