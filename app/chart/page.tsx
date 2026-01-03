"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, Download, BarChart2, Share2, Loader2, ArrowLeft } from "lucide-react"
import mermaid from "mermaid"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import html2canvas from "html2canvas"
import Link from "next/link"

// Colors for Charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ChartPage() {
    const [topic, setTopic] = useState("")
    const [type, setType] = useState("flowchart") // flowchart, bar, pie
    const [loading, setLoading] = useState(false)
    const [chartData, setChartData] = useState<any>(null) // The JSON or Mermaid String
    const [chartType, setChartType] = useState<string | null>(null) // Logic state

    const chartRef = useRef<HTMLDivElement>(null)

    // Init Mermaid
    useEffect(() => {
        mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' })
    }, [])

    // Re-render Mermaid when data changes
    useEffect(() => {
        if (chartType === 'flowchart' && chartData) {
            mermaid.contentLoaded()
        }
    }, [chartData, chartType])

    const handleGenerate = async () => {
        if (!topic) return
        setLoading(true)
        setChartData(null)
        setChartType(type) // Lock it in

        try {
            const res = await fetch('/api/chart/generate', {
                method: 'POST', body: JSON.stringify({ topic, type })
            })
            const data = await res.json()

            if (data.type === 'flowchart') {
                setChartData(data.output)
            } else {
                // Parse JSON for Recharts
                try {
                    setChartData(JSON.parse(data.output))
                } catch (e) {
                    alert("Failed to parse chart data")
                }
            }
        } catch (e) { alert("Error generating chart") }
        setLoading(false)
    }

    const handleExport = async () => {
        if (!chartRef.current) return
        try {
            const canvas = await html2canvas(chartRef.current, { scale: 3, backgroundColor: '#000000' })
            const image = canvas.toDataURL("image/png")
            const link = document.createElement('a')
            link.href = image
            link.download = `chartist-${Date.now()}.png`
            link.click()
        } catch (e) { alert("Export failed") }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl min-h-screen">
            <Link href="/studio" className="flex items-center gap-2 text-muted-foreground hover:text-white mb-8 text-sm">
                <ArrowLeft size={16} /> Back to Studio
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* CONTROLS */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
                        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                            <BarChart2 /> The Chartist
                        </h1>
                        <p className="opacity-80 text-sm mb-6">Turn concepts into viral visuals.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase opacity-70 block mb-1">Topic / Data</label>
                                <textarea
                                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 min-h-[100px]"
                                    placeholder="e.g. 'System Design of Netflix' or 'Comparison of Python vs Go performance'"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase opacity-70 block mb-1">Visual Format</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['flowchart', 'bar', 'pie'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t)}
                                            className={`py-2 text-xs font-bold rounded-lg capitalize transition ${type === t ? 'bg-white text-indigo-600' : 'bg-white/10 hover:bg-white/20'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading || !topic}
                                className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition shadow-lg disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
                                Generate Visual
                            </button>
                        </div>
                    </div>

                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="font-bold text-sm mb-2">Pro Tips</h3>
                        <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                            <li>Flowcharts work best for <strong>Systems</strong> and <strong>Processes</strong>.</li>
                            <li>Bar Charts work best for <strong>Comparisons</strong>.</li>
                            <li>Keep topics specific for better diagrams.</li>
                        </ul>
                    </div>
                </div>

                {/* VISUALIZER */}
                <div className="lg:col-span-8">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 min-h-[600px] flex flex-col relative shadow-2xl">
                        <div className="absolute top-4 left-4 text-xs font-mono text-zinc-500">Preview (1200x1200px)</div>
                        {chartData && (
                            <button
                                onClick={handleExport}
                                className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition"
                            >
                                <Download size={14} /> Export PNG
                            </button>
                        )}

                        <div className="flex-1 flex items-center justify-center bg-black rounded-xl overflow-hidden mt-8" ref={chartRef}>
                            {/* RENDER LOGIC */}
                            {!chartData && !loading && (
                                <div className="text-center text-zinc-600">
                                    <BarChart2 size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>Ready to visualize.</p>
                                </div>
                            )}

                            {loading && <Loader2 className="animate-spin text-indigo-500" size={48} />}

                            {chartData && chartType === 'flowchart' && (
                                <div className="mermaid scale-110 p-10 bg-black text-white w-full flex justify-center">
                                    {chartData}
                                </div>
                            )}

                            {chartData && chartType === 'bar' && (
                                <div className="w-full h-[500px] p-8 bg-black">
                                    <h2 className="text-center text-2xl font-bold text-white mb-8 capitalize">{topic}</h2>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData.data}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="name" stroke="#888" />
                                            <YAxis stroke="#888" label={{ value: chartData.yLabel, angle: -90, position: 'insideLeft', fill: '#888' }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                                                {chartData.data.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {chartData && chartType === 'pie' && (
                                <div className="w-full h-[500px] p-8 bg-black">
                                    <h2 className="text-center text-2xl font-bold text-white mb-8 capitalize">{topic}</h2>
                                    <ResponsiveContainer width="100%" height="80%">
                                        <PieChart>
                                            <Pie
                                                data={chartData.data}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {chartData.data.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
