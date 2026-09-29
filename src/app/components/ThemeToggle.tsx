// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FaSun, FaMoon, FaDesktop } from "react-icons/fa";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="relative w-16 h-8 rounded-full bg-muted border border-border"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-full bg-muted border border-border">
      <button
        onClick={() => setTheme("light")}
        aria-label="Light theme"
        title="Light"
        className={`relative p-1.5 rounded-full transition-all duration-300 ${
          theme === "light"
            ? "bg-card text-yellow-500 shadow-sm scale-100"
            : "text-muted-foreground hover:text-foreground scale-95"
        }`}
      >
        <FaSun className="text-xs" />
      </button>

      <button
        onClick={() => setTheme("system")}
        aria-label="System theme"
        title="System"
        className={`relative p-1.5 rounded-full transition-all duration-300 ${
          theme === "system"
            ? "bg-card text-primary shadow-sm scale-100"
            : "text-muted-foreground hover:text-foreground scale-95"
        }`}
      >
        <FaDesktop className="text-xs" />
      </button>

      <button
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
        title="Dark"
        className={`relative p-1.5 rounded-full transition-all duration-300 ${
          theme === "dark"
            ? "bg-card text-indigo-400 shadow-sm scale-100"
            : "text-muted-foreground hover:text-foreground scale-95"
        }`}
      >
        <FaMoon className="text-xs" />
      </button>
    </div>
  );
}
