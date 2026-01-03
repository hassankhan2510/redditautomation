```
"use client"

import { useState, useEffect } from "react"
import { DollarSign, Search, Clock, Hash, FileText, Video, ArrowRight, Loader2, Copy } from "lucide-react"
import { VideoPlayer } from "@/components/video/VideoPlayer"

export default function CashCowPage() {

    const [stories, setStories] = useState<any[]>([])
    const [selectedStory, setSelectedStory] = useState<any>(null)
    const [seoData, setSeoData] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    
    // VIDEO STATE
    const [generatingVideo, setGeneratingVideo] = useState(false)
    const [videoData, setVideoData] = useState<any>(null)

    useEffect(() => {
        fetchStories()
    }, [])

    const fetchStories = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/cash-cow/scout')
            const data = await res.json()
            if (data.leads) setStories(data.leads)
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const generateSEO = async () => {
        if (!selectedStory) return
        setAnalyzing(true)
        try {
            const res = await fetch('/api/cash-cow/seo', {
                method: 'POST', body: JSON.stringify({ story: selectedStory.content })
            })
            const data = await res.json()
            if (data.seo) setSeoData(data.seo)
        } catch (e) { alert("SEO Gen Failed") }
        setAnalyzing(false)
    }

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">

            {/* LEFT: SOURCE (The Mine) */}
            <div className="w-[30%] bg-zinc-900 border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10 bg-black">
                    <h2 className="font-black text-green-500 flex items-center gap-2 uppercase tracking-wide">
                        <DollarSign size={20} /> Story Mine
                    </h2>
                    <p className="text-xs text-zinc-500">Viral candidates from r/AITAH & r/Confessions</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading ? <div className="p-8 text-center"><Loader2 className="animate-spin text-green-500 mx-auto" /></div> : (
                        stories.map((story, i) => (
                            <div
                                key={i}
                                onClick={() => { setSelectedStory(story); setSeoData(""); }}
                                className={`p - 4 rounded - lg cursor - pointer border transition - all ${ selectedStory === story ? 'bg-green-500/10 border-green-500' : 'bg-transparent border-transparent hover:bg-white/5' } `}
                            >
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{story.subreddit}</span>
                                <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug mb-2">{story.title}</h3>
                                <p className="text-xs text-zinc-500 line-clamp-3">{story.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CENTER: PRODUCTION (The Factory) */}
            <div className="flex-1 bg-black p-8 flex flex-col overflow-y-auto">
                {selectedStory ? (
                    <div className="max-w-2xl mx-auto w-full">
                        <div className="mb-8">
                            <span className="text-green-500 text-xs font-bold uppercase tracking-widest mb-2 block">Selected Asset</span>
                            <h1 className="text-2xl font-bold text-white mb-4">{selectedStory.title}</h1>
                            <div className="p-4 bg-zinc-900 rounded-xl border border-white/10 text-sm text-zinc-300 leading-relaxed max-h-[300px] overflow-y-auto">
                                {selectedStory.content}
                            </div>
                        </div>

                        {/* VIDEO PLAYER PREVIEW */}
                        {videoData && (
                            <div className="mb-8 border-4 border-green-500/20 rounded-xl overflow-hidden shadow-2xl">
                                <VideoPlayer inputProps={videoData} />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                onClick={generateSEO}
                                disabled={analyzing}
                                className="bg-green-600 hover:bg-green-500 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 transition disabled:opacity-50"
                            >
                                {analyzing ? <Loader2 className="animate-spin" /> : <Search size={24} />}
                                Generate SEO Package
                            </button>
                            <button 
                                onClick={generateVideo}
                                disabled={generatingVideo}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 transition disabled:opacity-50"
                            >
                                {generatingVideo ? <Loader2 className="animate-spin" /> : <Video size={24} />}
                                {videoData ? 'Re-Render Video' : 'Render Split-Screen Video'}
                            </button>
                        </div>

                        {seoData && (
                            <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2">
                                    <FileText size={18} /> Optimization Payload
                                </h3>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {/* Simple Markdown Render */}
                                    <div className="whitespace-pre-wrap font-mono text-xs">{seoData}</div>
                                </div>
                                <button
                                    onClick={() => navigator.clipboard.writeText(seoData)}
                                    className="mt-4 w-full border border-white/10 hover:bg-white/5 text-xs font-bold py-2 rounded flex items-center justify-center gap-2"
                                >
                                    <Copy size={12} /> Copy to Clipboard
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                        <DollarSign size={64} className="mb-4 opacity-20" />
                        <h2 className="text-xl font-bold">Cash Cow Protocol</h2>
                        <p>Select a viral story to begin production.</p>
                    </div>
                )}
            </div>

        </div>
    )
}
