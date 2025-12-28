"use client"

import { useState } from "react"
import { Link2, FileText, ArrowRight, Loader2, Copy } from "lucide-react"

export default function ConvertPage() {
    const [url, setUrl] = useState("")
    const [platform, setPlatform] = useState("Twitter")
    const [result, setResult] = useState("")
    const [loading, setLoading] = useState(false)

    const handleConvert = async () => {
        if (!url) return
        setLoading(true)
        setResult("")

        try {
            const res = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, platform })
            })

            const data = await res.json()
            if (data.thread) setResult(data.thread)
        } catch (e) {
            alert("Failed to convert")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl" suppressHydrationWarning>
            <div className="flex flex-col mb-8 text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <FileText className="text-purple-500" />
                    Blog-to-Social
                </h1>
                <p className="text-muted-foreground">Turn any article into a high-engagement thread.</p>
            </div>

            <div className="bg-card border rounded-xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Link2 className="absolute left-3 top-3.5 text-muted-foreground" size={16} />
                        <input
                            className="w-full pl-9 bg-background border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Paste article URL (e.g. https://techcrunch.com/...)"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-background border rounded-lg px-4 py-3 text-sm"
                        value={platform}
                        onChange={e => setPlatform(e.target.value)}
                    >
                        <option>Twitter</option>
                        <option>LinkedIn</option>
                    </select>
                    <button
                        onClick={handleConvert}
                        disabled={loading || !url}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} />}
                        Convert
                    </button>
                </div>

                {result && (
                    <div className="bg-secondary/20 border rounded-xl p-6 relative animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-semibold text-xs uppercase text-muted-foreground mb-4">Generated Draft</h3>
                        <textarea
                            className="w-full bg-transparent border-none outline-none resize-none min-h-[300px] text-sm leading-relaxed"
                            value={result}
                            readOnly
                        />
                        <button
                            onClick={() => navigator.clipboard.writeText(result)}
                            className="absolute top-4 right-4 p-2 bg-background border rounded hover:text-purple-500 transition"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
