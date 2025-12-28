"use client"

import { useState, useEffect } from "react"
import { Send, Copy, Loader2, Sparkles, RefreshCcw, ExternalLink, Zap } from "lucide-react"

export default function ReplyPage() {
    const [targetTweet, setTargetTweet] = useState("")
    const [goal, setGoal] = useState("Gain followers")
    const [voicePreset, setVoicePreset] = useState("influencer")
    const [language, setLanguage] = useState<'en' | 'ur'>('en')

    const [replies, setReplies] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    // Trends State
    const [trends, setTrends] = useState<any[]>([])
    const [trendsLoading, setTrendsLoading] = useState(false)



    const fetchTrends = async () => {
        setTrendsLoading(true)
        try {
            const res = await fetch('/api/trends')
            const data = await res.json()
            if (data.trends) setTrends(data.trends)
        } catch (e) {
            console.error(e)
        } finally {
            setTrendsLoading(false)
        }
    }

    const useTrend = (trend: any) => {
        setTargetTweet(`Topic: ${trend.title}\nSource: ${trend.source}`)
        setGoal("Share a unique expert insight")
    }

    // Reusing presets
    const PRESETS: Record<string, { persona: string, tone: string, label: string }> = {
        "influencer": { persona: "Viral Influencer", tone: "viral-hook", label: "🔥 Viral Influencer" },
        "journalist": { persona: "Professional Journalist", tone: "news", label: "📰 Journalist" },
        "entrepreneur": { persona: "Tech Entrepreneur", tone: "thread", label: "💡 Entrepreneur" },
        "shitposter": { persona: "Casual User", tone: "memetic", label: "🤪 Shitposter (Meme)" },
        "developer": { persona: "Senior Dev", tone: "technical", label: "💻 Developer" },
    }

    const handleGenerate = async () => {
        if (!targetTweet) return
        setLoading(true)
        setReplies([])

        const { persona, tone } = PRESETS[voicePreset]

        try {
            const res = await fetch('/api/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetTweet,
                    goal,
                    persona,
                    tone,
                    language
                })
            })

            if (res.ok) {
                const data = await res.json()
                setReplies(data.replies)
            }
        } catch (e) {
            console.error(e)
            alert("Generation failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-7xl" suppressHydrationWarning>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
                <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                    <Zap size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Reply Guy Engine</h1>
                    <p className="text-muted-foreground">Hijack viral conversations with high-status replies.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 1. TRENDS SIDEBAR (4 Cols) */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-card border rounded-xl p-4 shadow-sm h-[calc(100vh-200px)] flex flex-col">
                        <div className="flex flex-col gap-3 mb-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <Sparkles size={16} className="text-yellow-500" />
                                    Viral Topics
                                </h2>
                                <button
                                    onClick={() => setShowCustomInput(!showCustomInput)}
                                    className="text-[10px] bg-secondary px-2 py-1 rounded border hover:bg-accent"
                                >
                                    + Custom
                                </button>
                            </div>

                            {/* CATEGORY TABS */}
                            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                                {['tech', 'business', 'stock', 'politics'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setFeedMode('category'); setActiveCategory(cat) }}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${feedMode === 'category' && activeCategory === cat
                                            ? 'bg-green-600 text-white'
                                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                {/* Region Toggles as mini pills */}
                                <button
                                    onClick={() => { setFeedMode('region'); setActiveRegion('global') }}
                                    className={`px-2 py-1 rounded-full text-[10px] border font-bold ${feedMode === 'region' && activeRegion === 'global' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
                                >Global</button>
                                <button
                                    onClick={() => { setFeedMode('region'); setActiveRegion('pk') }}
                                    className={`px-2 py-1 rounded-full text-[10px] border font-bold ${feedMode === 'region' && activeRegion === 'pk' ? 'bg-green-600 text-white border-green-600' : 'text-muted-foreground'}`}
                                >PK</button>
                            </div>
                        </div>

                        {showCustomInput && (
                            <div className="mb-4 p-2 bg-secondary/50 rounded-lg space-y-2">
                                <input
                                    className="w-full text-xs p-2 rounded border"
                                    placeholder="Paste RSS Link..."
                                    value={customUrl}
                                    onChange={e => setCustomUrl(e.target.value)}
                                />
                                <button
                                    onClick={handleAddSource}
                                    className="w-full text-xs bg-green-600 text-white font-bold py-1 rounded"
                                >
                                    Load Feed
                                </button>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {trendsLoading ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                            ) : trends.map((trend: any, i) => (
                                <div key={i} className="group border rounded-lg p-3 hover:bg-accent/50 transition cursor-pointer" onClick={() => useTrend(trend)}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{trend.source}</span>
                                        <ExternalLink size={10} className="text-muted-foreground" />
                                    </div>
                                    <h3 className="text-sm font-medium leading-normal mb-2">{trend.title}</h3>
                                    <button
                                        className="w-full py-1.5 bg-green-500/10 text-green-600 text-xs font-bold rounded hover:bg-green-500/20 transition"
                                    >
                                        Hijack this Topic
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. GENERATOR (8 Cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* INPUT SECTION */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Target Tweet / Topic</label>
                            <textarea
                                className="w-full bg-background border rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-green-500 outline-none resize-none text-sm"
                                placeholder="Paste a tweet you want to reply to, or select a topic from the left..."
                                value={targetTweet}
                                onChange={e => setTargetTweet(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 text-muted-foreground uppercase">Your Goal</label>
                                <input
                                    className="w-full bg-background border rounded p-2 text-sm"
                                    value={goal}
                                    onChange={e => setGoal(e.target.value)}
                                    placeholder="e.g. Gain followers"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 text-muted-foreground uppercase">Voice</label>
                                <select
                                    className="w-full bg-background border rounded p-2 text-sm"
                                    value={voicePreset}
                                    onChange={(e) => setVoicePreset(e.target.value)}
                                >
                                    {Object.entries(PRESETS).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 text-muted-foreground uppercase">Language</label>
                                <div className="flex bg-secondary p-1 rounded-md">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded transition ${language === 'en' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                                    >English</button>
                                    <button
                                        onClick={() => setLanguage('ur')}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded transition ${language === 'ur' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                                    >Urdu</button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !targetTweet}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                            {loading ? "Drafting High-Status Replies..." : "Generate Replies"}
                        </button>
                    </div>

                    {/* OUTPUT SECTION */}
                    <div className="bg-secondary/20 border rounded-xl p-6 flex-1 min-h-[300px]">
                        <h3 className="font-semibold text-muted-foreground mb-4 uppercase text-xs tracking-wider">Generated Drafts</h3>

                        {!loading && replies.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
                                <Sparkles size={32} className="mb-2" />
                                <p>Ready to generate</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {replies.map((reply, idx) => (
                                <div key={idx} className="bg-card border rounded-xl p-4 hover:border-green-500/50 transition shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold px-2 py-1 bg-secondary rounded text-muted-foreground">
                                            {idx === 0 ? "💡 The Insight" : idx === 1 ? "🥊 The Counter" : "⚡ The Wit"}
                                        </span>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(reply)}
                                            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                                            title="Copy"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <p className="text-sm leading-relaxed">{reply}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
