import { useState, useEffect } from 'react'
import { Record } from '@/types/record'
import { translations } from '@/utils/translations'
// Custom SVG Icons
const XIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
)

const SaveIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
)

const SparklesIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        <path d="M5 3l1 1" />
        <path d="M19 3l-1 1" />
        <path d="M5 21l1-1" />
        <path d="M19 21l-1-1" />
    </svg>
)

interface EditRecordModalProps {
    record: Record
    onSave: (updatedRecord: Partial<Record>) => void
    onClose: () => void
    lang: 'id' | 'en'
}

export default function EditRecordModal({ record, onSave, onClose, lang }: EditRecordModalProps) {
    const t = translations[lang]
    const [formData, setFormData] = useState({
        Waktu: record.Waktu,
        Tstart: record.Tstart,
        Tend: record.Tend,
        JenisLogId: record.JenisLogId,
        IsLuring: record.IsLuring,
        Lokasi: record.Lokasi,
        Keterangan: record.Keterangan,
        FilePath: record.FilePath,
        Dosen: record.Dosen
    })

    const [isGenerating, setIsGenerating] = useState(false)
    const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleAIRefine = async () => {
        if (!formData.Keterangan.trim() || isGenerating) return

        setIsGenerating(true)
        setAiStatus('loading')
        try {
            const response = await fetch('/api/generate-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: formData.Keterangan,
                    lang: lang
                })
            })

            const data = await response.json()
            if (data.success) {
                setFormData(prev => ({ ...prev, Keterangan: data.result }))
                setAiStatus('success')
                setTimeout(() => setAiStatus('idle'), 2000)
            } else {
                setAiStatus('error')
            }
        } catch (error) {
            console.error('AI Refinement error:', error)
            setAiStatus('error')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="sticky top-0 glass border-b border-[var(--border)] px-8 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">
                        {t.edit_record}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Waktu - Date */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                            {lang === 'id' ? 'Waktu (DD/MM/YYYY)' : 'Time (DD/MM/YYYY)'}
                        </label>
                        <input
                            type="text"
                            value={formData.Waktu}
                            onChange={(e) => handleChange('Waktu', e.target.value)}
                            className="input-field w-full"
                            placeholder="DD/MM/YYYY"
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                                {lang === 'id' ? 'Tstart (Jam Mulai: HH:MM)' : 'Tstart (Start Time: HH:MM)'}
                            </label>
                            <input
                                type="text"
                                value={formData.Tstart}
                                onChange={(e) => handleChange('Tstart', e.target.value)}
                                className="input-field w-full"
                                placeholder="HH:MM"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                                {lang === 'id' ? 'Tend (Jam Selesai: HH:MM)' : 'Tend (End Time: HH:MM)'}
                            </label>
                            <input
                                type="text"
                                value={formData.Tend}
                                onChange={(e) => handleChange('Tend', e.target.value)}
                                className="input-field w-full"
                                placeholder="HH:MM"
                            />
                        </div>
                    </div>

                    {/* Selects */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                                {lang === 'id' ? 'Jenis Logbook' : 'Type'}
                            </label>
                            <select
                                value={formData.JenisLogId}
                                onChange={(e) => handleChange('JenisLogId', parseInt(e.target.value))}
                                className="input-field w-full"
                            >
                                <option value={1}>1 - BAP</option>
                                <option value={2}>2 - {lang === 'id' ? 'Ujian' : 'Exam'}</option>
                                <option value={3}>3 - {lang === 'id' ? 'Kegiatan' : 'Activity'}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                                {lang === 'id' ? 'Mode Kegiatan' : 'Activity Mode'}
                            </label>
                            <select
                                value={formData.IsLuring}
                                onChange={(e) => handleChange('IsLuring', parseInt(e.target.value))}
                                className="input-field w-full"
                            >
                                <option value={0}>0 - Online</option>
                                <option value={1}>1 - Offline</option>
                                <option value={2}>2 - Hybrid</option>
                            </select>
                        </div>
                    </div>

                    {/* Lokasi */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                            {lang === 'id' ? 'Lokasi / Link Meeting' : 'Location / Meeting Link'}
                        </label>
                        <input
                            type="text"
                            value={formData.Lokasi}
                            onChange={(e) => handleChange('Lokasi', e.target.value)}
                            className="input-field w-full"
                            placeholder="Meeting Room / https://meet.google.com/..."
                        />
                    </div>

                    {/* FilePath */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                            {lang === 'id' ? 'Nama File Foto' : 'Photo Filename'}
                        </label>
                        <input
                            type="text"
                            value={formData.FilePath}
                            onChange={(e) => handleChange('FilePath', e.target.value)}
                            className="input-field w-full"
                            placeholder="foto1.png"
                        />
                    </div>

                    {/* Dosen */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                            {lang === 'id' ? 'ID Dosen Pembimbing (Sesuai Urutan di Portal, misal: 1 atau 1,2)' : 'Lecturer ID (Order in Portal, e.g., 1 or 1,2)'}
                        </label>
                        <input
                            type="text"
                            value={formData.Dosen}
                            onChange={(e) => handleChange('Dosen', e.target.value)}
                            className="input-field w-full"
                            placeholder="1"
                        />
                    </div>

                    {/* Keterangan */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                {lang === 'id' ? 'Keterangan Kegiatan' : 'Activity Description'}
                            </label>
                            <button
                                type="button"
                                onClick={handleAIRefine}
                                disabled={isGenerating || !formData.Keterangan.trim()}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${aiStatus === 'success' ? 'bg-green-500/20 text-green-500' :
                                    aiStatus === 'error' ? 'bg-red-500/20 text-red-500' :
                                        isGenerating ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                                            'bg-[var(--prime-bg)] text-[var(--prime)] hover:scale-105 active:scale-95'
                                    } disabled:opacity-50 disabled:grayscale disabled:scale-100`}
                            >
                                <SparklesIcon />
                                {isGenerating ? t.ai_generating : aiStatus === 'success' ? t.ai_success : aiStatus === 'error' ? t.ai_error : t.ai_refine}
                            </button>
                        </div>
                        <textarea
                            value={formData.Keterangan}
                            onChange={(e) => handleChange('Keterangan', e.target.value)}
                            className="input-field w-full min-h-[70px] resize-none"
                            rows={3}
                            placeholder={t.ai_prompt_hint}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-3">
                        <button
                            type="submit"
                            className="btn-primary flex-1 flex items-center justify-center gap-2 !py-3"
                        >
                            <SaveIcon />
                            {t.save}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-5 py-3 rounded-xl border-2 border-[var(--border)] text-[var(--text-primary)] font-black text-sm uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
                        >
                            {t.cancel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
