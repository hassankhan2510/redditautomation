"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
    BookOpen, Sparkles, ExternalLink, Loader2, FileText, Bookmark, Trash2,
    X, Download, ArrowLeft, Clock, MessageSquare, Send, ChevronDown,
    Copy, Check, RefreshCw, Search, Coffee
} from "lucide-react"
import { toast } from "sonner"
import { ARXIV_CATEGORIES } from "@/lib/arxiv_categories"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import type { FeedItem, SavedItem, QueueItem, ChatMessage, ViewMode } from "@/types"

// ============================================================================
// MARKDOWN RENDERER
// ============================================================================
// ============================================================================
// MARKDOWN RENDERER
// ============================================================================
function SimpleMarkdown({ text }: { text: string }) {
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
        <div className="space-y-3 leading-relaxed">
            {blocks.map((block, i) => {
                if (block.type === 'table') {
                    const header = block.content[0].split('|').filter(c => c.trim()).map(c => c.trim())
                    const rows = block.content.slice(2).map(row =>
                        row.split('|').filter(c => c.trim()).map(c => c.trim())
                    )
                    return (
                        <div key={i} className="my-4 overflow-x-auto rounded-xl border border-border/50 bg-muted/20">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 uppercase text-xs font-bold text-muted-foreground">
                                    <tr>
                                        {header.map((h, k) => <th key={k} className="px-4 py-3 whitespace-nowrap">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {rows.map((row, r) => (
                                        <tr key={r} className="hover:bg-muted/30 transition-colors">
                                            {row.map((cell, c) => <td key={c} className="px-4 py-3">{formatText(cell)}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }

                // Regular Text Processing
                const line = block.content[0]

                // Headers with emoji support
                if (line.startsWith('## ')) return (
                    <h2 key={i} className="text-xl font-bold text-foreground mt-6 mb-3 flex items-center gap-2">
                        {formatText(line.replace('## ', ''))}
                    </h2>
                )
                if (line.startsWith('### ')) return (
                    <h3 key={i} className="text-lg font-semibold text-foreground/90 mt-4 mb-2">
                        {formatText(line.replace('### ', ''))}
                    </h3>
                )
                // Bullet points
                if (line.startsWith('- ') || line.startsWith('* ')) return (
                    <div key={i} className="flex gap-3 ml-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-foreground/80">{formatText(line.replace(/^[-*] /, ''))}</span>
                    </div>
                )
                // Numbered lists
                if (/^\d+\. /.test(line)) return (
                    <div key={i} className="flex gap-3 ml-2">
                        <span className="text-primary font-bold min-w-[20px]">{line.match(/^\d+/)?.[0]}</span>
                        <span className="text-foreground/80">{formatText(line.replace(/^\d+\. /, ''))}</span>
                    </div>
                )
                // Empty lines
                if (line.trim() === '') return <div key={i} className="h-2" />

                // Regular paragraphs
                return <p key={i} className="text-foreground/80">{formatText(line)}</p>
            })}
        </div>
    )
}

function formatText(text: string) {
    // Bold
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-foreground font-bold">{part.slice(2, -2)}</strong>
        }
        return part
    })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function FeedPage() {
    // State
    const [feedItems, setFeedItems] = useState<FeedItem[]>([])
    const [savedItems, setSavedItems] = useState<SavedItem[]>([])
    const [queueItems, setQueueItems] = useState<QueueItem[]>([])
    const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null)
    const [explanation, setExplanation] = useState("")
    const [articleContent, setArticleContent] = useState("")
    const [loadingExp, setLoadingExp] = useState(false)
    const [loadingFeed, setLoadingFeed] = useState(true)
    const [filter, setFilter] = useState('global')
    const [subFilter, setSubFilter] = useState('all')
    const [viewMode, setViewMode] = useState<ViewMode>('feed')
    const [downloading, setDownloading] = useState(false)
    const [showExplanation, setShowExplanation] = useState(false)

    // Chat state
    const [showChat, setShowChat] = useState(false)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const [chatInput, setChatInput] = useState("")
    const [chatLoading, setChatLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Copied state
    const [copied, setCopied] = useState(false)

    // Search state
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<FeedItem[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    // Filter configuration
    const FILTERS: Record<string, (string | { value: string; label: string })[]> = {
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

    // Effects
    useEffect(() => {
        setSubFilter('all')
    }, [filter])

    useEffect(() => {
        if (viewMode === 'feed') fetchFeed()
        else if (viewMode === 'saved') fetchSaved()
        else if (viewMode === 'queue') fetchQueue()
    }, [filter, subFilter, viewMode])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    // Data fetching
    const fetchFeed = async () => {
        setLoadingFeed(true)
        try {
            let url = '/api/feed'

            if (filter === 'science') {
                const cat = subFilter === 'all' ? 'cs.AI' : subFilter
                url = `/api/research/arxiv?category=${cat}`
            } else {
                const categoryMap: Record<string, string> = {
                    'pk': '?region=pk',
                    'business': '?category=business',
                    'tech': '?category=tech',
                    'launch': '?category=launch',
                    'engineering': '?category=engineering',
                    'growth': '?category=growth',
                    'crypto': '?category=crypto',
                    'philosophy': '?category=philosophy',
                    'history': '?category=history',
                    'politics': '?category=politics',
                    'stocks': '?category=stocks'
                }
                if (categoryMap[filter]) url += categoryMap[filter]
                if (subFilter !== 'all') url += `&source=${encodeURIComponent(subFilter)}`
            }

            const res = await fetch(url)
            const data = await res.json()
            setFeedItems(data.items || [])
        } catch (e) {
            console.error(e)
            toast.error("Failed to load feed")
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
            setSavedItems(data.items || [])
        } catch (e) {
            toast.error("Failed to load saved items")
        }
        setLoadingFeed(false)
    }

    const fetchQueue = async () => {
        setLoadingFeed(true)
        try {
            const res = await fetch('/api/queue')
            const data = await res.json()
            setQueueItems(data.items || [])
        } catch (e) {
            toast.error("Failed to load queue")
        }
        setLoadingFeed(false)
    }

    // Search function
    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!searchQuery.trim() || searchQuery.length < 2) {
            toast.error("Enter at least 2 characters")
            return
        }

        setIsSearching(true)
        setShowSearch(true)
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
            const data = await res.json()
            if (data.items) {
                setSearchResults(data.items)
                toast.success(`Found ${data.items.length} results`)
            } else if (data.error) {
                toast.error(data.error)
            }
        } catch (e) {
            toast.error("Search failed")
        } finally {
            setIsSearching(false)
        }
    }

    const clearSearch = () => {
        setShowSearch(false)
        setSearchQuery("")
        setSearchResults([])
    }

    // Actions
    const handleSave = async (item: FeedItem) => {
        try {
            const res = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            })
            if (res.ok) {
                toast.success("Saved to library!")
            }
        } catch (e) {
            toast.error("Failed to save")
        }
    }

    const handleQueue = async (item: FeedItem) => {
        try {
            const res = await fetch('/api/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            })
            if (res.ok) {
                toast.success("Added to Read Later!")
            }
        } catch (e) {
            toast.error("Failed to add to queue")
        }
    }

    const handleDelete = async (id: string, type: 'saved' | 'queue') => {
        try {
            await fetch(type === 'saved' ? '/api/save' : '/api/queue', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            if (type === 'saved') fetchSaved()
            else fetchQueue()
            toast.success("Removed!")
            if (selectedItem) setSelectedItem(null)
        } catch (e) {
            toast.error("Delete failed")
        }
    }

    const handleExplain = async () => {
        if (!selectedItem) return
        if (explanation) {
            setShowExplanation(true)
            return
        }

        setLoadingExp(true)
        setShowExplanation(true)
        setExplanation("")
        setChatMessages([])
        setShowChat(false)

        try {
            const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: selectedItem.link,
                    category: selectedItem.category || filter,
                    title: selectedItem.title
                })
            })
            const data = await res.json()
            if (data.explanation) {
                setExplanation(data.explanation)
                setArticleContent(data.fetchedContent ? selectedItem.snippet || '' : '')
                toast.success("Analysis complete!")
            } else if (data.error) {
                toast.error(data.error)
            }
        } catch (e) {
            toast.error("Analysis failed")
        } finally {
            setLoadingExp(false)
        }
    }

    const handleSendChat = async () => {
        if (!chatInput.trim() || chatLoading) return

        const userMessage: ChatMessage = {
            role: 'user',
            content: chatInput,
            timestamp: new Date().toISOString()
        }
        setChatMessages(prev => [...prev, userMessage])
        setChatInput("")
        setChatLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articleContent: articleContent || selectedItem?.snippet,
                    previousExplanation: explanation,
                    question: chatInput,
                    chatHistory: chatMessages
                })
            })
            const data = await res.json()
            if (data.response) {
                const aiMessage: ChatMessage = {
                    role: 'assistant',
                    content: data.response,
                    timestamp: data.timestamp
                }
                setChatMessages(prev => [...prev, aiMessage])
            }
        } catch (e) {
            toast.error("Chat failed")
        } finally {
            setChatLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        setDownloading(true)
        const element = document.getElementById('deep-dive-content')
        if (!element) return

        try {
            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0a0a0f' })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`${selectedItem?.title.slice(0, 30)} - DeepResearch.pdf`)
            toast.success("PDF Downloaded!")
        } catch (e) {
            toast.error("Failed to generate PDF")
        } finally {
            setDownloading(false)
        }
    }

    const handleCopyExplanation = () => {
        navigator.clipboard.writeText(explanation)
        setCopied(true)
        toast.success("Copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    // Get displayed items based on view mode (search results take priority when active)
    const displayedItems = showSearch
        ? searchResults
        : viewMode === 'feed'
            ? feedItems
            : viewMode === 'saved'
                ? savedItems
                : queueItems

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="flex flex-col md:flex-row h-screen md:h-[calc(100vh-64px)] overflow-hidden pt-24 md:pt-0 gradient-bg">

            {/* ================================================================
                SIDEBAR
            ================================================================ */}
            <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-border/50 bg-background/80 backdrop-blur-xl overflow-y-auto h-full custom-scrollbar ${selectedItem ? 'hidden md:block' : 'block'}`}>

                {/* Header */}
                <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl p-4 border-b border-border/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <BookOpen size={14} className="text-primary" />
                            Knowledge Feed
                        </h2>
                        <button onClick={() => viewMode === 'feed' ? fetchFeed() : viewMode === 'saved' ? fetchSaved() : fetchQueue()}
                            className="p-1.5 hover:bg-muted rounded-lg transition">
                            <RefreshCw size={14} className={loadingFeed ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {/* Smart Briefing Link */}
                    <Link href="/briefing" className="flex items-center gap-3 w-full p-3 mb-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                        <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                            <Coffee size={18} />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Daily Briefing</div>
                            <div className="text-[10px] text-muted-foreground">Your morning digest</div>
                        </div>
                    </Link>

                    {/* View Mode Tabs */}
                    <div className="flex bg-muted/50 p-1 rounded-xl gap-1 mb-4">
                        {(['feed', 'saved', 'queue'] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => { setViewMode(mode); setSelectedItem(null); clearSearch(); }}
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === mode
                                    ? 'bg-primary text-primary-foreground shadow-lg'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                {mode === 'feed' ? '📰 Feed' : mode === 'saved' ? '📚 Saved' : '📥 Queue'}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search news, papers, topics..."
                            className="w-full bg-muted/50 border border-border/50 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 ring-primary outline-none placeholder:text-muted-foreground/50"
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        )}
                        {isSearching && (
                            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" />
                        )}
                    </form>

                    {/* Search Results Indicator */}
                    {showSearch && searchResults.length > 0 && (
                        <div className="flex items-center justify-between mt-3 text-xs">
                            <span className="text-muted-foreground">
                                🔍 {searchResults.length} results for "<span className="text-foreground">{searchQuery}</span>"
                            </span>
                            <button onClick={clearSearch} className="text-primary hover:underline">
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters (only for feed and not showing search results) */}
                {viewMode === 'feed' && !showSearch && (
                    <div className="p-4 space-y-3 border-b border-border/50">
                        {/* Category Pills */}
                        <div className="flex gap-1.5 flex-wrap">
                            {[
                                { id: 'global', label: '🌍', color: 'bg-blue-500' },
                                { id: 'pk', label: '🇵🇰', color: 'bg-green-600' },
                                { id: 'engineering', label: '⚙️', color: 'bg-indigo-600' },
                                { id: 'growth', label: '📈', color: 'bg-pink-600' },
                                { id: 'crypto', label: '🪙', color: 'bg-yellow-600' },
                                { id: 'stocks', label: '💹', color: 'bg-cyan-600' },
                                { id: 'science', label: '🧬', color: 'bg-purple-600' },
                                { id: 'history', label: '🏛️', color: 'bg-amber-700' },
                                { id: 'philosophy', label: '🦉', color: 'bg-stone-500' },
                                { id: 'politics', label: '⚖️', color: 'bg-red-700' },
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id)}
                                    className={`px-3 py-1.5 text-lg rounded-lg border transition-all ${filter === cat.id
                                        ? `${cat.color} text-white border-transparent shadow-lg`
                                        : 'bg-muted/50 border-border/50 hover:bg-muted'
                                        }`}
                                    title={cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Sub-filter dropdown */}
                        {FILTERS[filter] && (
                            <select
                                value={subFilter}
                                onChange={(e) => setSubFilter(e.target.value)}
                                className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-primary outline-none"
                            >
                                <option value="all">All Sources</option>
                                {FILTERS[filter].map((opt, i) => {
                                    const val = typeof opt === 'string' ? opt : opt.value
                                    const label = typeof opt === 'string' ? opt : opt.label
                                    return <option key={i} value={val}>{label}</option>
                                })}
                            </select>
                        )}
                    </div>
                )}

                {/* Items List */}
                <div className="p-3">
                    {loadingFeed ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="skeleton h-24 rounded-xl" />
                            ))}
                        </div>
                    ) : displayedItems.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <FileText size={48} className="mx-auto mb-4 opacity-30" />
                            <p>No items found</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {displayedItems.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => { setSelectedItem(item); setExplanation(""); setShowExplanation(false); setChatMessages([]); }}
                                    className={`feed-card group ${selectedItem?.link === item.link ? 'selected' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                            {item.source}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                            {viewMode === 'feed' && (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); handleQueue(item); }}
                                                        className="p-1.5 hover:bg-muted rounded-lg" title="Read Later">
                                                        <Clock size={12} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleSave(item); }}
                                                        className="p-1.5 hover:bg-muted rounded-lg" title="Save">
                                                        <Bookmark size={12} />
                                                    </button>
                                                </>
                                            )}
                                            {(viewMode === 'saved' || viewMode === 'queue') && (
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete((item as SavedItem).id, viewMode as 'saved' | 'queue'); }}
                                                    className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg">
                                                    <Trash2 size={12} />
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
            </div>

            {/* ================================================================
                MAIN CONTENT
            ================================================================ */}
            <div className={`flex-1 overflow-y-auto bg-background/50 backdrop-blur-sm ${!selectedItem ? 'hidden md:flex items-center justify-center' : 'block'}`}>

                {selectedItem ? (
                    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
                        {/* Mobile Back Button */}
                        <button
                            onClick={() => { setSelectedItem(null); setExplanation(""); setShowExplanation(false); }}
                            className="md:hidden mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft size={16} /> Back to Feed
                        </button>

                        {/* Article Header */}
                        <div className="glass-card p-6 md:p-8 mb-6">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                                    {selectedItem.source}
                                </span>
                                <span>{new Date(selectedItem.pubDate || new Date()).toLocaleDateString()}</span>
                                <a href={selectedItem.link} target="_blank"
                                    className="ml-auto flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition">
                                    Source <ExternalLink size={10} />
                                </a>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">{selectedItem.title}</h1>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleExplain}
                                    disabled={loadingExp}
                                    className="glow-button flex-1 md:flex-none bg-primary text-primary-foreground px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loadingExp ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                                    {loadingExp ? "Analyzing..." : "Deep Explain"}
                                </button>

                                <button onClick={(e) => { e.stopPropagation(); handleQueue(selectedItem); }}
                                    className="px-4 py-3 rounded-xl border border-border hover:bg-muted transition flex items-center gap-2">
                                    <Clock size={18} /> Later
                                </button>

                                <button onClick={(e) => { e.stopPropagation(); handleSave(selectedItem); }}
                                    className="px-4 py-3 rounded-xl border border-border hover:bg-muted transition flex items-center gap-2">
                                    <Bookmark size={18} /> Save
                                </button>
                            </div>
                        </div>

                        {/* Explanation Panel */}
                        {(showExplanation || loadingExp) && (
                            <div className="glass-card p-6 md:p-8 mb-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10">
                                            <BookOpen size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">Deep Analysis</h3>
                                            <p className="text-sm text-muted-foreground">AI-powered breakdown</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleCopyExplanation} disabled={!explanation}
                                            className="p-2 hover:bg-muted rounded-lg transition" title="Copy">
                                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                        </button>
                                        <button onClick={handleDownloadPDF} disabled={downloading || !explanation}
                                            className="p-2 hover:bg-muted rounded-lg transition" title="Download PDF">
                                            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                        </button>
                                        <button onClick={() => setShowExplanation(false)}
                                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div id="deep-dive-content" className="prose prose-invert max-w-none">
                                    {loadingExp ? (
                                        <div className="space-y-4">
                                            <div className="skeleton h-4 w-3/4 rounded" />
                                            <div className="skeleton h-4 w-full rounded" />
                                            <div className="skeleton h-4 w-5/6 rounded" />
                                            <div className="flex items-center gap-2 justify-center py-8 text-muted-foreground">
                                                <Loader2 className="animate-spin" />
                                                <span>Analyzing with AI...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <SimpleMarkdown text={explanation} />
                                    )}
                                </div>

                                {/* Start Chat Button */}
                                {explanation && !showChat && (
                                    <button
                                        onClick={() => setShowChat(true)}
                                        className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition flex items-center justify-center gap-2 text-primary font-medium"
                                    >
                                        <MessageSquare size={18} />
                                        Ask Follow-up Questions
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Chat Panel */}
                        {showChat && explanation && (
                            <div className="glass-card p-6 md:p-8">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={20} className="text-primary" />
                                        <h3 className="font-bold">Chat with Article</h3>
                                    </div>
                                    <button onClick={() => setShowChat(false)}
                                        className="p-1.5 hover:bg-muted rounded-lg">
                                        <ChevronDown size={18} />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar mb-4">
                                    {chatMessages.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p className="text-sm">Ask any question about this article!</p>
                                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                                                {['Explain in simpler terms', 'What are the key takeaways?', 'How does this affect me?'].map((q, i) => (
                                                    <button key={i} onClick={() => setChatInput(q)}
                                                        className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition">
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                                            <SimpleMarkdown text={msg.content} />
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div className="chat-bubble-ai">
                                            <div className="typing-indicator">
                                                <span /><span /><span />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                        placeholder="Ask a question..."
                                        className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-4 py-3 focus:ring-2 ring-primary outline-none"
                                    />
                                    <button
                                        onClick={handleSendChat}
                                        disabled={chatLoading || !chatInput.trim()}
                                        className="glow-button bg-primary text-primary-foreground p-3 rounded-xl disabled:opacity-50"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty state when no explanation yet */}
                        {!showExplanation && !loadingExp && (
                            <div className="glass-card p-12 text-center">
                                <FileText size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-lg text-muted-foreground">Click "Deep Explain" to analyze this article</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        <div className="glass-card inline-block p-12">
                            <BookOpen size={64} className="mx-auto mb-6 opacity-30" />
                            <h2 className="text-2xl font-bold mb-2">Knowledge Feed</h2>
                            <p>Select an article to begin your research</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
