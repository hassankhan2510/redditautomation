"use client"

import { useState } from "react"
import { Twitter, Send, Copy, ExternalLink, Loader2 } from "lucide-react"

export default function XPage() {
    const [topic, setTopic] = useState("")
    const [tone, setTone] = useState("viral-hook")
    const [generatedContent, setGeneratedContent] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic) return
        setLoading(true)
        setGeneratedContent([])

        try {
            const res = await fetch('/api/x', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, tone })
            })

            if (res.ok) {
                const data = await res.json()
                setGeneratedContent(data.tweets)
            }
        } catch (e) {
            console.error(e)
            alert("Failed to generate")
        } finally {
            setLoading(false)
        }
    }

    const getTweetUrl = (text: string) => {
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Twitter size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">X Content Generator</h1>
                    <p className="text-muted-foreground">Turn raw thoughts into engagement-ready posts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Input Section */}
                <div className="md:col-span-2 space-y-4">
                    <form onSubmit={handleGenerate} className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">What's happening? (Topic/News)</label>
                                <textarea
                                    className="w-full bg-background border rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="e.g. DeepSeek just released a new model that outperforms GPT-4 on coding tasks..."
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Style / Angle</label>
                                <select
                                    className="w-full bg-background border rounded-lg p-2.5"
                                    value={tone}
                                    onChange={e => setTone(e.target.value)}
                                >
                                    <option value="viral-hook">🔥 Viral Hook (Short & Punchy)</option>
                                    <option value="thread">Hilo / Thread Starter</option>
                                    <option value="contrarian">🤔 Contrarian/Opinion</option>
                                    <option value="news">📰 Breaking News</option>
                                    <option value="memetic">🤪 Casual / Memetic</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {loading ? "Thinking..." : "Generate Tweets"}
                            </button>
                        </div>
                    </form>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                        <strong>Pro Tip:</strong> Paste a full article summary or just a messy thought. The AI will structure it for maximum generic reach.
                    </div>
                </div>

                {/* Output Section */}
                <div className="md:col-span-3 space-y-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground animate-pulse">
                            <Twitter size={48} className="mb-4 opacity-50" />
                            <p>Analyzing trend...</p>
                            <p className="text-xs">Crafting hooks...</p>
                        </div>
                    )}

                    {!loading && generatedContent.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground">
                            <p>Ready to generate.</p>
                        </div>
                    )}

                    {generatedContent.map((tweet, idx) => (
                        <div key={idx} className="bg-card border rounded-xl p-5 hover:border-blue-500/40 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-mono text-muted-foreground">Option {idx + 1}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(tweet)}
                                        className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                                        title="Copy Text"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="whitespace-pre-wrap mb-4 text-base leading-relaxed">
                                {tweet}
                            </p>

                            <button
                                onClick={() => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank')}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                            >
                                <Twitter size={16} /> Post now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
