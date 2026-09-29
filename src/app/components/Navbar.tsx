// src/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import ThemeToggle from "./ThemeToggle";
import PeriodSelector from "./PeriodSelector";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaListAlt,
  FaChartBar,
  FaTags,
  FaCalendarAlt,
  FaSignOutAlt,
  FaHandHoldingUsd,
  FaBriefcase,
} from "react-icons/fa";

import type { IconType } from "react-icons";

const NAV_LINKS: { href: string; label: string; icon: IconType }[] = [
  { href: "/", label: "Home", icon: FaHome },
  { href: "/transactions", label: "Transactions", icon: FaListAlt },
  { href: "/pending", label: "Pending", icon: FaHandHoldingUsd },
  { href: "/dashboard", label: "Dashboard", icon: FaChartBar },
  { href: "/categories", label: "Categories", icon: FaTags },
  { href: "/periods", label: "Periods", icon: FaCalendarAlt },
  { href: "/business", label: "Business", icon: FaBriefcase },
];
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const handleLogout = async () => {
    setDrawerOpen(false);
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const showDrawer = Boolean(session);

  return (
    <>
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16 gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="text-base md:text-lg font-bold text-foreground shrink-0"
            >
              Amar Kharcha
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {session &&
                NAV_LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
            </div>

            {/* Desktop right side */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {session && <PeriodSelector />}
              <ThemeToggle />
              {session && (
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                >
                  <FaSignOutAlt className="text-sm" />
                </button>
              )}
            </div>

            {/* Mobile right side */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              {session && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  className="p-2 rounded-lg text-foreground hover:bg-muted active:scale-95 transition"
                >
                  <FaBars className="text-lg" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer (always mounted, animated) */}
      {showDrawer && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            aria-hidden
            className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
              drawerOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Drawer */}
          <aside
            role="dialog"
            aria-label="Navigation menu"
            aria-hidden={!drawerOpen}
            className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-card border-l border-border shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-out will-change-transform ${
              drawerOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold text-foreground">Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Period selector */}
            <div className="p-4 border-b border-border">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 tracking-wider">
                Active Period
              </p>
              <PeriodSelector fullWidth />
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_LINKS.map((link, i) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      transitionDelay: drawerOpen ? `${i * 40}ms` : "0ms",
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      drawerOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-4"
                    } ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="text-base shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 active:scale-[0.98] transition"
              >
                <FaSignOutAlt className="text-base shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
