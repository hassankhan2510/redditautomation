"use client"

import { useState } from "react"
import { Crosshair, Target, Search, RefreshCw, Briefcase, MessageCircle, ExternalLink } from "lucide-react"

export default function RadarPage() {
    const [topic, setTopic] = useState("AI Marketing")
    const [jobs, setJobs] = useState<any[]>([])
    const [leads, setLeads] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const scan = async () => {
        setLoading(true)
        setJobs([])
        setLeads([])

        // Parallel Scan
        try {
            const [hunterRes, scoutRes] = await Promise.all([
                fetch('/api/hunter', { method: 'POST', body: JSON.stringify({ skill: topic }) }),
                fetch('/api/scout', { method: 'POST', body: JSON.stringify({ keyword: topic }) })
            ])
            const hunterData = await hunterRes.json()
            const scoutData = await scoutRes.json()

            if (hunterData.leads) setJobs(hunterData.leads)
            if (scoutData.leads) setLeads(scoutData.leads)

        } catch (e) { alert("Scan failed") }
        setLoading(false)
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">

            {/* HUD HEADER */}
            <div className="bg-black text-white p-6 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="bg-green-500/20 p-2 rounded text-green-500 animate-pulse"><Target size={24} /></div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wider uppercase">Opportunity Radar</h1>
                        <p className="text-xs text-white/50">Live Market Intelligence System</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 text-sm px-4 py-2 rounded focus:outline-none focus:border-green-500"
                    />
                    <button
                        onClick={scan}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold text-sm uppercase tracking-wide transition disabled:opacity-50"
                    >
                        {loading ? 'Scanning...' : 'Scan Sector'}
                    </button>
                </div>
            </div>

            {/* SPLIT VIEW */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT: JOBS (HUNTER) */}
                <div className="flex-1 border-r bg-zinc-900/50 p-6 overflow-y-auto">
                    <h2 className="font-bold flex items-center gap-2 mb-6 uppercase text-sm tracking-wider text-muted-foreground">
                        <Briefcase size={16} /> Active Contracts (Money)
                    </h2>
                    <div className="space-y-4">
                        {jobs.map((job, i) => (
                            <div key={i} className="bg-background border p-4 rounded-lg hover:border-green-500/50 transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-sm line-clamp-1">{job.title}</h3>
                                    <span className="text-green-600 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">
                                        {job.analysis?.qualityScore || 0}% Match
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{job.content}</p>
                                <a href={job.link} target="_blank" className="text-xs font-bold flex items-center gap-1 hover:underline">
                                    View Contract <ArrowRight size={10} />
                                </a>
                            </div>
                        ))}
                        {!loading && jobs.length === 0 && <div className="text-center opacity-30 text-sm">No active contracts found.</div>}
                    </div>
                </div>

                {/* RIGHT: LEADS (SCOUT) */}
                <div className="flex-1 bg-background p-6 overflow-y-auto">
                    <h2 className="font-bold flex items-center gap-2 mb-6 uppercase text-sm tracking-wider text-muted-foreground">
                        <MessageCircle size={16} /> Viral Discussions (Reach)
                    </h2>
                    <div className="space-y-4">
                        {leads.map((lead, i) => (
                            <div key={i} className="bg-muted/10 border p-4 rounded-lg hover:border-blue-500/50 transition">
                                <h3 className="font-bold text-sm line-clamp-2 mb-2">{lead.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{lead.snippet}</p>
                                <a href={lead.link} target="_blank" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                    Join Discussion <ExternalLink size={10} />
                                </a>
                            </div>
                        ))}
                        {!loading && leads.length === 0 && <div className="text-center opacity-30 text-sm">No discussions found.</div>}
                    </div>
                </div>

            </div>
        </div>
    )
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
