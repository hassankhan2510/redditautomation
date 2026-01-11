"use client"

import { useState } from "react"
import Link from 'next/link'
import { ModeToggle } from "@/components/mode-toggle"
import { Rocket, Search, Menu } from "lucide-react"

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="fixed top-0 md:top-6 left-0 right-0 z-[100] flex justify-center md:px-4 pointer-events-none">
            <nav className="pointer-events-auto glass-panel rounded-none md:rounded-full px-6 py-4 md:py-3 flex items-center justify-between gap-8 max-w-4xl w-full shadow-2xl bg-black/90 md:bg-black/80 backdrop-blur-xl border-b md:border border-white/10 md:border-white/20 relative">

                {/* BRAND */}
                <Link href="/" className="font-black text-xl flex items-center gap-2 tracking-tight text-white">
                    <div className="bg-primary/20 p-1.5 rounded-lg text-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                        <Rocket size={18} />
                    </div>
                    DeepResearch
                </Link>

                {/* CENTRAL NAV - DESKTOP */}
                <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
                    <NavLink href="/feed" icon={<Search size={14} />} label="Research" />
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-4">
                    <ModeToggle />

                    {/* MOBILE TOGGLE */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
                        <Menu size={24} />
                    </button>
                </div>

                {/* MOBILE MENU DROPDOWN */}
                {mobileMenuOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-col gap-2 md:hidden animate-in slide-in-from-top-4">
                        <MobileNavLink href="/feed" icon={<Search size={16} />} label="Research" onClick={() => setMobileMenuOpen(false)} />
                    </div>
                )}
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

function MobileNavLink({ href, icon, label, onClick }: any) {
    return (
        <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            {icon}
            {label}
        </Link>
    )
}
