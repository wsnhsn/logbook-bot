import React from 'react'
// @ts-ignore
import { Clock, MapPin, BarChart3, TrendingUp } from 'lucide-react'
import { Language, translations } from '@/utils/translations'
import { Record } from '@/types/record'

interface VisualAnalyticsProps {
    lang: Language
    records: Record[]
}

export default function VisualAnalytics({ lang, records }: VisualAnalyticsProps) {
    const t = translations[lang]

    if (!records || records.length === 0) return null

    // 1. Calculate Total Working Hours
    const calculateTotalHours = () => {
        let totalMinutes = 0
        records.forEach(rec => {
            const [h1, m1] = rec.Tstart.split(':').map(Number)
            const [h2, m2] = rec.Tend.split(':').map(Number)
            totalMinutes += (h2 * 60 + m2) - (h1 * 60 + m1)
        })
        return (totalMinutes / 60).toFixed(1)
    }

    // 2. Calculate Luring/Daring/Hybrid Ratio
    const luringCount = records.filter(r => r.IsLuring === 1).length
    const daringCount = records.filter(r => r.IsLuring === 0).length
    const hybridCount = records.filter(r => r.IsLuring === 2).length
    const totalCount = records.length

    const luringPercent = totalCount > 0 ? (luringCount / totalCount) * 100 : 0
    const daringPercent = totalCount > 0 ? (daringCount / totalCount) * 100 : 0
    const hybridPercent = totalCount > 0 ? (hybridCount / totalCount) * 100 : 0

    // 3. Activity Intensity (Records per day) - Small Bar Chart Data
    // We'll just show the count of unique days and average records per day
    const uniqueDays = new Set(records.map(r => r.Waktu)).size
    const avgPerDay = (records.length / uniqueDays).toFixed(1)

    return (
        <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Total Hours Card */}
            <div className="glass p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Clock className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        {t.total_hours}
                    </h3>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black italic tracking-tighter text-[var(--text-primary)]">
                        {calculateTotalHours()}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Hrs</span>
                </div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-progress" style={{ width: '70%' }}></div>
                </div>
            </div>

            {/* Attendance Ratio Card (Circle Chart) */}
            <div className="glass p-6 rounded-2xl relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[var(--prime-bg)] text-[var(--prime)]">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        {t.luring_ratio}
                    </h3>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            {/* Background Circle */}
                            <circle
                                cx="18" cy="18" r="15.9155"
                                className="stroke-white/5"
                                strokeWidth="3"
                                fill="none"
                            />
                            {/* Offline Segment (Purple) */}
                            {luringPercent > 0 && (
                                <circle
                                    cx="18" cy="18" r="15.9155"
                                    className="stroke-purple-500 animate-dash"
                                    strokeWidth="3"
                                    strokeDasharray={`${luringPercent} 100`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            )}
                            {/* Online Segment (Green) */}
                            {daringPercent > 0 && (
                                <circle
                                    cx="18" cy="18" r="15.9155"
                                    className="stroke-green-500 animate-dash"
                                    strokeWidth="3"
                                    strokeDasharray={`${daringPercent} 100`}
                                    strokeDashoffset={-luringPercent}
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            )}
                            {/* Hybrid Segment (Orange) */}
                            {hybridPercent > 0 && (
                                <circle
                                    cx="18" cy="18" r="15.9155"
                                    className="stroke-orange-500 animate-dash"
                                    strokeWidth="3"
                                    strokeDasharray={`${hybridPercent} 100`}
                                    strokeDashoffset={-(luringPercent + daringPercent)}
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black">{Math.round(luringPercent + daringPercent + hybridPercent)}%</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] tracking-tight">
                                {t.filter_luring}: <span className="text-[var(--text-primary)]">{luringCount}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] tracking-tight">
                                {t.filter_daring}: <span className="text-[var(--text-primary)]">{daringCount}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] tracking-tight">
                                {t.filter_hybrid}: <span className="text-[var(--text-primary)]">{hybridCount}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Intensity Card */}
            <div className="glass p-6 rounded-2xl relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        {t.activity_intensity}
                    </h3>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black italic tracking-tighter text-[var(--text-primary)]">
                        {avgPerDay}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Recs</span>
                </div>

                <div className="mt-4 flex items-end gap-1 h-8 opacity-50">
                    {[40, 70, 45, 90, 65, 80, 50, 85, 60, 75].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-purple-500/30 rounded-t-sm animate-grow-up"
                            style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    from { width: 0; }
                }
                .animate-progress {
                    animation: progress 1.5s ease-out forwards;
                }
                @keyframes dash {
                    from { stroke-dasharray: 0, 100; }
                }
                .animate-dash {
                    animation: dash 1.5s ease-out forwards;
                }
                @keyframes grow-up {
                    from { transform: scaleY(0); transform-origin: bottom; }
                    to { transform: scaleY(1); transform-origin: bottom; }
                }
                .animate-grow-up {
                    animation: grow-up 1s ease-out forwards;
                }
            `}</style>
        </div>
    )
}
