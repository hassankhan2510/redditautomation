"use client"

import { useState } from "react"
import { Subreddit } from "@/types"

export function SubredditForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState<Partial<Subreddit>>({
        name: "",
        audience_type: "",
        tone: "",
        links_allowed: false,
        self_promo_level: "low",
        preferred_length: "",
        required_flair: "",
        ending_style: ""
    })
    const [bannedPhrasesInput, setBannedPhrasesInput] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const payload = {
                ...formData,
                banned_phrases: bannedPhrasesInput.split(",").map(s => s.trim()).filter(Boolean)
            }

            const res = await fetch("/api/subreddits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to create subreddit")

            onSuccess()
        } catch (err) {
            setError("Something went wrong. check console.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Add Subreddit Profile</h2>

            <div>
                <label className="block text-sm font-medium mb-1">Subreddit Name (e.g. r/webdev)</label>
                <input
                    required
                    className="w-full border p-2 rounded bg-background"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="r/..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Audience Type</label>
                    <input
                        className="w-full border p-2 rounded bg-background"
                        value={formData.audience_type}
                        onChange={e => setFormData({ ...formData, audience_type: e.target.value })}
                        placeholder="Beginners/Experts..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tone</label>
                    <input
                        className="w-full border p-2 rounded bg-background"
                        value={formData.tone}
                        onChange={e => setFormData({ ...formData, tone: e.target.value })}
                        placeholder="Professional/Casual..."
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Links Allowed?</label>
                <input
                    type="checkbox"
                    checked={formData.links_allowed}
                    onChange={e => setFormData({ ...formData, links_allowed: e.target.checked })}
                    className="h-4 w-4"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Self Promo Tolerance</label>
                <select
                    className="w-full border p-2 rounded bg-background"
                    value={formData.self_promo_level}
                    onChange={e => setFormData({ ...formData, self_promo_level: e.target.value as any })}
                >
                    <option value="low">Low (Strict)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Shameless)</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Preferred Length</label>
                    <input
                        className="w-full border p-2 rounded bg-background"
                        value={formData.preferred_length}
                        onChange={e => setFormData({ ...formData, preferred_length: e.target.value })}
                        placeholder="Short/Long..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Required Flair</label>
                    <input
                        className="w-full border p-2 rounded bg-background"
                        value={formData.required_flair}
                        onChange={e => setFormData({ ...formData, required_flair: e.target.value })}
                        placeholder="Discussion..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Banned Phrases (comma separated)</label>
                <textarea
                    className="w-full border p-2 rounded bg-background"
                    value={bannedPhrasesInput}
                    onChange={e => setBannedPhrasesInput(e.target.value)}
                    placeholder="I made a tool, check out my app..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Ending Style</label>
                <input
                    className="w-full border p-2 rounded bg-background"
                    value={formData.ending_style}
                    onChange={e => setFormData({ ...formData, ending_style: e.target.value })}
                    placeholder="Question/Call to action..."
                />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded hover:bg-zinc-800 disabled:opacity-50"
            >
                {loading ? "Saving..." : "Save Profile"}
            </button>
        </form>
    )
}
