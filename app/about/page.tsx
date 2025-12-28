"use client"

import { Brain, Cpu, Zap, Code2 } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl animate-in fade-in slide-in-from-bottom-4">

            {/* HEADER */}
            <div className="text-center mb-16">
                <div className="inline-block p-3 bg-primary/10 rounded-full mb-4 text-primary">
                    <Brain size={32} />
                </div>
                <h1 className="text-4xl font-bold mb-4">About the Builder</h1>
                <p className="text-xl text-muted-foreground">Turning abstract AI ideas into working, deployable systems.</p>
            </div>

            {/* BIO CARD */}
            <div className="bg-card border rounded-2xl p-8 shadow-sm mb-12 flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-card to-secondary/10">
                <div className="flex-1 space-y-4">
                    <h2 className="text-2xl font-bold">Hassan Khan</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        I am an AI systems builder focused on AI-powered automation, agent-based workflows, and real-world tooling.
                        My primary strength lies in avoiding mere demos and building performance-aware, scalable systems that solve actual problems.
                    </p>
                </div>
                <div className="w-full md:w-1/3 bg-background rounded-xl p-6 border text-sm space-y-2">
                    <div className="font-bold uppercase text-xs text-muted-foreground mb-2">Focus Areas</div>
                    <div className="flex items-center gap-2"><Zap size={14} className="text-yellow-500" /> AI Automation</div>
                    <div className="flex items-center gap-2"><Cpu size={14} className="text-blue-500" /> Agentic Workflows</div>
                    <div className="flex items-center gap-2"><Code2 size={14} className="text-green-500" /> Practical ML/DL</div>
                </div>
            </div>

            {/* SKILLS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* ML/DL */}
                <div className="bg-card border rounded-xl p-6 hover:shadow-md transition">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Cpu className="text-purple-500" /> Machine Learning & Deep Learning
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex gap-2"><span className="text-primary">•</span> ML/DL Model Integration</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Fine-tuning Pipelines</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Model Evaluation & Optimization</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Practical, Task-oriented ML Systems</li>
                    </ul>
                </div>

                {/* AUTOMATION */}
                <div className="bg-card border rounded-xl p-6 hover:shadow-md transition">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Zap className="text-orange-500" /> Automation & Orchestration
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                        <li className="flex gap-2"><span className="text-primary">•</span> End-to-end Automation Pipelines</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Multi-Agent Systems</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Scalable Tooling</li>
                        <li className="flex gap-2"><span className="text-primary">•</span> Performance Optimization</li>
                    </ul>
                </div>
            </div>

        </div>
    )
}
