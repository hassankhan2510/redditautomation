"use client"

import Link from 'next/link'
import { ModeToggle } from "@/components/mode-toggle"
import { Rocket, PenTool, BarChart, Search, Sparkles } from "lucide-react"

export function Navbar() {
    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <nav className="glass-panel rounded-full px-6 py-3 flex items-center justify-between gap-8 max-w-4xl w-full shadow-2xl bg-black/40 backdrop-blur-md border md:border-white/10">

                {/* BRAND */}
                <Link href="/" className="font-black text-xl flex items-center gap-2 tracking-tight text-white">
                    <div className="bg-primary/20 p-1.5 rounded-lg text-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                        <Rocket size={18} />
                    </div>
                    SoloScale
                </Link>

                {/* CENTRAL NAV - THE BIG 3 */}
                <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
                    <NavLink href="/studio" icon={<PenTool size={14} />} label="Studio" />
                    <NavLink href="/radar" icon={<BarChart size={14} />} label="Radar" />
                    <NavLink href="/feed" icon={<Search size={14} />} label="Research" />
                    <NavLink href="/remix" icon={<Sparkles size={14} />} label="Remix" />
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-4">
                    <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                        About
                    </Link>
                    <ModeToggle />
                </div>
            </nav>
        </div>
    )
}

function NavLink({ href, icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link href={href} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
            {icon}
            {label}
        </Link>
    )
}
