"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { LayoutTemplate, Video, MessageSquare, Twitter, Sparkles, Loader2, ArrowRight, BarChart } from "lucide-react"

export default function StudioPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
            <StudioContent />
        </Suspense>
    )
}

function StudioContent() {
    const searchParams = useSearchParams()

    // Core State
    const [seed, setSeed] = useState("")
    const [activeStyle, setStyle] = useState("Viral Hook")
    const [loading, setLoading] = useState<string | null>(null) // 'video', 'carousel', etc.

    // Outputs
    const [videoData, setVideoData] = useState<any>(null)
    const [carouselData, setCarouselData] = useState<any>(null)
    const [threadData, setThreadData] = useState<string>("")
    const [linkedinData, setLinkedinData] = useState<string>("")

    // Initialize from URL (The Brain integration)
    useEffect(() => {
        const source = searchParams.get('source')
        if (source) setSeed(`Repurpose this: ${source}`)
    }, [searchParams])

    // --- GENERATORS ---

    const generateVideo = async () => {
        if (!seed) return
        setLoading('video')
        try {
            const res = await fetch('/api/video', {
                method: 'POST', body: JSON.stringify({ script: seed, mode: activeStyle }) // Pass style
            })
            const data = await res.json()
            if (data.videoData) setVideoData(data.videoData)
        } catch (e) { alert("Video Gen Failed") }
        setLoading(null)
    }

    const generateCarousel = async () => {
        if (!seed) return
        setLoading('carousel')
        try {
            const res = await fetch('/api/carousel/generate', {
                method: 'POST', body: JSON.stringify({ topic: seed })
            })
            const data = await res.json()
            if (data.slides) setCarouselData(data.slides)
        } catch (e) { alert("Carousel Gen Failed") }
        setLoading(null)
    }

    const generateThread = async () => {
        if (!seed) return
        setLoading('thread')
        try {
            const res = await fetch('/api/repurpose', {
                method: 'POST',
                body: JSON.stringify({ originalContent: seed, targetPlatform: 'x', tone: activeStyle })
            })
            const data = await res.json()
            if (data.drafts) setThreadData(data.drafts.join('\n\n---\n\n')) // Handle multiple drafts
        } catch (e) { alert("Thread Gen Failed") }
        setLoading(null)
    }

    const generateLinkedIn = async () => {
        if (!seed) return
        setLoading('linkedin')
        try {
            const res = await fetch('/api/repurpose', {
                method: 'POST',
                body: JSON.stringify({ originalContent: seed, targetPlatform: 'linkedin', tone: activeStyle })
            })
            const data = await res.json()
            if (data.drafts) setLinkedinData(data.drafts[0]) // Just take first draft
        } catch (e) { alert("LinkedIn Gen Failed") }
        setLoading(null)
    }


    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <h1 className="text-4xl font-black mb-2">Universal Studio</h1>
            <p className="text-muted-foreground mb-8">One Idea. Infinite Assets.</p>

            {/* INPUT SECTION */}
            <div className="bg-card border rounded-xl p-6 shadow-sm mb-12">
                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block tracking-wider">Seed Content / Keyword / URL</label>
                <textarea
                    value={seed}
                    onChange={e => setSeed(e.target.value)}
                    placeholder="Paste a URL, an idea, or a rough draft here..."
                    className="w-full bg-background border rounded-lg p-4 text-sm min-h-[100px] mb-4 focus:ring-2 focus:ring-primary outline-none"
                />

                {/* STYLE SELECTOR (Restored) */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {['Viral Hook', 'Storytelling', 'Contrarian', 'Analytical', 'Shitpost'].map(style => (
                        <button
                            key={style}
                            onClick={() => setStyle(style)} // Needs state
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition ${activeStyle === style ? 'bg-white text-black border-white' : 'bg-transparent text-muted-foreground border-border hover:border-white'}`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>

            {/* ASSET GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

                {/* 1. VIDEO GHOST */}
                <div className={`p-6 rounded-xl border transition-all ${videoData ? 'bg-red-500/5 border-red-500/20' : 'bg-card'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2 text-lg"><Video className="text-red-500" /> Video Ghost</h3>
                        {!videoData && (
                            <button
                                onClick={generateVideo} disabled={!seed || !!loading}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition disabled:opacity-50"
                            >
                                {loading === 'video' ? <Loader2 className="animate-spin" /> : 'Generate'}
                            </button>
                        )}
                    </div>
                    {videoData ? (
                        <div className="space-y-4">
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white text-xs">
                                Video Generated ({videoData.scenes?.length} Scenes)
                            </div>
                            <a href={`/video?script=${encodeURIComponent(seed)}`} className="block w-full text-center bg-red-500 text-white py-2 rounded font-bold hover:bg-red-600">
                                Open in Editor
                            </a>
                        </div>
                    ) : <p className="text-sm text-muted-foreground">Turn your text into kinetic typography motion graphics.</p>}
                </div>

                {/* 2. CAROUSEL MAKER */}
                <div className={`p-6 rounded-xl border transition-all ${carouselData ? 'bg-blue-500/5 border-blue-500/20' : 'bg-card'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2 text-lg"><LayoutTemplate className="text-blue-500" /> Carousel Maker</h3>
                        {!carouselData && (
                            <button
                                onClick={generateCarousel} disabled={!seed || !!loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading === 'carousel' ? <Loader2 className="animate-spin" /> : 'Generate'}
                            </button>
                        )}
                    </div>
                    {carouselData ? (
                        <div className="space-y-4">
                            <div className="space-y-2 max-h-[150px] overflow-y-auto bg-background p-2 rounded text-xs border">
                                {carouselData.map((s: string, i: number) => <div key={i}>{i + 1}. {s}</div>)}
                            </div>
                            <a href="/carousel" className="block w-full text-center bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                                Edit Slides
                            </a>
                        </div>
                    ) : <p className="text-sm text-muted-foreground">Generate viral PDF slides for LinkedIn.</p>}
                </div>

                {/* 3. X THREAD */}
                <div className={`p-6 rounded-xl border transition-all ${threadData ? 'bg-black/5 border-black/20' : 'bg-card'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2 text-lg"><Twitter className="text-black dark:text-white" /> X Thread</h3>
                        {!threadData && (
                            <button
                                onClick={generateThread} disabled={!seed || !!loading}
                                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition disabled:opacity-50"
                            >
                                {loading === 'thread' ? <Loader2 className="animate-spin" /> : 'Generate'}
                            </button>
                        )}
                    </div>
                    {threadData ? (
                        <div className="space-y-4">
                            <textarea readOnly value={threadData} className="w-full bg-background border p-2 rounded text-xs h-[100px] resize-none" />
                            <button onClick={() => navigator.clipboard.writeText(threadData)} className="block w-full text-center border bg-background hover:bg-muted py-2 rounded font-bold">
                                Copy Thread
                            </button>
                        </div>
                    ) : <p className="text-sm text-muted-foreground">Convert text into a high-engagement Twitter thread.</p>}
                </div>

                {/* 4. LINKEDIN POST */}
                <div className={`p-6 rounded-xl border transition-all ${linkedinData ? 'bg-blue-700/5 border-blue-700/20' : 'bg-card'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2 text-lg"><MessageSquare className="text-blue-700" /> LinkedIn Post</h3>
                        {!linkedinData && (
                            <button
                                onClick={generateLinkedIn} disabled={!seed || !!loading}
                                className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition disabled:opacity-50"
                            >
                                {loading === 'linkedin' ? <Loader2 className="animate-spin" /> : 'Generate'}
                            </button>
                        )}
                    </div>
                    {linkedinData ? (
                        <div className="space-y-4">
                            <textarea readOnly value={linkedinData} className="w-full bg-background border p-2 rounded text-xs h-[100px] resize-none" />
                            <div className="flex gap-2">
                                <button onClick={() => navigator.clipboard.writeText(linkedinData)} className="flex-1 border bg-background hover:bg-muted py-2 rounded font-bold text-xs">
                                    Copy Post
                                </button>
                                <a href={`/carousel?topic=${encodeURIComponent(seed)}`} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold text-center text-xs hover:bg-blue-700">
                                    Make Carousel
                                </a>
                            </div>
                        </div>
                    ) : <p className="text-sm text-muted-foreground">Create a professional, formatted LinkedIn update.</p>}
                </div>

                {/* 5. REDDIT POST (New) */}
                <div className="p-6 rounded-xl border bg-card transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2 text-lg"><span className="bg-orange-500 text-white rounded-full p-1"><MessageSquare size={12} /></span> Reddit Post</h3>
                        <span className="text-[10px] font-bold bg-orange-500/10 text-orange-500 px-2 py-1 rounded">community</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Generate authentic, discussion-starting posts for specific subreddits.</p>
                    <a href="/ideas" className="block w-full text-center bg-orange-500 text-white py-2 rounded font-bold hover:bg-orange-600">
                        Open Reddit Studio
                    </a>
                </div>

                {/* 6. THE CHARTIST (New) */}
                <div className="p-6 rounded-xl border bg-card transition-all lg:col-span-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold flex items-center gap-2 text-lg"><span className="bg-indigo-500 text-white rounded-full p-1"><BarChart size={12} /></span> The Chartist</h3>
                        <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded">Visuals</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Turn complex technical concepts into viral flowcharts and data visualizations instantly.</p>
                    <a href="/chart" className="block w-full text-center bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                        Generate Visuals
                    </a>
                </div>
            </div>
        </div>
    )
}
