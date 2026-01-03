"use client"

import { useState } from "react"
import { Video, Sparkles, Loader2, Download } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { VideoPlayer } from "@/components/video/VideoPlayer"

export default function VideoPage() {
    const searchParams = useSearchParams()
    const [script, setScript] = useState(searchParams.get('script') || "")
    const [videoData, setVideoData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        if (!script) return
        setLoading(true)
        setVideoData(null)

        try {
            const res = await fetch('/api/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script })
            })
            const data = await res.json()
            if (data.videoData) {
                setVideoData(data.videoData)
            } else {
                alert("Failed to parse video script")
            }
        } catch (e) {
            alert("Generation failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
                    <Video className="text-red-500" />
                    Video Ghost
                </h1>
                <p className="text-muted-foreground">Text &rarr; Professional Motion Graphics (Programmatic)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* INPUT */}
                <div className="space-y-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <label className="font-bold text-sm mb-2 block">Your Script / Idea</label>
                        <textarea
                            className="w-full bg-background border rounded-lg p-4 text-sm min-h-[200px] mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="Paste your thread, article or idea here...
e.g. '5 Reasons why Rust is better than C++: Memory Safety, Cargo Package Manager, Zero Cost Abstractions...'"
                            value={script}
                            onChange={e => setScript(e.target.value)}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !script}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                            Generate Video
                        </button>
                    </div>

                    <div className="bg-muted/30 border rounded-xl p-6 text-sm text-muted-foreground">
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Sparkles size={14} className="text-yellow-500" /> Why is this different?</h4>
                        <p>This is not "AI Hallucinated" video. This is <strong>Code-Driven</strong>. The text rendering is pixel-perfect, scalable to 4K, and brand consistent.</p>
                    </div>
                </div>

                {/* PREVIEW */}
                <div className="space-y-4">
                    {videoData ? (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <VideoPlayer data={videoData} />
                            <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                                <span>Preview (1080p @ 30fps)</span>
                                <button className="flex items-center gap-2 hover:text-foreground transition opacity-50 cursor-not-allowed" title="Cloud Rendering coming in v2.1">
                                    <Download size={14} /> Export MP4 (Pro)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video bg-muted/20 border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                            <Video size={48} className="mb-4 opacity-20" />
                            <p>Video Preview will appear here</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
