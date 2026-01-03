"use client"

import { useState, useEffect } from "react"
import { BookOpen, Sparkles, Share2, ExternalLink, Loader2, FileText, ArrowRight } from "lucide-react"

export default function FeedPage() {
    const [feedItems, setFeedItems] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [explanation, setExplanation] = useState("")
    const [loadingExp, setLoadingExp] = useState(false)
    const [loadingFeed, setLoadingFeed] = useState(true)

    useEffect(() => {
        fetchFeed()
    }, [])

    const fetchFeed = async () => {
        try {
            const res = await fetch('/api/feed')
            const data = await res.json()
            if (data.items) setFeedItems(data.items)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingFeed(false)
        }
    }

    const handleExplain = async () => {
        if (!selectedItem) return
        setLoadingExp(true)
        setExplanation("")
        try {
            const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: selectedItem.link }) // We scrape the URL
            })
            const data = await res.json()
            if (data.explanation) setExplanation(data.explanation)
        } catch (e) {
            alert("Failed to analyze")
        } finally {
            setLoadingExp(false)
        }
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">

            {/* SIDEBAR LIST */}
            <div className="w-[30%] lg:w-[25%] border-r bg-muted/10 overflow-y-auto p-4">
                <h2 className="font-bold mb-4 flex items-center gap-2 text-muted-foreground uppercase text-xs tracking-wider">
                    <BookOpen size={14} /> Knowledge Feed
                </h2>
                {loadingFeed ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : (
                    <div className="space-y-3">
                        {feedItems.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => { setSelectedItem(item); setExplanation(""); }}
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedItem?.link === item.link ? 'bg-background border-primary shadow-sm' : 'bg-background hover:bg-muted border-transparent'}`}
                            >
                                <div className="text-[10px] font-bold text-primary mb-1 uppercase bg-primary/10 w-fit px-2 py-0.5 rounded-full">{item.source}</div>
                                <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2">{item.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">{item.snippet}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto bg-background p-8 md:p-12">
                {selectedItem ? (
                    <div className="max-w-3xl mx-auto">
                        {/* HEADER */}
                        <div className="mb-8 border-b pb-8">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <span>{new Date(selectedItem.pubDate).toLocaleDateString()}</span>
                                <span>•</span>
                                <a href={selectedItem.link} target="_blank" className="flex items-center gap-1 hover:text-primary">
                                    Read Source <ExternalLink size={12} />
                                </a>
                            </div>
                            <h1 className="text-4xl font-black mb-6 leading-tight">{selectedItem.title}</h1>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleExplain}
                                    disabled={loadingExp}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50"
                                >
                                    {loadingExp ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                    {loadingExp ? "Analyzing..." : "Deep Explain (Feynman)"}
                                </button>

                                <a href={`/repurpose?url=${encodeURIComponent(selectedItem.link)}`} className="border bg-background hover:bg-muted px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition">
                                    <Share2 size={18} /> Repurpose
                                </a>
                            </div>
                        </div>

                        {/* EXPLANATION */}
                        {loadingExp && (
                            <div className="space-y-4 animate-pulse max-w-2xl">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-4 bg-muted rounded w-full"></div>
                                <div className="h-4 bg-muted rounded w-5/6"></div>
                                <p className="text-sm text-muted-foreground pt-4">Extracting patterns and mental models...</p>
                            </div>
                        )}

                        {explanation && (
                            <div className="prose dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-8">
                                <div className="bg-muted/30 p-6 rounded-xl border mb-8 flex items-start gap-4">
                                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 mt-1">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Deep Dive Analysis</h3>
                                        <p className="text-sm text-muted-foreground">Generated using the Feynman Technique. Purpose, Logic, and Mental Models extracted.</p>
                                    </div>
                                </div>
                                {/* Simple Markdown Renderer (using pre-wrap for now, ideally user has a markdown component) */}
                                <div className="whitespace-pre-wrap leading-relaxed">
                                    {explanation}
                                </div>
                            </div>
                        )}

                        {!explanation && !loadingExp && (
                            <div className="text-center py-20 opacity-30">
                                <FileText size={48} className="mx-auto mb-4" />
                                <p className="text-lg">Click "Deep Explain" to unlock this paper.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <BookOpen size={64} className="mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Knowledge Feed</h2>
                        <p>Select an article to begin your research.</p>
                    </div>
                )}
            </div>

        </div>
    )
}
