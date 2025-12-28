"use client"

import { useState } from "react"
import { Copy, RefreshCcw, Sparkles, Loader2, Wand2 } from "lucide-react"

export default function RemixPage() {
    const [content, setContent] = useState("")
    const [context, setContext] = useState("")
    const [tone, setTone] = useState("Professional")
    const [variations, setVariations] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const handleRemix = async () => {
        if (!content) return
        setLoading(true)
        setVariations([])

        try {
            const res = await fetch('/api/remix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, context, tone })
            })

            const data = await res.json()
            if (data.variations) setVariations(data.variations)
        } catch (e) {
            alert("Failed to remix")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl" suppressHydrationWarning>
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <RefreshCcw className="text-pink-500" />
                    The Remix Vault
                </h1>
                <p className="text-muted-foreground">Steal the structure. Rewrite the content.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: INPUT */}
                <div className="space-y-6">
                    <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                                <Sparkles size={14} className="text-yellow-500" />
                                Viral Inspiration
                            </label>
                            <textarea
                                className="w-full h-40 bg-background border rounded-lg p-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                                placeholder="Paste a tweet or post you want to mimic..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase text-muted-foreground">My Niche / Topic</label>
                                <input
                                    className="w-full bg-background border rounded p-2 text-sm"
                                    placeholder="e.g. SaaS Marketing"
                                    value={context}
                                    onChange={e => setContext(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase text-muted-foreground">Tone</label>
                                <select
                                    className="w-full bg-background border rounded p-2 text-sm"
                                    value={tone}
                                    onChange={e => setTone(e.target.value)}
                                >
                                    <option>Professional</option>
                                    <option>Casual</option>
                                    <option>Contrarian</option>
                                    <option>Humorous</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleRemix}
                            disabled={loading || !content}
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                            {loading ? "Remixing..." : "Remix Content"}
                        </button>
                    </div>
                </div>

                {/* RIGHT: OUTPUT */}
                <div className="space-y-4">
                    {variations.length === 0 && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 border-2 border-dashed rounded-xl p-8">
                            <RefreshCcw size={48} className="mb-4" />
                            <p>Waiting for input...</p>
                        </div>
                    )}

                    {variations.map((v, i) => (
                        <div key={i} className="bg-secondary/20 border rounded-xl p-6 relative group hover:border-pink-500/50 transition">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{v}</p>
                            <button
                                onClick={() => navigator.clipboard.writeText(v)}
                                className="absolute top-4 right-4 p-2 bg-background border rounded opacity-0 group-hover:opacity-100 transition hover:text-pink-500"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}
