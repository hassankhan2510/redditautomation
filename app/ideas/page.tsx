"use client"

import { useEffect, useState } from "react"
import { IdeaForm } from "@/components/idea-form"
import { PostIdea } from "@/types"

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<PostIdea[]>([])
    const [loading, setLoading] = useState(true)

    // Generation state
    const [generatingId, setGeneratingId] = useState<string | null>(null)
    const [genProgress, setGenProgress] = useState<string>("")
    const [genStats, setGenStats] = useState<{ current: number, total: number } | null>(null)

    // Selection Modal state
    const [showSelectModal, setShowSelectModal] = useState(false)
    const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)
    const [availableSubreddits, setAvailableSubreddits] = useState<any[]>([])
    const [selectedSubIds, setSelectedSubIds] = useState<Set<string>>(new Set())

    const fetchIdeas = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/ideas')
            if (res.ok) {
                const data = await res.json()
                setIdeas(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIdeas()
    }, [])

    const handleCreate = async (data: Partial<PostIdea>) => {
        try {
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                fetchIdeas()
            }
        } catch (e) {
            console.error(e)
        }
    }

    // 1. Open Selection Modal
    const initiateGeneration = async (ideaId: string) => {
        setSelectedIdeaId(ideaId)

        // Fetch subreddits to choose from
        const subRes = await fetch('/api/subreddits')
        if (subRes.ok) {
            const subs = await subRes.json()
            setAvailableSubreddits(subs)
            // Default select all
            setSelectedSubIds(new Set(subs.map((s: any) => s.id)))
            setShowSelectModal(true)
        } else {
            alert("Failed to fetch subreddits")
        }
    }

    const toggleSubreddit = (id: string) => {
        const next = new Set(selectedSubIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedSubIds(next)
    }

    // 2. Start Generation Loop
    const startGeneration = async () => {
        if (!selectedIdeaId) return
        setShowSelectModal(false)
        setGeneratingId(selectedIdeaId)
        setGenProgress("Initializing...")

        const targetSubreddits = availableSubreddits.filter(s => selectedSubIds.has(s.id))

        if (targetSubreddits.length === 0) {
            alert("No subreddits selected")
            setGeneratingId(null)
            return
        }

        setGenStats({ current: 0, total: targetSubreddits.length })
        let successCount = 0

        try {
            for (let i = 0; i < targetSubreddits.length; i++) {
                const sub = targetSubreddits[i]
                setGenStats({ current: i + 1, total: targetSubreddits.length })
                setGenProgress(`Generating for r/${sub.name}...`)

                try {
                    const genRes = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ideaId: selectedIdeaId,
                            subredditId: sub.id
                        })
                    })

                    if (genRes.ok) successCount++
                    else if (genRes.status === 429) {
                        setGenProgress(`Rate limit. Pausing 10s...`)
                        await new Promise(r => setTimeout(r, 10000))
                    }
                } catch (e) { console.error(e) }

                if (i < targetSubreddits.length - 1) {
                    await new Promise(r => setTimeout(r, 2000))
                }
            }
            alert(`Done! Generated ${successCount}/${targetSubreddits.length}.`)
        } catch (e) {
            alert("Error during generation")
        } finally {
            setGeneratingId(null)
            setGenStats(null)
        }
    }

    return (
        <div className="space-y-8 relative">
            <h1 className="text-3xl font-bold tracking-tight">Post Ideas</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">New Idea</h2>
                        <IdeaForm onSubmit={handleCreate} />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    {loading ? (
                        <p>Loading...</p>
                    ) : ideas.length === 0 ? (
                        <p className="text-muted-foreground">No ideas yet.</p>
                    ) : (
                        ideas.map(idea => (
                            <div key={idea.id} className="bg-card border rounded-lg p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{idea.title}</h3>
                                    <span className="text-xs bg-secondary px-2 py-1 rounded">
                                        Depth: {idea.technical_depth}/5
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{idea.core_idea}</p>

                                {generatingId === idea.id ? (
                                    <div className="space-y-2 bg-secondary/50 p-3 rounded">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>{genProgress}</span>
                                            {genStats && <span>{genStats.current}/{genStats.total}</span>}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: genStats ? `${(genStats.current / genStats.total) * 100}%` : '0%' }}>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => initiateGeneration(idea.id)}
                                        disabled={generatingId !== null}
                                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        Generate Drafts...
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Selection Modal */}
            {showSelectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background border p-6 rounded-lg max-w-md w-full shadow-lg">
                        <h3 className="text-xl font-bold mb-4">Select Subreddits</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 mb-6 border p-2 rounded">
                            {availableSubreddits.map(sub => (
                                <label key={sub.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedSubIds.has(sub.id)}
                                        onChange={() => toggleSubreddit(sub.id)}
                                        className="h-4 w-4"
                                    />
                                    <span>r/{sub.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowSelectModal(false)} className="px-4 py-2 text-sm">Cancel</button>
                            <button
                                onClick={startGeneration}
                                disabled={selectedSubIds.size === 0}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                            >
                                Start Generating ({selectedSubIds.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
