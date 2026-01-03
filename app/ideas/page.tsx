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
                        <div key={idea.id} className="glass-panel p-6 rounded-2xl border border-white/5 relative group">
                            <h3 className="font-bold text-lg text-white mb-2">{idea.title}</h3>
                            <p className="text-zinc-400 text-sm">{idea.core_idea}</p>
                            <div className="absolute top-4 right-4 text-xs font-mono text-zinc-600">
                                {new Date(idea.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
