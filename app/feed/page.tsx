"use client"

import { useState, useEffect } from "react"
import { BookOpen, Sparkles, Share2, FileText, Loader2, ExternalLink, Bookmark, Trash2 } from "lucide-react"

interface FeedItem {
    id?: string;
    title: string;
    link: string;
    source?: string;
    category?: string;
    snippet?: string;
    pubDate?: string;
    author?: string;
}

interface FilterOption {
    label: string;
    value: string;
}

type FilterConfig = {
    [key: string]: string[] | FilterOption[];
}

export default function FeedPage() {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([])
    const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null)
    const [explanation, setExplanation] = useState("")
    const [loadingExp, setLoadingExp] = useState(false)
    const [loadingFeed, setLoadingFeed] = useState(true)
    const [filter, setFilter] = useState('global')
    const [subFilter, setSubFilter] = useState('all')

    // Configuration for Dropdowns
    const FILTERS: FilterConfig = {
        'global': ['Hacker News', 'OpenAI Blog', 'MIT Tech Review', 'The Verge'],
        'pk': ['Dawn News', 'The News PK', 'ARY News', 'Profit PK'],
        'business': ['CNBC', 'Yahoo Finance', 'Entrepreneur', 'Forbes', 'Business Insider', 'HBR'],
        'tech': ['TechCrunch', 'Wired', 'Ars Technica', 'The Verge', 'Engadget', 'Hackaday'],
        'launch': ['Product Hunt', 'Indie Hackers', 'BetaList', 'Y Combinator News'],
        'video': ['Y Combinator', 'Slidebean', 'Fireship', 'Matthew Berman', 'ColdFusion', 'Veritasium'],
        'newsletter': ['Lennys Newsletter', 'The Pragmatic Engineer', 'TheSequence', 'ByteByteGo', 'Stratechery', 'Benedict Evans'],
        'viral': ['r/SaaS', 'r/Entrepreneur', 'r/Singularity', 'r/InternetIsBeautiful', 'r/Futurology', 'r/DataIsBeautiful'],
        'philosophy': ['Daily Nous', 'Philosophy Now', 'Aeon Essays', 'Brain Pickings', 'Nautilus'],
        'blog': ['Paul Graham', 'Sam Altman', 'Seth Godin', 'Vitalik Buterin', 'Naval Ravikant'],
        'science': [
            { label: 'Artificial Intelligence (cs.AI)', value: 'cs.AI' },
            { label: 'Machine Learning (cs.LG)', value: 'cs.LG' },
            { label: 'Computer Vision (cs.CV)', value: 'cs.CV' },
            { label: 'Robotics (cs.RO)', value: 'cs.RO' },
            { label: 'Computation & Language (cs.CL)', value: 'cs.CL' },
            { label: 'Cryptography (cs.CR)', value: 'cs.CR' },
            { label: 'Computers and Society (cs.CY)', value: 'cs.CY' },
            { label: 'Software Engineering (cs.SE)', value: 'cs.SE' },
            { label: 'Quantum Physics (quant-ph)', value: 'quant-ph' },
            { label: 'Astrophysics (astro-ph)', value: 'astro-ph' },
            { label: 'Physics General (physics.gen-ph)', value: 'physics.gen-ph' },
            { label: 'Quantitative Finance (q-fin.GN)', value: 'q-fin.GN' }
        ]
    }

    useEffect(() => {
        setSubFilter('all')
    }, [filter])

    useEffect(() => {
        const fetchSaved = async () => {
            setLoadingFeed(true)
            try {
                const res = await fetch('/api/save')
                const data = await res.json()
                if (data.items) setFeedItems(data.items)
            } catch (e) { console.error(e) }
            finally { setLoadingFeed(false) }
        }

        const fetchFeed = async () => {
            setLoadingFeed(true)
            try {
                let url = '/api/feed'

                // Build URL based on Filters
                if (filter === 'science') {
                    const cat = subFilter === 'all' ? 'cs.AI' : subFilter
                    url = `/api/research/arxiv?category=${cat}`
                } else {
                    if (filter === 'pk') url += '?region=pk'
                    if (filter === 'business') url += '?category=business'
                    if (filter === 'tech') url += '?category=tech'
                    if (filter === 'launch') url += '?category=launch'
                    if (filter === 'video') url += '?category=video'
                    if (filter === 'newsletter') url += '?category=newsletter'
                    if (filter === 'viral') url += '?category=viral'
                    if (filter === 'philosophy') url += '?category=philosophy'
                    if (filter === 'blog') url += '?category=blog'

                    // Specific Source Filter
                    if (subFilter !== 'all') {
                        url += `&source=${encodeURIComponent(subFilter)}`
                    }
                }

                const res = await fetch(url)
                const data = await res.json()
                if (data.items) setFeedItems(data.items)
            } catch (e) {
                console.error(e)
            } finally {
                setLoadingFeed(false)
            }
        }

        if (filter === 'saved') {
            fetchSaved()
        } else {
            fetchFeed()
        }
    }, [filter, subFilter])

    const toggleSave = async (item: FeedItem, e: React.MouseEvent) => {
        e.stopPropagation()
        if (filter === 'saved') {
            // Delete Mode
            if (!window.confirm("Remove from saved?")) return
            await fetch(`/api/save?id=${item.id}`, { method: 'DELETE' })
            // Re-trigger fetch or clean up state locally
            setFeedItems(prev => prev.filter(i => i.id !== item.id))
        } else {
            // Save Mode
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: item.title,
                    link: item.link,
                    source: item.source,
                    snippet: item.snippet
                })
            })
            alert("Saved to Library")
        }
    }

    const handleExplain = async () => {
        if (!selectedItem) return
        setLoadingExp(true)
        setExplanation("")
        try {
            const res = await fetch('/api/research/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: (selectedItem.title || "") + "\n" + (selectedItem.snippet || "") })
            })
            const data = await res.json()
            if (data.explanation) setExplanation(data.explanation)
        } catch (e) { alert("Failed to explain") }
        finally { setLoadingExp(false) }
    }

    return (
        <div className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-64px)] overflow-hidden pt-24 md:pt-0">

            {/* SIDEBAR LIST */}
            <div className={`w-full md:w-[30%] lg:w-[25%] border-r bg-muted/10 overflow-y-auto p-4 ${selectedItem ? 'hidden md:block' : 'block'}`}>
                <h2 className="font-bold mb-4 flex items-center justify-between text-muted-foreground uppercase text-xs tracking-wider">
                    <span className="flex items-center gap-2"><BookOpen size={14} /> Knowledge Feed</span>
                    {filter === 'saved' && <span className="text-primary">{feedItems.length} Saved</span>}
                </h2>

                {/* FILTERS */}
                <div className="space-y-4 mb-6">
                    {/* Main Tabs */}
                    <div className="flex gap-1 flex-wrap">
                        <button onClick={() => setFilter('global')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'global' ? 'bg-primary text-white border-primary' : 'bg-background hover:bg-muted'}`}>Global</button>
                        <button onClick={() => setFilter('pk')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'pk' ? 'bg-green-600 text-white border-green-600' : 'bg-background hover:bg-muted'}`}>Pakistan 🇵🇰</button>
                        <button onClick={() => setFilter('saved')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'saved' ? 'bg-teal-500 text-white border-teal-500' : 'bg-background hover:bg-muted'}`}>Saved 💾</button>
                        <button onClick={() => setFilter('tech')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'tech' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-background hover:bg-muted'}`}>Tech 💻</button>
                        <button onClick={() => setFilter('newsletter')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'newsletter' ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-background hover:bg-muted'}`}>Newsletters 📧</button>
                        <button onClick={() => setFilter('viral')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'viral' ? 'bg-red-500 text-white border-red-500' : 'bg-background hover:bg-muted'}`}>Viral 🔥</button>
                        <button onClick={() => setFilter('blog')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'blog' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-background hover:bg-muted'}`}>Blogs ✍️</button>
                        <button onClick={() => setFilter('philosophy')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'philosophy' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-background hover:bg-muted'}`}>Deep 🧠</button>
                        <button onClick={() => setFilter('launch')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'launch' ? 'bg-orange-600 text-white border-orange-600' : 'bg-background hover:bg-muted'}`}>Launch 🚀</button>
                        <button onClick={() => setFilter('business')} className={`px-2 py-1 text-[10px] rounded border ${filter === 'business' ? 'bg-blue-600 text-white border-blue-600' : 'bg-background hover:bg-muted'}`}>Biz</button>
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
                            {FILTERS[filter].map((opt: string | FilterOption, i: number) => {
                                const val = typeof opt === 'string' ? opt : opt.value
                                const label = typeof opt === 'string' ? opt : opt.label
                                return <option key={i} value={val}>{label}</option>
                            })}
                        </select>
                    )}
                </div>

                {loadingFeed ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : (
                    <div className="space-y-3 pb-20">
                        {feedItems.map((item, i) => (
                            <div
                                key={i}
                                onClick={() => { setSelectedItem(item); setExplanation(""); }}
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedItem?.link === item.link ? 'bg-background border-primary shadow-sm' : 'bg-background hover:bg-muted border-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`text-[10px] font-bold uppercase w-fit px-2 py-0.5 rounded-full ${item.source === 'ArXiv' ? 'bg-purple-500/10 text-purple-500' : 'bg-primary/10 text-primary'}`}>
                                        {item.source || item.category}
                                    </div>
                                    <button
                                        onClick={(e) => toggleSave(item, e)}
                                        className="text-muted-foreground hover:text-white"
                                    >
                                        {filter === 'saved' ? <Trash2 size={14} /> : <Bookmark size={14} />}
                                    </button>
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
                {/* Mobile Back Button */}
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
                        {/* HEADER */}
                        <div className="mb-8 border-b pb-8">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <span>{selectedItem.pubDate ? new Date(selectedItem.pubDate).toLocaleDateString() : 'Just Now'}</span>
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
