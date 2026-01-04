
"use client"

import { useState, useEffect } from "react"
import { BookOpen, Sparkles, Share2, ExternalLink, Loader2, FileText, Bookmark, Trash2, Code, Mic, X, Download, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { ARXIV_CATEGORIES } from "@/lib/arxiv_categories"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Helper Component for Markdown
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
    const [downloading, setDownloading] = useState(false)
    const [showExplanation, setShowExplanation] = useState(false)

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

    const handleDownloadPDF = async () => {
        setDownloading(true)
        const element = document.getElementById('deep-dive-content')
        if (!element) return

        try {
            const canvas = await html2canvas(element, { scale: 2 })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`${selectedItem?.title.slice(0, 30)} - Analysis.pdf`)
            toast.success("PDF Downloaded")
        } catch (e) {
            console.error(e)
            toast.error("Failed to generate PDF")
        } finally {
            setDownloading(false)
        }
    }


    const handleExplain = async () => {
        if (!selectedItem) return

        // Return cached if available
        if (explanation) {
            setShowExplanation(true)
            return
        }

        setLoadingExp(true)
        setShowExplanation(true) // Show modal immediately with loading state
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
            <div className={`w-full md:w-[30%] lg:w-[25%] border-r bg-muted/10 overflow-y-auto h-full p-4 ${selectedItem ? 'hidden md:block' : 'block'}`}>
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
            <div className={`flex-1 overflow-y-auto bg-background p-4 md:p-12 ${!selectedItem ? 'hidden md:block' : 'block'}`}>
                {/* Simple Back Button (Mobile) */}
                {selectedItem && (
                    <button
                        onClick={() => {
                            setSelectedItem(null)
                            setExplanation("")
                            setShowExplanation(false)
                        }}
                        className="md:hidden mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Feed
                    </button>
                )}

                {selectedItem ? (
                    <div className="max-w-3xl mx-auto pb-20 pt-2 md:pt-0">
                        <div className="mb-8 border-b pb-8">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                                <span className="bg-muted text-foreground px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide border">{selectedItem.source}</span>
                                <span>{new Date(selectedItem.pubDate || selectedItem.published_at || new Date()).toLocaleDateString()}</span>
                                <a href={selectedItem.link} target="_blank" className="ml-auto flex items-center gap-1 text-xs border px-2 py-1 rounded hover:bg-muted transition">
                                    Source <ExternalLink size={10} />
                                </a>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-6 leading-tight text-foreground">{selectedItem.title}</h1>

                            <div className="space-y-3">
                                <button
                                    onClick={handleExplain}
                                    disabled={loadingExp}
                                    className="w-full bg-foreground text-background hover:opacity-90 px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-3 transition disabled:opacity-50 text-base"
                                >
                                    {loadingExp ? <Loader2 className="animate-spin" /> : <BookOpen size={20} />}
                                    {loadingExp ? "Analyzing..." : "Deep Explain"}
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <a href={`/studio?source=${encodeURIComponent(selectedItem.link)}`} className="border bg-background hover:bg-muted px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition text-sm">
                                        <Share2 size={16} /> Studio
                                    </a>

                                    {viewMode === 'feed' && (
                                        <button
                                            onClick={(e) => handleSave(e, selectedItem)}
                                            className="border bg-background hover:bg-muted px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition text-sm"
                                        >
                                            <Bookmark size={16} /> Save
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {loadingExp && (
                            <div className="space-y-4 animate-pulse max-w-2xl mt-8 md:hidden">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-4 bg-muted rounded w-full"></div>
                                <div className="h-4 bg-muted rounded w-5/6"></div>
                                <div className="flex items-center gap-2 justify-center py-8 text-muted-foreground animate-pulse">
                                    <Loader2 className="animate-spin" /> Analyzing 10,000+ tokens...
                                </div>
                            </div>
                        )}

                        {(showExplanation || loadingExp) && (
                            <div className="fixed inset-0 z-[200] bg-background p-6 overflow-y-auto md:static md:z-auto md:bg-transparent md:p-0 md:overflow-visible animate-in fade-in slide-in-from-bottom-10 md:animate-none flex flex-col">
                                {/* Mobile Header with Close Button */}
                                <div className="flex items-center justify-between mb-6 md:hidden sticky top-0 bg-background z-10 py-4 border-b">
                                    <h2 className="font-bold text-lg flex items-center gap-2">
                                        <BookOpen size={18} /> Deep Dive
                                    </h2>
                                    <div className="flex gap-2">
                                        <button onClick={handleDownloadPDF} disabled={downloading} className="p-2 bg-muted rounded-full hover:bg-muted/80">
                                            {downloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                                        </button>
                                        <button onClick={() => setShowExplanation(false)} className="p-2 bg-muted rounded-full hover:bg-muted/80">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Desktop Header - Clean & Minimal */}
                                <div className="hidden md:flex items-center justify-between mb-8 border-b pb-4 mt-8">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted p-2 rounded-lg text-foreground">
                                            <BookOpen size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-2xl tracking-tight">Deep Dive Analysis</h3>
                                            <p className="text-sm text-muted-foreground font-medium">Technical Breakdown & Mechanisms</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleDownloadPDF}
                                            disabled={downloading}
                                            className="flex items-center gap-2 text-sm font-bold bg-background border hover:bg-muted px-4 py-2 rounded-lg transition"
                                        >
                                            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                            PDF
                                        </button>
                                        <button onClick={() => setShowExplanation(false)} className="p-2 text-muted-foreground hover:text-red-500 transition rounded-lg hover:bg-red-500/10">
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content - Native Article Feel on Desktop */}
                                <div id="deep-dive-content" className="bg-background md:bg-transparent p-6 md:p-0 rounded-xl md:border-none md:max-h-none md:overflow-visible custom-scrollbar break-words text-lg leading-loose text-foreground/90 md:mt-8">
                                    {loadingExp ? (
                                        <div className="space-y-4 animate-pulse pt-4">
                                            <div className="h-4 bg-muted rounded w-3/4"></div>
                                            <div className="h-4 bg-muted rounded w-full"></div>
                                            <div className="h-4 bg-muted rounded w-5/6"></div>
                                        </div>
                                    ) : (
                                        <SimpleMarkdown text={explanation} />
                                    )}
                                </div>

                                <div className="md:hidden mt-8 pb-10">
                                    <button onClick={() => setShowExplanation(false)} className="w-full py-4 bg-muted font-bold rounded-xl">
                                        Close Analysis
                                    </button>
                                </div>
                            </div>
                        )}

                        {!showExplanation && !loadingExp && (
                            <div className="text-center py-20 opacity-30 hidden md:block">
                                <FileText size={48} className="mx-auto mb-4" />
                                <p className="text-lg">Click "Deep Explain" to unlock this paper.</p>
                            </div>
                        )}
                        {!showExplanation && !loadingExp && (
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
