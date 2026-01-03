import { Record } from '@/types/record'
import { translations } from '@/utils/translations'
// @ts-ignore
import { Pencil, Trash2 } from 'lucide-react'

interface RecordsTableProps {
    records: Record[]
    onEdit: (record: Record) => void
    onDelete: (record: Record) => void
    lang: 'id' | 'en'
    loading?: boolean
}

export default function RecordsTable({ records, onEdit, onDelete, lang, loading }: RecordsTableProps) {
    const t = translations[lang]

    if (loading) {
        return (
            <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-black/[0.03] dark:bg-white/[0.02] border-b border-[var(--border)] text-[0.1px]">
                            {/* Same header structure but invisible to maintain alignment */}
                            <th className="px-6 py-4 w-16 opacity-0">NO</th>
                            <th className="px-6 py-4 opacity-0">LOGBOOK</th>
                            <th className="px-6 py-4 opacity-0">DATE</th>
                            <th className="px-6 py-4 opacity-0">START</th>
                            <th className="px-6 py-4 opacity-0">END</th>
                            <th className="px-6 py-4 opacity-0">MODE</th>
                            <th className="px-6 py-4 opacity-0">D.O</th>
                            <th className="px-6 py-4 opacity-0">LOCATION</th>
                            <th className="px-6 py-4 opacity-0 min-w-[200px]">DESCRIPTION</th>
                            <th className="px-6 py-4 w-32 border-l border-[var(--border)] opacity-0">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i} className="border-b border-[var(--border)] last:border-0">
                                <td className="px-6 py-6"><div className="h-3 w-4 bg-[var(--border)] rounded-full animate-pulse opacity-20" /></td>
                                <td className="px-6 py-6"><div className="h-3 w-20 bg-[var(--border)] rounded-full animate-pulse opacity-20" /></td>
                                <td className="px-6 py-6"><div className="h-3 w-16 bg-[var(--border)] rounded-full animate-pulse opacity-20" /></td>
                                <td className="px-6 py-6"><div className="h-3 w-10 bg-[var(--border)] rounded-full animate-pulse opacity-20" /></td>
                                <td className="px-6 py-6"><div className="h-3 w-10 bg-[var(--border)] rounded-full animate-pulse opacity-20" /></td>
                                <td className="px-6 py-6"><div className="h-5 w-16 bg-[var(--border)] rounded-lg animate-pulse opacity-20" /></td>
                                <td className="px-6 py-6"><div className="h-3 w-6 bg-[var(--border)] rounded-full animate-pulse opacity-20" /></td>
                                <td className="px-6 py-6"><div className="h-3 w-24 bg-[var(--border)] rounded-full animate-pulse opacity-20" /></td>
                                <td className="px-6 py-6"><div className="h-3 w-full bg-[var(--border)] rounded-full animate-pulse opacity-20" /></td>
                                <td className="px-6 py-6 bg-black/[0.01] dark:bg-white/[0.01] border-l border-[var(--border)] sticky right-0 backdrop-blur-xl z-10">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--border)] animate-pulse opacity-20" />
                                        <div className="w-8 h-8 rounded-lg bg-[var(--border)] animate-pulse opacity-20" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    const getJenisLogLabel = (id: number) => {
        const labels = {
            1: 'BAP',
            2: (lang === 'id' ? 'Ujian' : 'Exam'),
            3: (lang === 'id' ? 'Kegiatan' : 'Activity')
        }
        return labels[id as keyof typeof labels] || id
    }

    const getIsLuringLabel = (id: number) => {
        const labels = { 0: 'Online', 1: 'Offline', 2: 'Hybrid' }
        return labels[id as keyof typeof labels] || id
    }

    return (
        <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-black/5 dark:bg-white/5 border-b border-[var(--border)]">
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] w-16">
                                {t.col_no}
                            </th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[140px]">
                                {t.col_waktu}
                            </th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[110px]">
                                {t.col_tstart}
                            </th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[110px]">
                                {t.col_tend}
                            </th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[130px]">
                                {t.col_jenis}
                            </th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[120px]">
                                {t.col_luring}
                            </th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[100px]">
                                {lang === 'id' ? 'Dosen' : 'Lecturer'}
                            </th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[150px]">
                                {t.col_lokasi}
                            </th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[250px]">
                                {t.col_ket}
                            </th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] min-w-[150px]">
                                {t.col_file}
                            </th>
                            <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] w-32 sticky right-0 bg-inherit border-l border-[var(--border)]">
                                {t.col_actions}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {Array.from({ length: 11 }).map((_, j) => (
                                        <td key={j} className="px-6 py-5">
                                            <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full w-full"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : records.map((record, idx) => (
                            <tr
                                key={`${record.manifest_id}-${record.row_index}`}
                                className="group hover:bg-[var(--prime-bg)]/30 transition-all duration-200"
                            >
                                <td className="px-6 py-6 text-[11px] font-black text-[var(--text-muted)] group-hover:text-[var(--prime)]">
                                    {(idx + 1).toString().padStart(2, '0')}
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{record.Waktu}</span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{record.Tstart}</span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{record.Tend}</span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase tracking-widest border border-blue-500/20 block text-center truncate">
                                        {getJenisLogLabel(record.JenisLogId)}
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className={`px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border block text-center truncate ${record.IsLuring === 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                                        record.IsLuring === 1 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                                            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                        }`}>
                                        {getIsLuringLabel(record.IsLuring)}
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-[11px] font-black text-[var(--text-secondary)]">{record.Dosen}</span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-[11px] font-bold text-[var(--text-secondary)] line-clamp-1">{record.Lokasi}</span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-[11px] font-medium text-[var(--text-secondary)] leading-relaxed italic line-clamp-2">
                                        {record.Keterangan}
                                    </span>
                                </td>
                                <td className="px-6 py-6">
                                    <span className="text-[11px] font-mono text-[var(--text-muted)] line-clamp-1 truncate">
                                        {record.FilePath}
                                    </span>
                                </td>
                                <td className="px-6 py-6 sticky right-0 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl border-l border-[var(--border)] z-10">
                                    <div className="flex items-center justify-center gap-2.5">
                                        <button
                                            onClick={() => onEdit(record)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--prime-bg)] text-[var(--prime)] hover:bg-[var(--prime)] hover:text-white transition-all duration-300 shadow-sm border border-[var(--prime)]/10"
                                            title={t.edit}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(record)}
                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm border border-rose-500/10"
                                            title={t.delete}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
