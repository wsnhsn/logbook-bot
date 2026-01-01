import React from 'react'
import { Language, translations } from '@/utils/translations'

interface MaintenanceProps {
    lang: Language
}

const MaintenanceIcon = () => (
    <svg className="w-12 h-12 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
)

export default function Maintenance({ lang }: MaintenanceProps) {
    const t = translations[lang]

    return (
        <div className="fixed inset-0 bg-[#0e141e] flex items-center justify-center p-6 z-[9999]">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Visual Icon */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                    <div className="relative w-24 h-24 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce transition-all duration-1000">
                        <MaintenanceIcon />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                        {t.maintenance_title}
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm mx-auto">
                        {t.maintenance_desc}
                    </p>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">
                        Status: Expected back in 1 hour
                    </span>
                </div>

                <div className="pt-8 text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em] font-bold opacity-50">
                    Logbook Bot v2.0 • Security Verified
                </div>
            </div>
        </div>
    )
}
