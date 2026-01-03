"use client"

import { useState } from "react"
import { MessageCircle, Zap, RefreshCw, Copy, ExternalLink, Loader2 } from "lucide-react"

export default function ReplyGuyPage() {
    const [topic, setTopic] = useState("SaaS")
    const [threads, setThreads] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState<string | null>(null)
    const [replies, setReplies] = useState<Record<string, string>>({})

    const scan = async () => {
        setLoading(true)
        setThreads([])
        try {
            const res = await fetch('/api/scout', {
                method: 'POST',
                body: JSON.stringify({ keyword: topic })
            })
            const data = await res.json()
            if (data.leads) setThreads(data.leads.slice(0, 5)) // Top 5 only
        } catch (e) {
            alert("Scan failed")
        }
        setLoading(false)
    }

    const generateReply = async (threadId: string, context: string, mode: string) => {
        setGenerating(threadId)
        try {
            const res = await fetch('/api/repurpose', {
                method: 'POST',
                body: JSON.stringify({
                    originalContent: context,
                    targetPlatform: 'reddit', // Reusing the "Authentic" engine
                    tone: mode === 'value' ? 'Helpful Expert' : (mode === 'question' ? 'Curious Learner' : 'Witty Commenter')
                })
            })
            const data = await res.json()
            if (data.drafts) {
                setReplies(prev => ({ ...prev, [threadId]: data.drafts[0] }))
            }
        } catch (e) {
            alert("Generation failed")
        }
        setGenerating(null)
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl min-h-screen">

            {/* HER */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-black mb-4 flex items-center justify-center gap-3">
                    <span className="bg-blue-600 text-white p-3 rounded-2xl transform -rotate-6"><MessageCircle size={40} /></span>
                    The Reply Guy
                </h1>
                <p className="text-xl text-muted-foreground">Grow 5x faster by engaging in top conversations.</p>
            </div>

            {/* SCANNER */}
            <div className="glass-panel p-2 rounded-full flex gap-2 max-w-lg mx-auto mb-12 shadow-2xl border border-white/10">
                <input
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Topic (e.g. AI News)"
                    className="flex-1 bg-transparent px-6 py-3 outline-none text-white placeholder:text-white/30"
                />
                <button
                    onClick={scan}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 font-bold flex items-center gap-2 transition disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                    Scan
                </button>
            </div>

            {/* RESULTS */}
            <div className="space-y-6">
                {threads.map((thread, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>

                        {/* THREAD INFO */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg mb-1 line-clamp-1">{thread.title}</h3>
                                <p className="text-sm text-zinc-400 line-clamp-2">{thread.snippet}</p>
                            </div>
                            <a href={thread.link} target="_blank" className="text-blue-400 hover:text-blue-300">
                                <ExternalLink size={20} />
                            </a>
                        </div>

                        {/* ACTION AREA */}
                        <div className="bg-black/30 rounded-xl p-4">
                            {!replies[thread.link] ? (
                                <div className="flex gap-2">
                                    <ReplyButton
                                        icon={<Zap size={16} />}
                                        label="Value Add"
                                        onClick={() => generateReply(thread.link, thread.title + " " + thread.snippet, 'value')}
                                        loading={generating === thread.link}
                                    />
                                    <ReplyButton
                                        icon={<MessageCircle size={16} />}
                                        label="Ask Question"
                                        onClick={() => generateReply(thread.link, thread.title + " " + thread.snippet, 'question')}
                                        loading={generating === thread.link}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <textarea
                                        className="w-full bg-transparent text-white resize-none outline-none min-h-[80px]"
                                        defaultValue={replies[thread.link]}
                                    />
                                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/10">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(replies[thread.link])}
                                            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1"
                                        >
                                            <Copy size={12} /> Copy
                                        </button>
                                        <button
                                            onClick={() => setReplies(prev => { const n = { ...prev }; delete n[thread.link]; return n; })}
                                            className="text-xs font-bold text-zinc-400 hover:text-white"
                                        >
                                            Regenerate
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}

function ReplyButton({ icon, label, onClick, loading }: any) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-3 flex items-center justify-center gap-2 font-medium text-sm transition disabled:opacity-50"
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : icon}
            {label}
        </button>
    )
}
