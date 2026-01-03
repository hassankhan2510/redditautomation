"use client"

import { useState, useEffect } from "react"
import { Send, Trash2, Plus, Lightbulb } from "lucide-react"

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<any[]>([])
    const [newIdea, setNewIdea] = useState("")
    const [coreIdea, setCoreIdea] = useState("")

    useEffect(() => {
        fetchIdeas()
    }, [])

    const fetchIdeas = async () => {
        const res = await fetch('/api/ideas')
        const data = await res.json()
        if (Array.isArray(data)) setIdeas(data)
    }

    const addIdea = async () => {
        if (!newIdea || !coreIdea) return
        await fetch('/api/ideas', {
            method: 'POST',
            body: JSON.stringify({ title: newIdea, core_idea: coreIdea })
        })
        setNewIdea("")
        setCoreIdea("")
        fetchIdeas()
    }

    return (
        <div className="min-h-screen pt-24 px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-white mb-8 flex items-center gap-4">
                <Lightbulb className="text-yellow-400" size={40} />
                Idea Vault
            </h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* INPUT */}
                <div className="glass-panel p-6 rounded-2xl h-fit">
                    <h2 className="text-xl font-bold text-white mb-4">New Concept</h2>
                    <input
                        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white mb-4"
                        placeholder="Project Name (e.g. AI Cat Food)"
                        value={newIdea}
                        onChange={e => setNewIdea(e.target.value)}
                    />
                    <textarea
                        className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-white h-32 mb-4"
                        placeholder="Core Value Proposition..."
                        value={coreIdea}
                        onChange={e => setCoreIdea(e.target.value)}
                    />
                    <button
                        onClick={addIdea}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Add to Vault
                    </button>
                </div>

                {/* LIST */}
                <div className="space-y-4">
                    {ideas.map((idea) => (
                        <IdeaCard key={idea.id} idea={idea} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function IdeaCard({ idea }: { idea: any }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative group transition-all hover:border-orange-500/30">
            <IdeaHeader idea={idea} expanded={expanded} toggle={() => setExpanded(!expanded)} />

            {expanded && (
                <IdeaGenerator idea={idea} />
            )}
        </div>
    )
}

function IdeaHeader({ idea, expanded, toggle }: any) {
    return (
        <div className="flex justify-between items-start cursor-pointer" onClick={toggle}>
            <div>
                <h3 className="font-bold text-lg text-white mb-2">{idea.title}</h3>
                <p className="text-zinc-400 text-sm">{idea.core_idea}</p>
            </div>
            <div className="text-xs font-mono text-zinc-600">{new Date(idea.created_at).toLocaleDateString()}</div>
        </div>
    )
}

function IdeaGenerator({ idea }: any) {
    const [subreddit, setSubreddit] = useState("")
    const [generatedPost, setPost] = useState("")
    const [loading, setLoading] = useState(false)
    const [savedSubreddits, setSavedSubreddits] = useState<any[]>([])

    // Fetch saved subreddits on mount
    useEffect(() => {
        fetch('/api/subreddits')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSavedSubreddits(data)
            })
            .catch(e => console.error(e))
    }, [])

    const generate = async () => {
        if (!subreddit) return alert("Select a subreddit")
        setLoading(true)
        try {
            const res = await fetch('/api/repurpose', {
                method: 'POST',
                body: JSON.stringify({
                    originalContent: `${idea.title} - ${idea.core_idea}`,
                    targetPlatform: 'reddit',
                    tone: `Community member of r/${subreddit}`
                })
            })
            const data = await res.json()
            if (data.drafts) setPost(data.drafts[0])
        } catch (e) { alert("Failed") }
        setLoading(false)
    }

    return (
        <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top-2">
            <div className="flex gap-2 mb-4">
                <div className="flex-1">
                    {savedSubreddits.length > 0 ? (
                        <select
                            value={subreddit}
                            onChange={e => setSubreddit(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 px-4 py-2.5 rounded-lg text-white text-sm focus:border-orange-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="">-- Select Target Subreddit --</option>
                            {savedSubreddits.map(sub => (
                                <option key={sub.id} value={sub.name}>r/{sub.name} ({sub.audience_type})</option>
                            ))}
                            <option value="custom">+ Type Custom...</option>
                        </select>
                    ) : (
                        <input
                            value={subreddit}
                            onChange={e => setSubreddit(e.target.value)}
                            placeholder="r/Subreddit (e.g. r/SaaS)"
                            className="w-full bg-black/50 border border-white/10 px-4 py-2 rounded-lg text-white text-sm focus:border-orange-500 outline-none"
                        />
                    )}
                    {subreddit === 'custom' && (
                        <input
                            autoFocus
                            onChange={e => setSubreddit(e.target.value)}
                            placeholder="Type subreddit name..."
                            className="w-full mt-2 bg-black/50 border border-white/10 px-4 py-2 rounded-lg text-white text-sm focus:border-orange-500 outline-none"
                        />
                    )}
                </div>

                <button
                    onClick={generate}
                    disabled={loading || !subreddit}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-bold text-sm h-[42px] disabled:opacity-50"
                >
                    {loading ? "Writing..." : "Generate"}
                </button>
            </div>

            {generatedPost && (
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider">Draft for r/{subreddit}</h4>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-zinc-400">Karma Optimized</span>
                    </div>
                    <textarea
                        readOnly
                        value={generatedPost}
                        className="w-full bg-transparent text-sm text-zinc-300 min-h-[150px] resize-none outline-none font-mono"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => navigator.clipboard.writeText(generatedPost)}
                            className="text-xs text-white hover:text-orange-500 font-bold"
                        >
                            Copy
                        </button>
                        <a
                            href={`https://www.reddit.com/r/${subreddit.replace('r/', '')}/submit`}
                            target="_blank"
                            className="text-xs bg-white text-black px-3 py-1 rounded font-bold hover:bg-zinc-200"
                        >
                            Post Now →
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}
