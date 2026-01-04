
"use client"

import { useState, useEffect } from "react"
import { BookOpen, Sparkles, Share2, ExternalLink, Loader2, FileText, Bookmark, Trash2, Code, Mic } from "lucide-react"
import { toast } from "sonner"
import { ARXIV_CATEGORIES } from "@/lib/arxiv_categories"

// Simple Markdown Renderer
function SimpleMarkdown({ text }: { text: string }) {
    if (!text) return null

    // Split by lines
    const lines = text.split('\n')

    return (
        <div className="space-y-3 leading-relaxed text-sm">
            {lines.map((line, i) => {
                // Headers
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-white mt-4">{line.replace('## ', '')}</h2>
                if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-zinc-200 mt-2">{line.replace('### ', '')}</h3>
                if (line.startsWith('- ')) return <div key={i} className="flex gap-2 ml-2"><span className="text-zinc-500">•</span> <span>{formatBold(line.replace('- ', ''))}</span></div>
                if (line.trim() === '') return <div key={i} className="h-2"></div>
                return <p key={i} className="text-zinc-300">{formatBold(line)}</p>
            })}
        </div>
    )
}

// Helper to bold text
function formatBold(text: string) {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
        }
        return part
    })
}

export default function FeedPage() {
    const [feedItems, setFeedItems] = useState<any[]>([])
    const [savedItems, setSavedItems] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [explanation, setExplanation] = useState("")
    const [loadingExp, setLoadingExp] = useState(false)
    const [loadingFeed, setLoadingFeed] = useState(true)
    const [filter, setFilter] = useState('global') // global, pk, business, launch, science, engineering, growth, crypto, custom
    const [subFilter, setSubFilter] = useState('all')
    const [viewMode, setViewMode] = useState<'feed' | 'saved'>('feed')

    // Configuration for Dropdowns
    const FILTERS: any = {
        'global': ['Hacker News', 'OpenAI Blog', 'MIT Tech Review', 'The Verge', 'CNN', 'BBC News', 'Al Jazeera'],
        'pk': ['Dawn News', 'The News PK', 'ARY News', 'Profit PK', 'Geo News', 'Express Tribune'],
        'business': ['CNBC', 'Yahoo Finance', 'Entrepreneur', 'Forbes', 'Bloomberg', 'Business Insider'],
        'tech': ['TechCrunch', 'Wired', 'Ars Technica', 'The Next Web', 'Engadget'],
        'launch': ['Indie Hackers', 'Product Hunt'],
        'engineering': ['Netflix Tech', 'Uber Eng', 'Pinterest Eng', 'Stripe Eng', 'Discord Eng', 'Spotify Eng', 'Airbnb Eng'],
        'growth': ['Moz SEO', 'Search Engine Land', 'Backlinko', 'Seth Godin', 'HubSpot', 'Ahrefs'],
        'crypto': ['CoinDesk', 'CoinTelegraph', 'a16z Crypto', 'Decrypt', 'The Block'],
        'science': ARXIV_CATEGORIES,
        'philosophy': ['Daily Nous', 'Philosophy Now', 'Aeon', 'Stanford Encyclopedia'],
        'history': ['History Today', 'History Extra', 'Smithsonian', 'History Net'],
        'politics': ['BBC Politics', 'The Guardian', 'Politico', 'FiveThirtyEight'],
        'stocks': ['MarketWatch', 'Investing.com', 'Seeking Alpha', 'Motley Fool']
    }

    useEffect(() => {
        setSubFilter('all') // Reset sub when main changes
    }, [filter])

    useEffect(() => {
        if (viewMode === 'feed') fetchFeed()
        else fetchSaved()
    }, [filter, subFilter, viewMode])

    const fetchFeed = async () => {
        setLoadingFeed(true)
        try {
            let url = '/api/feed'

            if (filter === 'science') {
                const cat = subFilter === 'all' ? 'cs.AI' : subFilter
                url = `/api/research/arxiv?category=${cat}`
            } else {
                if (filter === 'pk') url += '?region=pk'
                if (filter === 'business') url += '?category=business'
                if (filter === 'launch') url += '?category=launch'
                // if (filter === 'video') url += '?category=video' // Removed video filter
                if (filter === 'engineering') url += '?category=engineering'
                if (filter === 'growth') url += '?category=growth'
                if (filter === 'crypto') url += '?category=crypto'
                if (filter === 'philosophy') url += '?category=philosophy'
                if (filter === 'history') url += '?category=history'
                if (filter === 'politics') url += '?category=politics'
                if (filter === 'stocks') url += '?category=stocks'

                if (subFilter !== 'all') {
                    url += `&source=${encodeURIComponent(subFilter)}`
                }
            }

            const res = await fetch(url)
            const data = await res.json()
            if (data.items) setFeedItems(data.items)
            else setFeedItems([])
        } catch (e) {
            console.error(e)
            setFeedItems([])
        } finally {
            setLoadingFeed(false)
        }
    }

    const fetchSaved = async () => {
        setLoadingFeed(true)
        try {
            const res = await fetch('/api/save')
            const data = await res.json()
            if (data.items) setSavedItems(data.items)
        } catch (e) { console.error(e) }
        setLoadingFeed(false)
    }

    const handleSave = async (e: any, item: any) => {
        e.stopPropagation() // Critical
        const btn = e.currentTarget
        btn.innerHTML = "💾 Saving..."

        try {
            const res = await fetch('/api/save', {
                method: 'POST',
                body: JSON.stringify(item)
            })
            if (res.ok) {
                btn.innerHTML = "✅ Saved"
                setTimeout(() => btn.innerHTML = "", 2000)
            }
        } catch (e) { alert("Failed to save") }
    }

    const handleDelete = async (e: any, id: number) => {
        e.stopPropagation()
        if (!confirm("Remove from Library?")) return
        try {
            await fetch('/api/save', {
                method: 'DELETE',
                body: JSON.stringify({ id })
            })
            fetchSaved()
            setSelectedItem(null)
        } catch (e) { alert("Delete failed") }
    }



    // ... (rest of imports)

    // ... (inside component)

    const handleExplain = async () => {
        if (!selectedItem) return
        setLoadingExp(true)
        setExplanation("")
        try {
            const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: selectedItem.link,
                    category: selectedItem.category || filter, // Fallback to current filter
                    source: selectedItem.source
                })
            })
            const data = await res.json()
            if (data.explanation) {
                setExplanation(data.explanation)
                toast.success("Analysis Complete")
            }
        } catch (e) {
            toast.error("Failed to analyze article")
        } finally {
            setLoadingExp(false)
        }
    }

    const displayedItems = viewMode === 'feed' ? feedItems : savedItems

    return (
        <div className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-64px)] overflow-hidden pt-24 md:pt-0">

            {/* SIDEBAR LIST */}
            <div className={`w - full md: w - [30 %] lg: w - [25 %] border - r bg - muted / 10 overflow - y - auto p - 4 ${selectedItem ? 'hidden md:block' : 'block'} `}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                        <BookOpen size={14} /> Knowledge Feed
                    </h2>
                    <div className="flex bg-black/50 p-0.5 rounded-lg border border-white/10">
                        <button
                            onClick={() => { setViewMode('feed'); setSelectedItem(null); }}
                            className={`px - 3 py - 1 rounded text - [10px] font - bold transition ${viewMode === 'feed' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white'} `}
                        >
                            Feed
                        </button>
                        <button
                            onClick={() => { setViewMode('saved'); setSelectedItem(null); }}
                            className={`px - 3 py - 1 rounded text - [10px] font - bold transition ${viewMode === 'saved' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white'} `}
                        >
                            Saved 💾
                        </button>
                    </div>
                </div>

                {viewMode === 'feed' && (
                    <div className="space-y-4 mb-6">
                        {/* Main Filters */}
                        <div className="flex gap-1 flex-wrap">
                            <button onClick={() => setFilter('global')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'global' ? 'bg-primary text-white border-primary' : 'bg-background hover:bg-muted'} `}>Global</button>
                            <button onClick={() => setFilter('pk')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'pk' ? 'bg-green-600 text-white border-green-600' : 'bg-background hover:bg-muted'} `}>PK 🇵🇰</button>
                            <button onClick={() => setFilter('engineering')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'engineering' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-background hover:bg-muted'} `}>Eng 🏗️</button>
                            <button onClick={() => setFilter('growth')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'growth' ? 'bg-pink-600 text-white border-pink-600' : 'bg-background hover:bg-muted'} `}>Growth 📈</button>
                            <button onClick={() => setFilter('crypto')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'crypto' ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-background hover:bg-muted'} `}>Crypto 💰</button>
                            <button onClick={() => setFilter('launch')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'launch' ? 'bg-orange-600 text-white border-orange-600' : 'bg-background hover:bg-muted'} `}>Launch 🚀</button>
                            <button onClick={() => setFilter('stocks')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'stocks' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-background hover:bg-muted'} `}>Stocks 📈</button>
                            <button onClick={() => setFilter('politics')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'politics' ? 'bg-red-700 text-white border-red-700' : 'bg-background hover:bg-muted'} `}>Politics ⚖️</button>
                            <button onClick={() => setFilter('history')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'history' ? 'bg-amber-700 text-white border-amber-700' : 'bg-background hover:bg-muted'} `}>History 🏛️</button>
                            <button onClick={() => setFilter('philosophy')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'philosophy' ? 'bg-stone-500 text-white border-stone-500' : 'bg-background hover:bg-muted'} `}>Philosophy 🦉</button>
                            <button onClick={() => setFilter('science')} className={`px - 2 py - 1 text - [10px] rounded border ${filter === 'science' ? 'bg-purple-600 text-white border-purple-600' : 'bg-background hover:bg-muted'} `}>Papers 🔬</button>
                        </div>

                        {/* Sub Filter Dropdown */}
                        {FILTERS[filter] && (
                            <select
                                value={subFilter}
                                onChange={(e) => setSubFilter(e.target.value)}
                                className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:ring-1 ring-primary outline-none"
                            >
                                <option value="all">-- All Sources --</option>
                                {FILTERS[filter].map((opt: any, i: number) => {
                                    const val = typeof opt === 'string' ? opt : opt.value
                                    const label = typeof opt === 'string' ? opt : opt.label
                                    return <option key={i} value={val}>{label}</option>
                                })}
                            </select>
                        )}
                    </div>
                )}

                {loadingFeed ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : (
                    <div className="space-y-3 pb-20">
                        {displayedItems.length === 0 && <div className="text-center text-xs text-muted-foreground py-10">No items found.</div>}
                        {displayedItems.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => { setSelectedItem(item); setExplanation(""); }}
                                className={`p - 4 rounded - xl cursor - pointer border transition - all ${selectedItem?.link === item.link ? 'bg-background border-primary shadow-sm' : 'bg-background hover:bg-muted border-transparent'} relative group`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className={`text - [10px] font - bold uppercase w - fit px - 2 py - 0.5 rounded - full bg - primary / 10 text - primary`}>
                                        {item.source}
                                    </div>
                                    <div className="flex gap-2">
                                        {viewMode === 'feed' && (
                                            <button
                                                onClick={(e) => handleSave(e, item)}
                                                className="text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition z-10"
                                            >
                                                <Bookmark size={14} />
                                            </button>
                                        )}
                                        {viewMode === 'saved' && (
                                            <button
                                                onClick={(e) => handleDelete(e, item.id)}
                                                className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition z-10"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2">{item.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">{item.snippet}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className={`flex - 1 overflow - y - auto bg - background p - 4 md: p - 12 ${!selectedItem ? 'hidden md:block' : 'block'} `}>
                {selectedItem && (
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="md:hidden mb-4 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-white"
                    >
                        ← Back to List
                    </button>
                )}

                {selectedItem ? (
                    <div className="max-w-3xl mx-auto pb-20">
                        <div className="mb-8 border-b pb-8">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <span>{new Date(selectedItem.pubDate || selectedItem.published_at || new Date()).toLocaleDateString()}</span>
                                <span>•</span>
                                <a href={selectedItem.link} target="_blank" className="flex items-center gap-1 hover:text-primary">
                                    Read Source <ExternalLink size={12} />
                                </a>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black mb-6 leading-tight">{selectedItem.title}</h1>

                            <div className="flex flex-col md:flex-row gap-4">
                                <button
                                    onClick={handleExplain}
                                    disabled={loadingExp}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 w-full md:w-auto"
                                >
                                    {loadingExp ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                    {loadingExp ? "Analyzing..." : "Deep Explain (Mechanisms)"}
                                </button>

                                <a href={`/studio?source=${encodeURIComponent(selectedItem.link)}`} className="border bg-background hover:bg-muted px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition w-full md:w-auto">
                                    <Share2 size={18} /> Send to Studio
                                </a>

                                {viewMode === 'feed' && (
                                    <button
                                        onClick={(e) => handleSave(e, selectedItem)}
                                        className="border bg-background hover:bg-muted px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition w-full md:w-auto"
                                    >
                                        <Bookmark size={18} /> Save
                                    </button>
                                )}
                            </div>
                        </div>

                        {loadingExp && (
                            <div className="space-y-4 animate-pulse max-w-2xl">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-4 bg-muted rounded w-full"></div>
                                <div className="h-4 bg-muted rounded w-5/6"></div>
                                <p className="text-sm text-muted-foreground pt-4">Extracting technical mechanism...</p>
                            </div>
                        )}

                        {explanation && (
                            <div className="animate-in fade-in slide-in-from-bottom-8">
                                <div className="bg-muted/30 p-6 rounded-xl border mb-8 flex items-start gap-4">
                                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 mt-1">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Deep Dive Analysis</h3>
                                        <p className="text-sm text-muted-foreground">Technical Breakdown & Step-by-Step Procedure.</p>
                                    </div>
                                </div>
                                <div className="bg-background/50 p-6 rounded-xl border max-h-[70vh] overflow-y-auto custom-scrollbar break-words">
                                    <SimpleMarkdown text={explanation} />
                                </div>
                            </div>
                        )}

                        {!explanation && !loadingExp && (
                            <div className="text-center py-20 opacity-30 hidden md:block">
                                <FileText size={48} className="mx-auto mb-4" />
                                <p className="text-lg">Click "Deep Explain" to unlock this paper.</p>
                            </div>
                        )}
                        {!explanation && !loadingExp && (
                            <div className="text-center py-10 opacity-30 md:hidden">
                                <p className="text-sm">Tap "Deep Explain" above to analyze.</p>
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
