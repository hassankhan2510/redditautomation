"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"

export function OnDemandInput({ onResult }: { onResult: (title: string, explanation: string, isUrl: boolean) => void }) {
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        setLoading(true)
        try {
            const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: input.trim() })
            })

            const data = await res.json()
            if (data.explanation) {
                const isUrl = input.startsWith('http://') || input.startsWith('https://');
                onResult(input, data.explanation, isUrl)
                setInput("")
            } else {
                alert("Failed to analyze: " + (data.error || "Unknown error"))
            }
        } catch (error) {
            alert("An error occurred during analysis.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-16 relative max-w-2xl mx-auto w-full group">
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-700 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-gray-900 dark:focus-within:ring-gray-100 transition-all shadow-sm">
                <div className="pl-6 text-gray-400">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter a topic or paste a URL..."
                    className="w-full bg-transparent border-none py-4 px-4 text-base font-sans text-foreground focus:outline-none placeholder:text-gray-400"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="mr-2 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-full disabled:opacity-50 transition-all hover:bg-gray-800 dark:hover:bg-gray-200 text-sm"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Explain"}
                </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4 font-sans uppercase tracking-widest font-semibold">
                On-Demand Deep Learning
            </p>
        </form>
    )
}
