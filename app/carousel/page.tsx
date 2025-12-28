"use client"

import { useState, useRef } from "react"
import { Download, Layout, Sparkles, Loader2, Plus, Trash2 } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function CarouselPage() {
    // State
    const [slides, setSlides] = useState<string[]>(["Start with a strong HOOK here.", "Share your first insight...", "Add a supporting point.", "Ending with a lesson."])
    const [theme, setTheme] = useState("bold")
    const [authorName, setAuthorName] = useState("@YourHandle")
    const [exporting, setExporting] = useState(false)

    // Refs for DOM capture
    const slidesRef = useRef<HTMLDivElement>(null)

    // Themes
    const THEMES: Record<string, any> = {
        "bold": { bg: "bg-yellow-400", text: "text-black", font: "font-black" },
        "minimal": { bg: "bg-white", text: "text-black", font: "font-serif" },
        "dark": { bg: "bg-zinc-900", text: "text-white", font: "font-sans" },
        "blue": { bg: "bg-blue-600", text: "text-white", font: "font-bold" }
    }

    const activeTheme = THEMES[theme]

    const handleExport = async () => {
        if (!slidesRef.current) return
        setExporting(true)

        try {
            const pdf = new jsPDF("p", "px", [1080, 1350]) // LinkedIn Portrait Ratio (4:5)
            const slideElements = slidesRef.current.children

            for (let i = 0; i < slideElements.length; i++) {
                const element = slideElements[i] as HTMLElement
                // Capture at high scale for quality
                const canvas = await html2canvas(element, { scale: 2, useCORS: true })
                const imgData = canvas.toDataURL("image/png")

                if (i > 0) pdf.addPage()
                // Add image filling the page
                pdf.addImage(imgData, "PNG", 0, 0, 1080, 1350)
            }

            pdf.save("linkedin-carousel.pdf")
        } catch (e) {
            console.error(e)
            alert("Export failed")
        } finally {
            setExporting(false)
        }
    }

    const updateSlide = (index: number, val: string) => {
        const newSlides = [...slides]
        newSlides[index] = val
        setSlides(newSlides)
    }

    const addSlide = () => setSlides([...slides, "New Slide"])
    const removeSlide = (idx: number) => setSlides(slides.filter((_, i) => i !== idx))

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl" suppressHydrationWarning>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Layout className="text-blue-600" />
                        LinkedIn Carousel Studio
                    </h1>
                    <p className="text-muted-foreground">Turn simple text into high-reach PDF carousels.</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                >
                    {exporting ? <Loader2 className="animate-spin" /> : <Download size={20} />}
                    {exporting ? "Generating PDF..." : "Download PDF"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* EDITOR SIDEBAR (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Settings */}
                    <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Sparkles size={16} className="text-yellow-500" />
                            Design Settings
                        </h2>

                        <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-muted-foreground">Theme</label>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.keys(THEMES).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`h-8 rounded border-2 transition-all ${theme === t ? 'border-foreground scale-110' : 'border-transparent opacity-70 hover:opacity-100'} ${THEMES[t].bg}`}
                                        title={t}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1 uppercase text-muted-foreground">Author Handle</label>
                            <input
                                className="w-full bg-background border rounded px-3 py-2 text-sm"
                                value={authorName}
                                onChange={e => setAuthorName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Slides List */}
                    <div className="space-y-3 h-[calc(100vh-400px)] overflow-y-auto pr-2 pb-10">
                        {slides.map((text, idx) => (
                            <div key={idx} className="group flex gap-2 items-start">
                                <div className="text-xs font-mono py-2 w-6 text-center text-muted-foreground">{idx + 1}</div>
                                <textarea
                                    className="flex-1 bg-card border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[80px]"
                                    value={text}
                                    onChange={e => updateSlide(idx, e.target.value)}
                                />
                                <button onClick={() => removeSlide(idx)} className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button onClick={addSlide} className="w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition font-medium">
                            <Plus size={16} /> Add Slide
                        </button>
                    </div>
                </div>

                {/* PREVIEW AREA (8 Cols) */}
                <div className="lg:col-span-8 bg-secondary/20 border rounded-xl p-8 flex items-center justify-center overflow-auto min-h-[600px] relative">
                    <div className="absolute top-4 left-4 text-xs font-mono text-muted-foreground">
                        Preview (1080x1350px)
                    </div>

                    {/* HIDDEN CONTAINER FOR PDF GENERATION (Rendered Off-Screen usually, but here specific for capture) */}
                    {/* We actually render it visible for preview, but at a scale. 
                        Wait, HTML2Canvas works best if elements are actual size in DOM.
                        We can use CSS transform scale to fit it in UI, but keep actual size.
                    */}
                    <div className="overflow-x-auto w-full flex justify-center">
                        <div
                            ref={slidesRef}
                            style={{
                                width: '1080px',
                                transform: 'scale(0.4)',
                                transformOrigin: 'top center',
                                marginBottom: '-400px' // Offset the scale gap
                            }}
                            className="space-y-8" // Add space between slides used ONLY during capture logic if we were capturing page by page, but logic loops children.
                        >
                            {slides.map((text, idx) => (
                                /* SINGLE SLIDE (1080x1350) */
                                <div
                                    key={idx}
                                    className={`w-[1080px] h-[1350px] relative flex flex-col p-16 ${activeTheme.bg} ${activeTheme.text} shadow-2xl overflow-hidden`}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-16">
                                        <div className="opacity-80 text-3xl font-bold">{authorName}</div>
                                        <div className="opacity-50 text-3xl font-mono">{idx + 1}/{slides.length}</div>
                                    </div>

                                    {/* Content (Auto-centered) */}
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className={`text-[80px] leading-tight text-center whitespace-pre-wrap ${activeTheme.font}`}>
                                            {text}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-16 flex justify-center opacity-40">
                                        <div className="h-2 w-32 bg-current rounded-full" />
                                    </div>

                                    {/* Swipe Arrow for first few slides */}
                                    {idx < slides.length - 1 && (
                                        <div className="absolute bottom-12 right-12 text-4xl animate-pulse">
                                            →
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
