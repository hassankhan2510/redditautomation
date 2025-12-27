"use client"

import { useState } from "react"
import { Repeat, ArrowRight, Copy, Loader2, Linkedin, Twitter, MessageCircle } from "lucide-react"

export default function RepurposePage() {
    const [originalContent, setOriginalContent] = useState("")
    const [targetPlatform, setTargetPlatform] = useState("linkedin")
    const [voicePreset, setVoicePreset] = useState("influencer")
    const [language, setLanguage] = useState<'en' | 'ur'>('en')

    const [drafts, setDrafts] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    // Reusing the same presets for consistency
    const PRESETS: Record<string, { persona: string, tone: string, label: string }> = {
        "influencer": { persona: "Viral Influencer", tone: "viral-hook", label: "🔥 Viral Influencer" },
        "journalist": { persona: "Professional Journalist", tone: "news", label: "📰 Journalist" },
        "entrepreneur": { persona: "Tech Entrepreneur", tone: "thread", label: "💡 Entrepreneur" },
        "contrarian": { persona: "Thought Leader", tone: "contrarian", label: "🤔 Contrarian" },
        "personal": { persona: "Personal Brand", tone: "authentic", label: "👤 Personal Brand" },
    }

    const handleTransform = async () => {
        if (!originalContent) return
        setLoading(true)
        setDrafts([])

        const { persona, tone } = PRESETS[voicePreset]

        try {
            const res = await fetch('/api/repurpose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalContent,
                    targetPlatform,
                    persona,
                    tone,
                    language
                })
            })

            if (res.ok) {
                const data = await res.json()
                setDrafts(data.drafts)
            }
        } catch (e) {
            console.error(e)
            alert("Transformation failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl" suppressHydrationWarning>
            <div className="mb-8">
                <div className="flex items-center gap-2 text-violet-500 mb-2">
                    <Repeat size={32} />
                    <h1 className="text-3xl font-bold text-foreground">Content Repurposing Engine</h1>
                </div>
                <p className="text-muted-foreground">Turn one good idea into optimized content for every platform.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">

                {/* LEFT: INPUT */}
                <div className="flex flex-col space-y-4 bg-card border rounded-xl p-6 shadow-sm">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <span>1. Original Content</span>
                    </h2>
                    <textarea
                        className="flex-1 w-full bg-background border rounded-lg p-4 resize-none focus:ring-2 focus:ring-violet-500 outline-none"
                        placeholder="Paste your blog post, email, or brain dump here..."
                        value={originalContent}
                        onChange={(e) => setOriginalContent(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Platform</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setTargetPlatform('linkedin')}
                                    className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${targetPlatform === 'linkedin' ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-accent'}`}
                                >
                                    <Linkedin size={18} />
                                    <span className="text-[10px] font-bold">LinkedIn</span>
                                </button>
                                <button
                                    onClick={() => setTargetPlatform('x')}
                                    className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${targetPlatform === 'x' ? 'bg-black text-white border-black dark:bg-white dark:text-black' : 'hover:bg-accent'}`}
                                >
                                    <Twitter size={18} />
                                    <span className="text-[10px] font-bold">X</span>
                                </button>
                                <button
                                    onClick={() => setTargetPlatform('reddit')}
                                    className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${targetPlatform === 'reddit' ? 'bg-orange-500 text-white border-orange-500' : 'hover:bg-accent'}`}
                                >
                                    <MessageCircle size={18} />
                                    <span className="text-[10px] font-bold">Reddit</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Language Toggle */}
                            <div>
                                <label className="block text-xs font-bold mb-1 text-muted-foreground uppercase">Language</label>
                                <div className="flex bg-secondary p-1 rounded-md">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`flex-1 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                                    >EN</button>
                                    <button
                                        onClick={() => setLanguage('ur')}
                                        className={`flex-1 py-1 text-xs font-bold rounded ${language === 'ur' ? 'bg-background shadow' : 'text-muted-foreground'}`}
                                    >UR</button>
                                </div>
                            </div>

                            {/* Voice Selector */}
                            <div>
                                <label className="block text-xs font-bold mb-1 text-muted-foreground uppercase">Voice</label>
                                <select
                                    className="w-full bg-background border rounded p-1.5 text-sm"
                                    value={voicePreset}
                                    onChange={(e) => setVoicePreset(e.target.value)}
                                >
                                    {Object.entries(PRESETS).map(([key, config]) => (
                                        <option key={key} value={key}>{config.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleTransform}
                        disabled={loading || !originalContent}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Repeat size={18} />}
                        {loading ? "Transforming..." : "Transform Content"}
                    </button>
                </div>

                {/* RIGHT: OUTPUT */}
                <div className="flex flex-col space-y-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <span>2. Generated Drafts</span>
                        {drafts.length > 0 && <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">Ready</span>}
                    </h2>

                    <div className="flex-1 bg-secondary/30 rounded-xl p-4 overflow-y-auto space-y-4 border">
                        {drafts.length === 0 && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <ArrowRight size={48} className="mb-4" />
                                <p>Generated content will appear here</p>
                            </div>
                        )}

                        {loading && (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-32 bg-secondary rounded-lg"></div>
                                ))}
                            </div>
                        )}

                        {drafts.map((draft, idx) => (
                            <div key={idx} className="bg-card border rounded-lg p-4 group hover:border-violet-500/50 transition-all relative">
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(draft)}
                                        className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                                        title="Copy"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <span className="text-xs font-mono text-muted-foreground block mb-2">Option {idx + 1}</span>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{draft}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
