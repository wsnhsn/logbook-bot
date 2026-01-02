import React, { useState, useEffect, useRef } from 'react'
// @ts-ignore
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react'
import { Language, translations } from '@/utils/translations'
import axios from 'axios'

interface Message {
    id: number
    text: string
    sender: 'user' | 'assistant'
    timestamp: Date
}

const RobotIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 40C25 31.7157 31.7157 25 40 25H60C68.2843 25 75 31.7157 75 40V55C75 63.2843 68.2843 70 60 70H40C31.7157 70 25 63.2843 25 55V40Z" fill="white" stroke="currentColor" strokeWidth="4" />
        <path d="M35 45H65V60H35V45Z" fill="#1e293b" />
        <circle cx="42" cy="52.5" r="3.5" fill="#1ba94c" className="animate-pulse" />
        <circle cx="58" cy="52.5" r="3.5" fill="#1ba94c" className="animate-pulse" />
        <path d="M46 58C46 58 47.5 60 50 60C52.5 60 54 58 54 58" stroke="#1ba94c" strokeWidth="2" strokeLinecap="round" />
        <path d="M25 45V55" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M75 45V55" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <rect x="42" y="15" width="16" height="10" rx="4" fill="currentColor" />
        <path d="M50 25V15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="12" r="3" fill="#1ba94c" />
        <path d="M40 70V80C40 85.5228 35.5228 90 30 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M60 70V80C60 85.5228 64.4772 90 70 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
)

export default function AssistantBuddy({ lang }: { lang: Language }) {
    const t = translations[lang] || translations['id']
    const [isOpen, setIsOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [showBubble, setShowBubble] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const isOpenRef = useRef(false)

    // Sync ref for timeout closure
    useEffect(() => {
        isOpenRef.current = isOpen
    }, [isOpen])

    // Draggable Logic
    const [position, setPosition] = useState({ x: 80, y: 80 }) // Distance from right, bottom
    const [isDragging, setIsDragging] = useState(false)
    const dragStartPos = useRef({ x: 0, y: 0 })
    const dragOffset = useRef({ x: 0, y: 0 })
    const hasDragged = useRef(false)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return

            const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
            const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY

            // Calculate new distances from right and bottom
            const newX = window.innerWidth - clientX - dragOffset.current.x
            const newY = window.innerHeight - clientY - dragOffset.current.y

            // Boundary checks
            const padding = 20
            const boundedX = Math.min(Math.max(newX, padding), window.innerWidth - padding - 60)
            const boundedY = Math.min(Math.max(newY, padding), window.innerHeight - padding - 60)

            setPosition({ x: boundedX, y: boundedY })

            if (Math.abs(clientX - dragStartPos.current.x) > 5 || Math.abs(clientY - dragStartPos.current.y) > 5) {
                hasDragged.current = true
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            window.addEventListener('touchmove', handleMouseMove, { passive: false })
            window.addEventListener('touchend', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('touchmove', handleMouseMove)
            window.removeEventListener('touchend', handleMouseUp)
        }
    }, [isDragging])

    const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

        setIsDragging(true)
        hasDragged.current = false
        dragStartPos.current = { x: clientX, y: clientY }
        dragOffset.current = {
            x: window.innerWidth - clientX - position.x,
            y: window.innerHeight - clientY - position.y
        }
    }

    // Intermittent Popup Logic
    useEffect(() => {
        const checkVisibility = () => {
            const lastShown = localStorage.getItem('assistant_last_shown')
            const now = Date.now()
            const cooldown = 3 * 60 * 1000 // 3 minutes

            // Re-appear every 3 minutes if not manually hidden
            if (!lastShown || (now - parseInt(lastShown)) > cooldown) {
                setIsVisible(true)
                setShowBubble(true)

                // Auto-hide EVERYTHING after 15 seconds if not opened
                setTimeout(() => {
                    if (!isOpenRef.current) {
                        setIsVisible(false)
                        setShowBubble(false)
                        localStorage.setItem('assistant_last_shown', Date.now().toString())
                    }
                }, 15000)
            }
        }

        // Check immediately after a small delay
        const initialTimer = setTimeout(checkVisibility, 2000)

        // Then check every 30 seconds to see if cooldown has passed
        const interval = setInterval(checkVisibility, 30000)

        return () => {
            clearTimeout(initialTimer)
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isThinking])

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const userMsg: Message = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInputValue('')
        setIsThinking(true)

        try {
            const response = await axios.post('/api/assistant', {
                query: inputValue,
                lang: lang
            })

            const assistantMsg: Message = {
                id: Date.now() + 1,
                text: response.data.response || t.assistant_not_found,
                sender: 'assistant',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, assistantMsg])
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: t.assistant_not_found,
                sender: 'assistant',
                timestamp: new Date()
            }])
        } finally {
            setIsThinking(false)
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        setIsOpen(false)
        localStorage.setItem('assistant_last_shown', Date.now().toString())
    }

    if (!isVisible) return null

    return (
        <div
            className="fixed z-[9999] flex flex-col items-end pointer-events-none transition-none"
            style={{
                right: position.x - 32, // Offset to make the icon center roughly at the position
                bottom: position.y - 32,
            }}
        >
            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto w-[350px] max-h-[500px] mb-4 glass rounded-3xl border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header - Drag Handle */}
                    <div
                        onMouseDown={onMouseDown}
                        onTouchStart={onMouseDown}
                        className="p-5 bg-[var(--prime-bg)] border-b border-[var(--border)] flex items-center justify-between cursor-grab active:cursor-grabbing"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--prime)] flex items-center justify-center text-white">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[12px] font-black uppercase tracking-widest text-[var(--prime)]">Logbook Buddy</h4>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Support AI Alpha</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] transition-all pointer-events-auto"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar min-h-[300px]"
                    >
                        {messages.length === 0 && (
                            <div className="text-center py-8 space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--prime-bg)] text-[var(--prime)] flex items-center justify-center mx-auto mb-2">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed px-4">
                                    {t.assistant_greeting}
                                </p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in zoom-in-95 duration-200`}
                            >
                                <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${msg.sender === 'user'
                                    ? 'bg-[var(--prime)] text-white rounded-tr-none'
                                    : 'bg-black/5 dark:bg-white/5 border border-[var(--border)] text-[var(--text-primary)] rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-black/5 dark:bg-white/5 border border-[var(--border)] p-4 rounded-2xl rounded-tl-none animate-pulse">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--prime)] animate-bounce" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--prime)] animate-bounce delay-150" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--prime)] animate-bounce delay-300" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/5 border-t border-[var(--border)] flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendMessage()
                            }}
                            placeholder={t.assistant_placeholder}
                            className="flex-1 bg-black/5 dark:bg-white/5 border border-[var(--border)] rounded-xl px-4 py-2.5 text-[11px] outline-none focus:border-[var(--prime)] transition-all"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isThinking}
                            className="w-10 h-10 rounded-xl bg-[var(--prime)] text-white flex items-center justify-center disabled:opacity-50 transition-all active:scale-90 shadow-lg shadow-[var(--prime-glow)]"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Bubble & Trigger */}
            <div className={`flex items-center gap-4 pointer-events-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                {showBubble && !isOpen && (
                    <div className="bg-[var(--prime)] text-white px-5 py-3 rounded-2xl rounded-br-none shadow-xl animate-in fade-in slide-in-from-right-4 duration-500 whitespace-nowrap">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Logbook Buddy</p>
                        <p className="text-[11px] font-medium">{t.assistant_ask_me}</p>
                    </div>
                )}
                <div className="relative group">
                    <button
                        onMouseDown={onMouseDown}
                        onTouchStart={onMouseDown}
                        onClick={(e) => {
                            if (!hasDragged.current) {
                                setIsOpen(!isOpen)
                                setShowBubble(false)
                            }
                        }}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${isOpen
                            ? 'bg-red-500 rotate-90 text-white p-4'
                            : 'bg-white dark:bg-slate-900 border-2 border-[var(--prime)] text-[var(--text-primary)] hover:scale-110 p-0 overflow-hidden'
                            } shadow-[var(--prime-glow)] touch-none`}
                    >
                        {isOpen ? <X className="w-8 h-8" /> : <RobotIcon className="w-full h-full" />}
                    </button>
                    {!isOpen && (
                        <button
                            onClick={handleClose}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-[var(--bg-primary)]"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .glass {
                    background: var(--bg-secondary);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    )
}
