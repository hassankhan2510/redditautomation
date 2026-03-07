"use client"

import { useState, useEffect } from "react"
import { Loader2, Library, ExternalLink } from "lucide-react"

export default function LibraryPage() {
    const [savedItems, setSavedItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                // We need an API route to fetch saved items. We can build it inline or call a new one.
                // Let's create /api/library/route.ts next, but for now expect it here.
                const res = await fetch('/api/library')
                const data = await res.json()
                if (data.items) {
                    setSavedItems(data.items)
                }
            } catch (err) {
                console.error("Failed to fetch library", err)
            } finally {
                setLoading(false)
            }
        }
        fetchSaved()
    }, [])

    const SimpleMarkdown = ({ text }: { text: string }) => {
        if (!text) return null
        const lines = text.split('\n')
        return (
            <div className="space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed text-sm font-serif">
                {lines.map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-4 mb-2 font-sans text-foreground">{line.replace('# ', '')}</h1>
                    if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2 font-sans text-foreground">{line.replace('## ', '')}</h2>
                    if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold mt-4 mb-2 font-sans text-foreground">{line.replace('### ', '')}</h3>
                    if (line.trim().startsWith('- ')) {
                        const content = line.trim().substring(2);
                        const parts = content.split(/(\*\*.*?\*\*)/g);
                        return (
                            <li key={i} className="ml-6 list-disc mb-1">
                                {parts.map((part, index) => part.startsWith('**') && part.endsWith('**') ? <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong> : <span key={index}>{part}</span>)}
                            </li>
                        )
                    }
                    if (line.trim() === '') return <div key={i} className="h-1"></div>
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                        <p key={i} className="mb-2">
                            {parts.map((part, index) => part.startsWith('**') && part.endsWith('**') ? <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong> : <span key={index}>{part}</span>)}
                        </p>
                    )
                })}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F7] dark:bg-[#121212]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">Loading Library...</p>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#F9F9F7] dark:bg-[#121212] py-8 md:py-16 selection:bg-gray-200 dark:selection:bg-gray-800">
            <article className="max-w-4xl mx-auto px-6 md:px-0">
                <header className="mb-16 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Library className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-foreground font-sans">
                                Permanent Library
                            </h1>
                            <p className="text-gray-500 font-serif italic mt-2">Saved mental models, papers, and deep topics.</p>
                        </div>
                    </div>
                </header>

                {savedItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 font-serif italic text-lg">Your library is currently empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {savedItems.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[500px]">
                                <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-xl font-bold text-foreground mb-4 line-clamp-3">{item.title}</h3>
                                    {item.link && item.link !== 'Book' && item.link !== 'Deep Topic' && item.link !== 'Topic' && item.link !== 'User Custom Topic' ? (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-xs font-sans font-bold uppercase tracking-wider">
                                            <ExternalLink size={14} /> Source
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-sans font-bold uppercase tracking-wider">{item.link || item.category}</span>
                                    )}
                                </div>
                                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                                    <SimpleMarkdown text={item.snippet || item.explanation || ''} />
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 font-sans text-right">
                                    Saved {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </article>
        </main>
    )
}
