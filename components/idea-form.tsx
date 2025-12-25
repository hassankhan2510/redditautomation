"use client"

import { useState } from "react"
import { PostIdea } from "@/types"

export function IdeaForm({ onSubmit }: { onSubmit: (data: Partial<PostIdea>) => Promise<void> }) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [coreIdea, setCoreIdea] = useState("")
    const [depth, setDepth] = useState(3)
    const [goal, setGoal] = useState("discussion")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const idea: Partial<PostIdea> = {
            title,
            core_idea: coreIdea,
            technical_depth: depth,
            goal
        }

        try {
            await onSubmit(idea)
            // Reset form on success
            setTitle("")
            setCoreIdea("")
            setDepth(3)
            setGoal("discussion")
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h2 className="text-xl font-bold mb-4">New Post Idea</h2>

            <div>
                <label className="block text-sm font-medium mb-1">Title (Internal Name)</label>
                <input
                    required
                    className="w-full border p-2 rounded bg-background"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Rate Limit Algo Release"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Core Idea / Update</label>
                <textarea
                    required
                    rows={5}
                    className="w-full border p-2 rounded bg-background"
                    value={coreIdea}
                    onChange={e => setCoreIdea(e.target.value)}
                    placeholder="Describe what you want to post about..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Technical Depth (1-5)</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        className="w-full border p-2 rounded bg-background"
                        value={depth}
                        onChange={e => setDepth(parseInt(e.target.value))}
                    />
                    <span className="text-xs text-muted-foreground">1=Noob, 5=Expert</span>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Goal</label>
                    <select
                        className="w-full border p-2 rounded bg-background"
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                    >
                        <option value="discussion">Discussion</option>
                        <option value="feedback">Feedback</option>
                        <option value="help">Help</option>
                        <option value="showcase">Showcase</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Saving..." : "Save Idea"}
            </button>
        </form>
    )
}
