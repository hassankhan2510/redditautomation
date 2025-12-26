"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground border relative w-9 h-9 flex items-center justify-center"
            aria-label="Toggle theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90 absolute" />
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0 absolute" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}

