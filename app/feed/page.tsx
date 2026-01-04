"use client"

import { useState, useEffect } from "react"
import { BookOpen, Sparkles, Share2, ExternalLink, Loader2, FileText, Bookmark, Trash2 } from "lucide-react"

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
        'global': ['Hacker News', 'OpenAI Blog', 'MIT Tech Review', 'The Verge'],
        'pk': ['Dawn News', 'The News PK', 'ARY News', 'Profit PK'],
        'business': ['CNBC', 'Yahoo Finance', 'Entrepreneur'],
        'tech': ['TechCrunch', 'Wired', 'Ars Technica'],
        'launch': ['Product Hunt', 'Indie Hackers'],
        'engineering': ['Netflix Tech', 'Uber Eng', 'Pinterest Eng', 'Stripe Eng', 'Discord Eng'],
        'growth': ['Moz SEO', 'Search Engine Land', 'Backlinko', 'Seth Godin'],
        'crypto': ['CoinDesk', 'CoinTelegraph', 'a16z Crypto'],
        'video': ['Y Combinator', 'Slidebean', 'Fireship', 'Matthew Berman', 'MicroConf', 'The Primeagen', 'Theo - t3.gg', 'NeetCode'],
        'science': [
            { label: 'Artificial Intelligence (cs.AI)', value: 'cs.AI' },
            { label: 'Computation & Language (cs.CL)', value: 'cs.CL' },
            { label: 'Computer Vision (cs.CV)', value: 'cs.CV' },
            { label: 'Robotics (cs.RO)', value: 'cs.RO' },
            { label: 'Social Networks (cs.SI)', value: 'cs.SI' },
            { label: 'Cryptography (cs.CR)', value: 'cs.CR' },
            { label: 'Software Engineering (cs.SE)', value: 'cs.SE' },
            { label: 'Quant Finance (q-fin.GN)', value: 'q-fin.GN' },
        ]
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
                if (filter === 'video') url += '?category=video'
                if (filter === 'engineering') url += '?category=engineering'
                if (filter === 'growth') url += '?category=growth'
                if (filter === 'crypto') url += '?category=crypto'

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
        e.stopPropagation()
        try {
            const res = await fetch('/api/save', {
                method: 'POST',
                body: JSON.stringify(item)
            })
            if (res.ok) alert("Saved to Library")
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

    const displayedItems = viewMode === 'feed' ? feedItems : savedItems

    return (
        <div className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-64px)] overflow-hidden pt-24 md:pt-0">

            {/* SIDEBAR LIST */}
            <div className={`w-full md:w-[30%] lg:w-[25%] border-r bg-muted/10 overflow-y-auto p-4 ${selectedItem ? 'hidden md:block' : 'block'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-muted-foreground uppercase text-xs tracking-wider flex items-center gap-2">
                        <BookOpen size={14} /> Knowledge Feed
                    </h2>
                    <div className="flex bg-black/50 p-0.5 rounded-lg border border-white/10">
                        <button
                            onClick={() => { setViewMode('feed'); setSelectedItem(null); }}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition ${viewMode === 'feed' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Feed
                        </button>
                        <button
                            onClick={() => { setViewMode('saved'); setSelectedItem(null); }}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition ${viewMode === 'saved' ? 'bg-primary text-white' : 'text-zinc-500 hover:text-white'}`}
                        >
                            Saved 💾
                        </button>
                    </div>
                </div>

                {viewMode === 'feed' && (
                    <div className="space-y-4 mb-6">
                        {/* Main Filters */}
                        <div className="flex gap-1 flex-wrap">
                            <button onClick={() => setFilter('global')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'global' ? 'bg-primary text-white border-primary' : 'bg-background hover:bg-muted'}`}>Global</button>
                            <button onClick={() => setFilter('engineering')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'engineering' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-background hover:bg-muted'}`}>Eng 🏗️</button>
                            <button onClick={() => setFilter('growth')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'growth' ? 'bg-pink-600 text-white border-pink-600' : 'bg-background hover:bg-muted'}`}>Growth 📈</button>
                            <button onClick={() => setFilter('crypto')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'crypto' ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-background hover:bg-muted'}`}>Crypto 💰</button>
                            <button onClick={() => setFilter('launch')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'launch' ? 'bg-orange-600 text-white border-orange-600' : 'bg-background hover:bg-muted'}`}>Launch 🚀</button>
                            <button onClick={() => setFilter('video')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'video' ? 'bg-red-600 text-white border-red-600' : 'bg-background hover:bg-muted'}`}>Video 📺</button>
                            <button onClick={() => setFilter('science')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'science' ? 'bg-purple-600 text-white border-purple-600' : 'bg-background hover:bg-muted'}`}>Papers 🔬</button>
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
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedItem?.link === item.link ? 'bg-background border-primary shadow-sm' : 'bg-background hover:bg-muted border-transparent'} relative group`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className={`text-[10px] font-bold uppercase w-fit px-2 py-0.5 rounded-full bg-primary/10 text-primary`}>
                                        {item.source}
                                    </div>
                                    <div className="flex gap-2">
                                        {viewMode === 'feed' && (
                                            <button
                                                onClick={(e) => handleSave(e, item)}
                                                className="text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <Bookmark size={14} />
                                            </button>
                                        )}
                                        {viewMode === 'saved' && (
                                            <button
                                                onClick={(e) => handleDelete(e, item.id)}
                                                className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
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
            <div className={`flex-1 overflow-y-auto bg-background p-4 md:p-12 ${!selectedItem ? 'hidden md:block' : 'block'}`}>
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
                                    {loadingExp ? "Analyzing..." : "Deep Explain (Feynman)"}
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
                                <p className="text-sm text-muted-foreground pt-4">Extracting patterns...</p>
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
                                        <p className="text-sm text-muted-foreground">Generated using the Feynman Technique.</p>
                                    </div>
                                </div>
                                <div className="whitespace-pre-wrap leading-relaxed">
                                    {explanation}
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
                                <p className="text-sm">Tap "Deep Explain" to analyze.</p>
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
