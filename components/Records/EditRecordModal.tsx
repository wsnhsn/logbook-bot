import { useState, useEffect } from 'react'
import { Record } from '@/types/record'
import { translations } from '@/utils/translations'
// @ts-ignore
import { Check, X } from 'lucide-react'

interface EditRecordModalProps {
    record: Record
    onSave: (updatedRecord: Partial<Record>) => void
    onClose: () => void
    lang: 'id' | 'en'
}

// Helper to convert DD/MM/YYYY to YYYY-MM-DD for input type="date"
const ddmmyyyy_to_yyyymmdd = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('/')) return ''
    const [d, m, y] = dateStr.split('/')
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

// Helper to convert YYYY-MM-DD back to DD/MM/YYYY for storage
const yyyymmdd_to_ddmmyyyy = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return ''
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="glass rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-[var(--border)] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-10 py-8 border-b border-[var(--border)] flex items-center justify-between bg-black/5 dark:bg-white/5">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-[0.3em] text-[var(--prime)] uppercase">{t.records}</span>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--text-primary)] italic leading-none">
                            {t.edit_record}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20 active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    {/* section: Time & Date */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 opacity-30">
                            <div className="h-[1px] flex-1 bg-[var(--border)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'id' ? 'Waktu & Jadwal' : 'Time & Schedule'}</span>
                            <div className="h-[1px] flex-1 bg-[var(--border)]" />
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
                                {lang === 'id' ? 'TANGGAL KEGIATAN' : 'ACTIVITY DATE'}
                            </label>
                            <input
                                type="date"
                                value={ddmmyyyy_to_yyyymmdd(formData.Waktu)}
                                onChange={(e) => handleChange('Waktu', yyyymmdd_to_ddmmyyyy(e.target.value))}
                                className="input-field w-full !py-4 font-bold border-[var(--border)] focus:!border-[var(--prime)]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
                                    {lang === 'id' ? 'JAM MULAI' : 'START TIME'}
                                </label>
                                <input
                                    type="time"
                                    value={formData.Tstart}
                                    onChange={(e) => handleChange('Tstart', e.target.value)}
                                    className="input-field w-full !py-4 font-bold border-[var(--border)] focus:!border-[var(--prime)]"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
                                    {lang === 'id' ? 'JAM SELESAI' : 'END TIME'}
                                </label>
                                <input
                                    type="time"
                                    value={formData.Tend}
                                    onChange={(e) => handleChange('Tend', e.target.value)}
                                    className="input-field w-full !py-4 font-bold border-[var(--border)] focus:!border-[var(--prime)]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* section: Classification */}
                    <div className="space-y-6 pt-2">
                        <div className="flex items-center gap-3 opacity-30">
                            <div className="h-[1px] flex-1 bg-[var(--border)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'id' ? 'Klasifikasi' : 'Classification'}</span>
                            <div className="h-[1px] flex-1 bg-[var(--border)]" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
                                    {lang === 'id' ? 'JENIS LOGBOOK' : 'LOGBOOK TYPE'}
                                </label>
                                <select
                                    value={formData.JenisLogId}
                                    onChange={(e) => handleChange('JenisLogId', parseInt(e.target.value))}
                                    className="input-field w-full !py-4 font-bold border-[var(--border)] focus:!border-[var(--prime)] appearance-none cursor-pointer"
                                >
                                    <option value={1}>BAP</option>
                                    <option value={2}>{lang === 'id' ? 'Ujian' : 'Exam'}</option>
                                    <option value={3}>{lang === 'id' ? 'Kegiatan' : 'Activity'}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
                                    {t.col_luring}
                                </label>
                                <select
                                    value={formData.IsLuring}
                                    onChange={(e) => handleChange('IsLuring', parseInt(e.target.value))}
                                    className="input-field w-full !py-4 font-bold border-[var(--border)] focus:!border-[var(--prime)] appearance-none cursor-pointer"
                                >
                                    <option value={0}>Online</option>
                                    <option value={1}>Offline</option>
                                    <option value={2}>Hybrid</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* section: Info Details */}
                    <div className="space-y-6 pt-2">
                        <div className="flex items-center gap-3 opacity-30">
                            <div className="h-[1px] flex-1 bg-[var(--border)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'id' ? 'Detail Tambahan' : 'Additional details'}</span>
                            <div className="h-[1px] flex-1 bg-[var(--border)]" />
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
                                {lang === 'id' ? 'LOKASI / LINK' : 'LOCATION / LINK'}
                            </label>
                            <input
                                type="text"
                                value={formData.Lokasi}
                                onChange={(e) => handleChange('Lokasi', e.target.value)}
                                className="input-field w-full !py-4 font-bold border-[var(--border)] focus:!border-[var(--prime)]"
                                placeholder="Meeting Room / https://meet.google.com/..."
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
                                {lang === 'id' ? 'NAMA FILE FOTO' : 'PHOTO FILENAME'}
                            </label>
                            <input
                                type="text"
                                value={formData.FilePath}
                                onChange={(e) => handleChange('FilePath', e.target.value)}
                                className="input-field w-full !py-4 font-bold border-[var(--border)] focus:!border-[var(--prime)]"
                                placeholder="foto1.png"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2.5">
                                {lang === 'id' ? 'ID DOSEN PEMBIMBING' : 'LECTURER ID'}
                                <span className="normal-case font-medium opacity-50 ml-auto border-l border-[var(--border)] pl-3">ex: 1</span>
                            </label>
                            <input
                                type="text"
                                value={formData.Dosen}
                                onChange={(e) => handleChange('Dosen', e.target.value)}
                                className="input-field w-full !py-4 font-bold border-[var(--border)] focus:!border-[var(--prime)]"
                                placeholder="1"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    {lang === 'id' ? 'KETERANGAN KEGIATAN' : 'ACTIVITY DESCRIPTION'}
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAIRefine}
                                    disabled={isGenerating || !formData.Keterangan.trim()}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${aiStatus === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        aiStatus === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            isGenerating ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse' :
                                                'bg-[var(--prime-bg)] text-[var(--prime)] border-[var(--prime)]/20 hover:scale-105 active:scale-95'
                                        } disabled:opacity-50 disabled:grayscale disabled:scale-100`}
                                >
                                    {aiStatus === 'success' ? <Check className="w-3 h-3" /> : null}
                                    {isGenerating ? t.ai_generating : aiStatus === 'success' ? t.ai_success : aiStatus === 'error' ? t.ai_error : t.ai_refine}
                                </button>
                            </div>
                            <textarea
                                value={formData.Keterangan}
                                onChange={(e) => handleChange('Keterangan', e.target.value)}
                                className="input-field w-full min-h-[100px] !py-4 font-medium resize-none border-[var(--border)] focus:!border-[var(--prime)] leading-relaxed italic"
                                rows={4}
                                placeholder={t.ai_prompt_hint}
                            />
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="px-10 py-8 border-t border-[var(--border)] bg-black/5 dark:bg-white/5 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-8 py-4 rounded-2xl border-2 border-[var(--border)] text-[var(--text-primary)] font-black text-[11px] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
                    >
                        {t.cancel}
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="btn-primary flex-[1.5] flex items-center justify-center gap-3 !py-4 shadow-lg shadow-[var(--prime-glow)] group"
                    >
                        <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">{t.save}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
