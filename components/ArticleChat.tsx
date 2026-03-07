import { useState } from "react"
import { Send, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

export function ArticleChat({ articleContent, previousExplanation }: { articleContent: string, previousExplanation: string }) {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = { role: 'user' as const, content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articleContent,
                    previousExplanation,
                    question: userMsg.content,
                    chatHistory: messages
                })
            })

            const data = await res.json()
            if (data.answer) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
            } else {
                toast.error("Failed to get answer")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-lg font-bold flex items-center gap-2 mb-6 font-sans">
                <Sparkles className="w-5 h-5 text-gray-500" />
                Ask Follow-Up Questions
            </h4>

            <div className="space-y-6 mb-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-6 py-4 rounded-2xl max-w-[85%] ${msg.role === 'user'
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 ml-auto'
                                : 'bg-gray-100 dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800'
                            }`}>
                            <p className="text-base leading-relaxed font-serif whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the Professor..."
                    className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-700 rounded-full pl-6 pr-14 py-4 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all font-sans"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-2 bottom-2 p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </form>
        </div>
    )
}
