"use client"

import { useState, useEffect } from "react"
import { DollarSign, Search, Clock, Hash, FileText, Video, ArrowRight, Loader2, Copy, Volume2, Lock, Sparkles } from "lucide-react"
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
    const [bgUrl, setBgUrl] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")

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

    // WRITER STATE
    const [topic, setTopic] = useState("")
    const [customScript, setCustomScript] = useState("")
    const [writing, setWriting] = useState(false)
    const [dubbing, setDubbing] = useState(true) // Default ON

    const magicWrite = async () => {
        if (!topic) return
        setWriting(true)
        try {
            const res = await fetch('/api/writer', {
                method: 'POST', body: JSON.stringify({ topic })
            })
            const data = await res.json()
            if (data.script) setCustomScript(data.script)
        } catch (e) { alert("Writer Failed") }
        setWriting(false)
    }

    const generateVideo = async () => {
        const scriptToUse = customScript || (selectedStory ? selectedStory.content : "")
        if (!scriptToUse) return

        setGeneratingVideo(true)
        try {
            // 1. Generate Video Structure (Scenes)
            const res = await fetch('/api/video', {
                method: 'POST',
                body: JSON.stringify({
                    script: scriptToUse,
                    mode: 'story'
                })
            })
            const data = await res.json()
            if (!data.videoData) throw new Error("No Video Data")

            let finalData = { ...data.videoData, mode: 'story', backgroundUrl: bgUrl }

            // 2. Dubbing Engine (Free TTS)
            if (dubbing) {
                const dubbedScenes = await Promise.all(finalData.scenes.map(async (scene: any) => {
                    try {
                        const ttsRes = await fetch('/api/tts', {
                            method: 'POST', body: JSON.stringify({ text: scene.text })
                        })
                        const ttsData = await ttsRes.json()
                        return { ...scene, audioUrl: ttsData.url }
                    } catch (e) { return scene }
                }))
                finalData.scenes = dubbedScenes
            }

            setVideoData(finalData)
        } catch (e) { alert("Video Production Failed") }
        setGeneratingVideo(false)
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
                                onClick={() => { setSelectedStory(story); setCustomScript(story.content); setSeoData(""); }}
                                className={`p-4 rounded-lg cursor-pointer border transition-all ${selectedStory === story ? 'bg-green-500/10 border-green-500' : 'bg-transparent border-transparent hover:bg-white/5'}`}
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
                    <div className="bg-zinc-900 rounded-xl border border-white/10 p-4 mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Scripting Engine</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={dubbing}
                                    onChange={e => setDubbing(e.target.checked)}
                                    className="w-4 h-4 accent-green-500"
                                />
                                <span className="text-xs font-bold text-white">Enable Free Dubbing</span>
                            </div>
                        </div>

                        {/* MAGIC WRITER INPUT */}
                        <div className="flex gap-2 mb-4">
                            <input
                                className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition"
                                placeholder="Enter Topic (e.g. History of Coffee, Scary Ghost Story)..."
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                            />
                            <button
                                onClick={magicWrite}
                                disabled={writing}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"
                            >
                                {writing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                Magic Write
                            </button>
                        </div>

                        <textarea
                            className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed min-h-[200px] focus:outline-none focus:border-green-500 transition"
                            placeholder="Your script will appear here. Edit safely before rendering."
                            value={customScript}
                            onChange={e => setCustomScript(e.target.value)}
                        />
                    </div>

                        {/* VIDEO PLAYER PREVIEW */}
                {videoData && (
                    <div className="mb-8 border-4 border-green-500/20 rounded-xl overflow-hidden shadow-2xl">
                        <VideoPlayer data={videoData} />
                    </div>
                )}

                {/* VISUAL & AUDIO STRATEGY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                            <Video size={14} /> Background Vault
                        </h3>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                                { name: 'Minecraft', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
                                { name: 'GTA V', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
                                { name: 'Satisfying', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
                            ].map((bg) => (
                                <button
                                    key={bg.name}
                                    onClick={() => setBgUrl(bg.url)}
                                    className={`text-[10px] font-bold py-2 rounded border ${bgUrl === bg.url ? 'bg-green-500 text-black border-green-500' : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    {bg.name}
                                </button>
                            ))}
                        </div>
                        <input
                            placeholder="Or paste Custom Video URL..."
                            className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white"
                            onChange={(e) => setBgUrl(e.target.value)}
                        />
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                            <Volume2 size={14} /> Neural Voice (TTS)
                        </h3>
                        <select className="w-full bg-black border border-white/10 rounded px-2 py-2 text-xs text-white mb-2" disabled>
                            <option>Adam (Deep Male) - Coming Soon</option>
                            <option>Bella (Viral TikTok)</option>
                        </select>
                        <div className="flex items-center gap-2 text-[10px] text-yellow-500 bg-yellow-500/10 p-2 rounded">
                            <Lock size={10} /> Voice Engine requires API Key
                        </div>
                    </div>
                </div>

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

        </div >
    )
}
