"use client"

import { useState, useEffect } from "react"
import { Twitter, Send, Copy, ExternalLink, Loader2, Sparkles, RefreshCcw } from "lucide-react"

export default function XPage() {
    const [topic, setTopic] = useState("")
    const [tone, setTone] = useState("viral-hook")
    const [persona, setPersona] = useState("Personal Brand")
    const [language, setLanguage] = useState<'en' | 'ur'>('en')
    const [generatedContent, setGeneratedContent] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    // News State
    const [news, setNews] = useState<any[]>([])
    const [newsRegion, setNewsRegion] = useState<'global' | 'pk'>('pk')
    const [newsLoading, setNewsLoading] = useState(false)

    useEffect(() => {
        fetchNews()
    }, [newsRegion])

    const fetchNews = async () => {
        setNewsLoading(true)
        try {
            const res = await fetch(`/api/news?region=${newsRegion}`)
            const data = await res.json()
            if (data.articles) setNews(data.articles)
        } catch (e) {
            console.error(e)
        } finally {
            setNewsLoading(false)
        }
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic) return
        setLoading(true)
        setGeneratedContent([])

        try {
            const res = await fetch('/api/x', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, tone, persona, language })
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

    const useNewsItem = (article: any) => {
        setTopic(`News: ${article.title}\n\nSummary: ${article.description || ''}\nLink: ${article.url}`)
        setTone("news")
        // Optional: auto-scroll to input
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-7xl" suppressHydrationWarning>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Twitter size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">X Content Command Center</h1>
                    <p className="text-muted-foreground">Draft viral posts from trending news or raw ideas.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* News Feed Sidebar (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-card border rounded-xl p-4 shadow-sm h-[calc(100vh-200px)] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-500" />
                                Trending
                            </h2>
                            <div className="flex gap-1 bg-secondary rounded p-1">
                                <button
                                    onClick={() => setNewsRegion('pk')}
                                    className={`text-xs px-2 py-1 rounded ${newsRegion === 'pk' ? 'bg-background shadow font-bold' : 'text-muted-foreground'}`}
                                >pk</button>
                                <button
                                    onClick={() => setNewsRegion('global')}
                                    className={`text-xs px-2 py-1 rounded ${newsRegion === 'global' ? 'bg-background shadow font-bold' : 'text-muted-foreground'}`}
                                >Global</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                            {newsLoading ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                            ) : news.map((article: any, i) => (
                                <div key={i} className="group border-b pb-3 last:border-0 hover:bg-accent/50 p-2 rounded transition">
                                    <h3 className="text-sm font-medium leading-tight mb-1 line-clamp-2">{article.title}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] text-muted-foreground">{article.source.name}</span>
                                        <div className="flex gap-1">
                                            <a href={article.url} target="_blank" rel="noreferrer" className="p-1 hover:text-blue-500 rounded"><ExternalLink size={12} /></a>
                                            <button
                                                onClick={() => useNewsItem(article)}
                                                className="p-1 hover:text-green-500 rounded bg-secondary hover:bg-green-500/10 text-xs flex items-center gap-1"
                                                title="Draft Tweet from this"
                                            >
                                                Draft
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={fetchNews} className="mt-2 text-xs text-center w-full text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 py-2">
                            <RefreshCcw size={12} /> Refresh News
                        </button>
                    </div>
                </div>

                {/* Generator Input (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    <form onSubmit={handleGenerate} className="bg-card border rounded-xl p-6 shadow-sm h-full flex flex-col">
                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="block text-sm font-medium mb-2">Topic / Context</label>
                                <textarea
                                    className="w-full bg-background border rounded-lg p-3 min-h-[180px] focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                                    placeholder="Paste a news link, a random thought, or click 'Draft' from the news feed..."
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Language</label>
                                    <div className="flex bg-secondary p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setLanguage('en')}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${language === 'en' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            English
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setLanguage('ur')}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${language === 'ur' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Urdu
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Persona</label>
                                    <select
                                        className="w-full bg-background border rounded-lg p-2 text-sm"
                                        value={persona}
                                        onChange={e => setPersona(e.target.value)}
                                    >
                                        <option value="Personal Brand">Personal Brand</option>
                                        <option value="Influencer">Influencer</option>
                                        <option value="Journalist">Journalist</option>
                                        <option value="Entrepreneur">Entrepreneur</option>
                                        <option value="Scientist">Scientist</option>
                                        <option value="Developer">Developer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Style Strategy (Format)</label>
                                <select
                                    className="w-full bg-background border rounded-lg p-2.5"
                                    value={tone}
                                    onChange={e => setTone(e.target.value)}
                                >
                                    <option value="viral-hook">🔥 Viral Hook (Clickbait-ish)</option>
                                    <option value="thread">🧵 Detailed Thread (Value)</option>
                                    <option value="contrarian">🤔 Contrarian Take</option>
                                    <option value="news">📰 News Update</option>
                                    <option value="memetic">🤪 Shitpost / Meme</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {loading ? "Crafting Tweets..." : "Generate Variants"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Output (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground animate-pulse bg-card border rounded-xl">
                            <Twitter size={48} className="mb-4 opacity-50" />
                            <p>Analyzing context...</p>
                            <p className="text-xs">Optimizing for engagement...</p>
                        </div>
                    )}

                    {!loading && generatedContent.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground">
                            <p>Select news or type a topic to start.</p>
                        </div>
                    )}

                    <div className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto pr-1">
                        {generatedContent.map((tweet, idx) => (
                            <div key={idx} className="bg-card border rounded-xl p-5 hover:border-blue-500/40 transition-all shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-mono text-muted-foreground">Variant {idx + 1}</span>
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

                                <p className="whitespace-pre-wrap mb-4 text-sm leading-relaxed font-medium">
                                    {tweet}
                                </p>

                                <button
                                    onClick={() => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank')}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg font-bold hover:opacity-90 transition-opacity text-sm"
                                >
                                    <Twitter size={14} /> Post now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
