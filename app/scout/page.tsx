"use client"

import { useState } from "react"
import { Search, ExternalLink, MessageCircle, Loader2 } from "lucide-react"

export default function ScoutPage() {
    const [keyword, setKeyword] = useState("")
    const [leads, setLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [activeDraft, setActiveDraft] = useState<number | null>(null)
    const [draftContent, setDraftContent] = useState("")

    const handleSearch = async () => {
        if (!keyword) return
        setLoading(true)
        setLeads([])
        setActiveDraft(null)

        try {
            const res = await fetch('/api/scout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword })
            })
            const data = await res.json()
            if (data.leads) setLeads(data.leads)
        } catch (e) {
            alert("Search failed")
        } finally {
            setLoading(false)
        }
    }

    const startDraft = (index: number) => {
        setActiveDraft(index)
        setDraftContent("")
        // Pre-fill prompt logic? For now, raw input.
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl" suppressHydrationWarning>
            <div className="flex flex-col mb-8 text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Search className="text-teal-500" />
                    Lead Scout
                </h1>
                <p className="text-muted-foreground">Find customers discussing your niche in real-time.</p>
            </div>

            {/* SEARCH BAR */}
            <div className="bg-card border rounded-xl p-6 shadow-sm mb-8 flex gap-3">
                <input
                    className="flex-1 bg-background border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Enter keywords (e.g. 'Need web designer', 'SaaS marketing help')"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button
                    onClick={handleSearch}
                    disabled={loading || !keyword}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                    Find Leads
                </button>
            </div>

            {/* RESULTS */}
            <div className="space-y-4">
                {leads.map((lead, i) => (
                    <div key={i} className="bg-card border rounded-xl p-6 shadow-sm hover:border-teal-500/30 transition">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg leading-tight text-foreground/90">{lead.title}</h3>
                            <a href={lead.link} target="_blank" className="text-teal-500 hover:underline flex items-center gap-1 text-xs whitespace-nowrap">
                                View Post <ExternalLink size={12} />
                            </a>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{lead.snippet}</p>

                        {activeDraft === i ? (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <textarea
                                    className="w-full bg-secondary/30 border rounded-lg p-3 text-sm min-h-[100px] mb-2 focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="Write your helpful reply here..."
                                    value={draftContent}
                                    onChange={e => setDraftContent(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setActiveDraft(null)}
                                        className="text-xs text-muted-foreground hover:text-foreground px-3 py-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-teal-700 transition"
                                        onClick={() => {
                                            navigator.clipboard.writeText(draftContent)
                                            alert("Copied to clipboard! Go paste it.")
                                        }}
                                    >
                                        Copy Reply
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                                    {new Date(lead.date).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => startDraft(i)}
                                    className="text-xs flex items-center gap-1 bg-secondary hover:bg-teal-500/10 hover:text-teal-600 px-3 py-1 rounded transition ml-auto font-medium"
                                >
                                    <MessageCircle size={14} /> Draft Reply
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {!loading && leads.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground opacity-40">
                        Top leads will appear here.
                    </div>
                )}
            </div>
        </div>
    )
}
