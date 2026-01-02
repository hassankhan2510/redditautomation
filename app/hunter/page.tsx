"use client"

import { useState } from "react"
import { Crosshair, Target, DollarSign, Copy, Check, Loader2, ExternalLink } from "lucide-react"

export default function HunterPage() {
    const [skill, setSkill] = useState("")
    const [leads, setLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [copiedId, setCopiedId] = useState<number | null>(null)

    const handleHunt = async () => {
        if (!skill) return
        setLoading(true)
        setLeads([])
        try {
            const res = await fetch('/api/hunter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill })
            })
            const data = await res.json()
            if (data.leads) setLeads(data.leads)
        } catch (e) {
            alert("Failed to hunt leads")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">

            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-full text-red-500 mb-4">
                    <Crosshair size={32} />
                </div>
                <h1 className="text-4xl font-bold mb-2">The Freelance Hunter</h1>
                <p className="text-xl text-muted-foreground">Automated High-Ticket Lead Generation & Qualification</p>
            </div>

            {/* SEARCH */}
            <div className="bg-card border rounded-xl p-8 shadow-sm max-w-2xl mx-auto mb-12 flex gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block tracking-wider">Target Skill / Niche</label>
                    <input
                        type="text"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        placeholder="e.g. React Developer, Video Editor, Copywriter..."
                        className="w-full bg-background border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none font-medium"
                        onKeyDown={(e) => e.key === 'Enter' && handleHunt()}
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleHunt}
                        disabled={loading || !skill}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition disabled:opacity-50 h-[50px]"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Target size={18} />}
                        Hunt
                    </button>
                </div>
            </div>

            {/* RESULTS */}
            <div className="space-y-6">
                {leads.length > 0 && <div className="text-sm font-bold text-muted-foreground mb-4">FOUND {leads.length} HIGH-QUALITY LEADS</div>}

                {leads.map((lead, i) => (
                    <div key={i} className="bg-card border hover:border-red-500/50 transition duration-300 rounded-xl p-6 shadow-sm group animate-in slide-in-from-bottom-4 fade-in fill-mode-backwards" style={{ animationDelay: `${i * 100}ms` }}>

                        <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-red-500 transition-colors">
                                    <a href={lead.link} target="_blank" className="flex items-center gap-2">
                                        {lead.analysis?.isRelevant ? lead.title : removeTags(lead.title)} <ExternalLink size={14} className="opacity-50" />
                                    </a>
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{lead.content}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(lead.analysis?.qualityScore)}`}>
                                    Score: {lead.analysis?.qualityScore}/100
                                </div>
                                <div className="flex items-center gap-1 text-sm font-medium text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                                    <DollarSign size={14} /> {lead.analysis?.budget || 'Negotiable'}
                                </div>
                            </div>
                        </div>

                        {/* AI ANALYSIS BOX */}
                        <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                                    <Target size={12} /> Personalized Pitch
                                </span>
                                <button
                                    onClick={() => copyToClipboard(lead.analysis?.proposal, i)}
                                    className="text-xs flex items-center gap-1 hover:text-foreground text-muted-foreground transition"
                                >
                                    {copiedId === i ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                    {copiedId === i ? "Copied" : "Copy Pitch"}
                                </button>
                            </div>
                            <p className="text-sm italic text-muted-foreground/80">
                                "{lead.analysis?.proposal}"
                            </p>
                        </div>

                    </div>
                ))}

                {!loading && leads.length === 0 && skill && (
                    <div className="text-center py-12 opacity-50">
                        <p>No high-quality leads found. Try a broader search term.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function getScoreColor(score: number) {
    if (score >= 80) return "bg-green-500/10 text-green-500 border-green-500/20";
    if (score >= 50) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-muted text-muted-foreground border-border";
}

function removeTags(str: string) {
    return str.replace(/\[.*?\]/g, '').trim();
}
