import { Record } from '@/types/record'
import { translations } from '@/utils/translations'

interface RecordsTableProps {
    records: Record[]
    onEdit: (record: Record) => void
    onDelete: (record: Record) => void
    lang: 'id' | 'en'
    loading?: boolean
}

// Custom SVG Icons
const PencilIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
)

const TrashIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
)

export default function RecordsTable({ records, onEdit, onDelete, lang, loading }: RecordsTableProps) {
    const t = translations[lang]

    const getJenisLogLabel = (id: number) => {
        const labels = { 1: '1 - BAP', 2: `2 - ${lang === 'id' ? 'Ujian' : 'Exam'}`, 3: `3 - ${lang === 'id' ? 'Kegiatan' : 'Activity'}` }
        return labels[id as keyof typeof labels] || id
    }

    const getIsLuringLabel = (id: number) => {
        const labels = { 0: '0 - Online', 1: '1 - Offline', 2: '2 - Hybrid' }
        return labels[id as keyof typeof labels] || id
    }

    return (
        <div className="glass rounded-2xl border border-[var(--border)]">
            <div className="overflow-x-auto lg:overflow-x-visible custom-scrollbar">
                <table className="w-full">
                    <thead>
                        <tr className="bg-black/[0.03] dark:bg-white/[0.02] border-b border-[var(--border)]">
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] w-16">
                                {t.col_no}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] min-w-[120px] lg:min-w-0">
                                {t.col_waktu}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] min-w-[100px] lg:min-w-0">
                                {t.col_tstart}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] min-w-[100px] lg:min-w-0">
                                {t.col_tend}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] min-w-[100px] lg:min-w-0">
                                {t.col_jenis}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] min-w-[100px] lg:min-w-0">
                                {t.col_luring}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] min-w-[120px] lg:min-w-0">
                                {lang === 'id' ? 'Dosen' : 'Lecturer'}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] min-w-[130px] lg:min-w-0">
                                {t.col_lokasi}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] min-w-[180px] lg:min-w-0">
                                {t.col_ket}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-[var(--text-muted)] min-w-[120px] lg:min-w-0">
                                {t.col_file}
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-[var(--text-muted)] w-32">
                                {t.col_actions}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-[var(--border)] animate-pulse">
                                    {Array.from({ length: 11 }).map((_, j) => (
                                        <td key={j} className="px-6 py-4">
                                            <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full w-full"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : records.map((record, idx) => (
                            <tr
                                key={`${record.manifest_id}-${record.row_index}`}
                                className="border-b border-[var(--border)] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="px-6 py-4 text-sm font-bold text-[var(--text-primary)]">
                                    {idx + 1}
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                    {record.Waktu}
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                    {record.Tstart}
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                    {record.Tend}
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                    <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                                        {getJenisLogLabel(record.JenisLogId)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                    <span className={`px-3 py-1 rounded-lg font-bold text-xs ${record.IsLuring === 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                        record.IsLuring === 1 ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                                            'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                        }`}>
                                        {getIsLuringLabel(record.IsLuring)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                    <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-600 dark:text-gray-400 font-mono text-xs font-bold">
                                        ID: {record.Dosen}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)] min-w-[200px] whitespace-normal leading-relaxed">
                                    {record.Lokasi}
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)] min-w-[250px] whitespace-normal leading-relaxed">
                                    {record.Keterangan}
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-mono text-xs">
                                    {record.FilePath}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(record)}
                                            className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95"
                                            title={t.edit}
                                        >
                                            <PencilIcon />
                                        </button>
                                        <button
                                            onClick={() => onDelete(record)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
                                            title={t.delete}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >
        </div >
    )
}
