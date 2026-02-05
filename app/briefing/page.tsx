"use client"

import { useState, useEffect } from "react"
import { Loader2, ArrowLeft, RefreshCw, Clock, Coffee, FileText, Newspaper, Sparkles, Brain } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { FeedItem } from "@/types"

export default function BriefingPage() {
    const [loading, setLoading] = useState(true)
    const [hourlyNews, setHourlyNews] = useState<any>(null)
    const [dailyDeepDives, setDailyDeepDives] = useState<any[]>([])
    const [explanation, setExplanation] = useState<string>("")
    const [explainingId, setExplainingId] = useState<string | null>(null)

    useEffect(() => {
        fetchBriefing()
    }, [])

    const fetchBriefing = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/briefing')
            const data = await res.json()
            setHourlyNews(data.hourlyNews)
            setDailyDeepDives(data.dailyDeepDives || [])
        } catch (e) {
            toast.error("Failed to load briefing")
        } finally {
            setLoading(false)
        }
    }

    const handleQuickExplain = async (item: any) => {
        setExplainingId(item.link)
        try {
            // We use a simplified prompt for briefing -> "Summarize in 3 bullet points"
            // But reuse existing explain API for simplicity, just limiting output length mentally or via UI
            const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: item.link,
                    category: 'news', // Generic
                    title: item.title
                })
            })
            const data = await res.json()
            if (data.explanation) {
                setExplanation(data.explanation)
                // In a real app we might store this locally per item, but for now just showing one modal/panel
            }
        } catch (e) {
            toast.error("Could not explain")
        } finally {
            setExplainingId(null)
        }
    }

    // Markdown-ish renderer for the simple UI
    const SimpleMarkdown = ({ text }: { text: string }) => {
        if (!text) return null

        // Pre-process grouping for tables
        const blocks: { type: string, content: string[] }[] = []
        const lines = text.split('\n')
        let currentTable: string[] = []

        lines.forEach((line) => {
            if (line.trim().startsWith('|')) {
                currentTable.push(line)
            } else {
                if (currentTable.length > 0) {
                    blocks.push({ type: 'table', content: currentTable })
                    currentTable = []
                }
                blocks.push({ type: 'text', content: [line] })
            }
        })
        if (currentTable.length > 0) blocks.push({ type: 'table', content: currentTable })

        return (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
                {blocks.map((block, i) => {
                    if (block.type === 'table') {
                        const header = block.content[0].split('|').filter(c => c.trim()).map(c => c.trim())
                        const rows = block.content.slice(2).map(row =>
                            row.split('|').filter(c => c.trim()).map(c => c.trim())
                        )
                        return (
                            <div key={i} className="my-6 overflow-x-auto rounded-xl border border-border/50 bg-muted/20">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 uppercase text-xs font-bold text-muted-foreground">
                                        <tr>
                                            {header.map((h, k) => <th key={k} className="px-4 py-3 whitespace-nowrap">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {rows.map((row, r) => (
                                            <tr key={r} className="hover:bg-muted/30 transition-colors">
                                                {row.map((cell, c) => <td key={c} className="px-4 py-3">{cell}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }

                    const line = block.content[0]
                    if (line.startsWith('##')) return <h3 key={i} className="font-bold text-xl mt-6 mb-3">{line.replace(/#/g, '')}</h3>
                    if (line.startsWith('-')) return <li key={i} className="ml-4 marker:text-primary">{line.replace('-', '')}</li>
                    if (line.trim()) return <p key={i} className="mb-3 text-foreground/80 leading-relaxed text-base">{line}</p>
                    return null
                })}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800">

            {/* Minimal Header */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40 py-4">
                <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/feed" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Research
                    </Link>
                    <h1 className="font-semibold text-lg tracking-tight">Smart Briefing</h1>
                    <button onClick={fetchBriefing} className="p-2 hover:bg-muted rounded-full transition-colors" title="Refresh">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">

                {/* Greeting */}
                <div className="mb-12 text-center">
                    <p className="text-muted-foreground mb-2 text-sm uppercase tracking-widest font-medium">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Your Daily Digest
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        Here's what you need to know today.
                        Two deep dives and your hourly update.
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-12 animate-pulse">
                        <div className="h-40 bg-muted/40 rounded-2xl" />
                        <div className="h-64 bg-muted/40 rounded-2xl" />
                    </div>
                ) : (
                    <div className="space-y-16">

                        {/* 1. HOURLY NEWS (Pakistan) */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Hourly Update</h3>
                                    <p className="text-sm text-muted-foreground">Latest from Pakistan • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            {hourlyNews ? (
                                <div className="group border border-border/50 rounded-2xl p-6 hover:bg-muted/30 transition-colors cursor-default">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 block">Breaking</span>
                                            <a href={hourlyNews.link} target="_blank" className="block font-serif text-2xl font-medium mb-3 group-hover:underline decoration-1 underline-offset-4">
                                                {hourlyNews.title}
                                            </a>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {hourlyNews.snippet}...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted-foreground italic">No hourly update available right now.</div>
                            )}
                        </section>

                        {/* 2. DAILY DEEP DIVES */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                                    <Coffee size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Daily Deep Dives</h3>
                                    <p className="text-sm text-muted-foreground">2 curated papers/articles for today</p>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                {dailyDeepDives.map((item, i) => (
                                    <div key={i} className="border border-border/50 rounded-2xl p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.type === 'paper' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                }`}>
                                                {item.type === 'paper' ? 'Research Paper' : 'Tech Article'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">• {item.source} • {item.pubDate ? new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}</span>
                                        </div>

                                        <a href={item.link} target="_blank" className="font-serif text-xl font-medium mb-3 block hover:text-primary transition-colors">
                                            {item.title}
                                        </a>

                                        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                            {item.snippet}
                                        </p>

                                        {/* Simplified Actions */}
                                        <div className="flex items-center gap-4 mb-4">
                                            {item.explanation ? (
                                                <span className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                                                    <Sparkles size={12} />
                                                    AI Analyzed
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleQuickExplain(item)}
                                                    disabled={explainingId === item.link}
                                                    className="text-sm font-medium flex items-center gap-2 text-foreground hover:text-primary transition-colors disabled:opacity-50"
                                                >
                                                    {explainingId === item.link ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                                                    {explainingId === item.link ? "Analyzing..." : "Read Explanation"}
                                                </button>
                                            )}

                                            <a href={item.link} target="_blank" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                                                <Newspaper size={16} />
                                                Read Original
                                            </a>
                                        </div>

                                        {/* Pre-fetched Explanation Display */}
                                        {item.explanation && (
                                            <div className="mt-4 pt-4 border-t border-border/50 bg-muted/10 -mx-6 px-6 pb-2">
                                                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                                                    <Brain size={14} />
                                                    <span className="text-xs font-semibold uppercase tracking-wider">AI Insight</span>
                                                </div>
                                                <SimpleMarkdown text={item.explanation} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                )}

                {/* Simplified Explanation Modal (only for manual clicks on items that failed auto-explain) */}
                {explanation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <div className="bg-background border border-border shadow-2xl w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                                <h3 className="font-semibold">Quick Analysis</h3>
                                <button onClick={() => setExplanation("")} className="p-2 hover:bg-muted rounded-full">
                                    <ArrowLeft size={18} className="rotate-180" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto">
                                <SimpleMarkdown text={explanation} />
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}

