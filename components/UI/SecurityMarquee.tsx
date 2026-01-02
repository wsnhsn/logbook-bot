import React from 'react'
// @ts-ignore
import { Shield } from 'lucide-react'
import { Language, translations } from '../../utils/translations'

interface SecurityMarqueeProps {
    lang: Language
}

export default function SecurityMarquee({ lang }: SecurityMarqueeProps) {
    const t = translations[lang] || translations['id']

    return (
        <div className="fixed top-0 left-0 w-full h-10 bg-[var(--prime-bg)]/30 backdrop-blur-md border-b border-[var(--prime)]/10 overflow-hidden flex items-center z-[60]">
            <div className="flex animate-marquee whitespace-nowrap items-center">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-8">
                        <Shield className="w-4 h-4 text-[var(--prime)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]/80 italic">
                            {t.security_marquee}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[var(--prime)]/30 mx-4" />
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    display: flex;
                    animation: marquee 45s linear infinite;
                    width: max-content;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    )
}
