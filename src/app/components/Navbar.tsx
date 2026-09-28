// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import ThemeToggle from "./ThemeToggle";
import PeriodSelector from "./PeriodSelector";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/categories", label: "Categories" },
  { href: "/periods", label: "Periods" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-base md:text-lg font-bold text-foreground shrink-0"
        >
          Amar Kharcha
        </Link>

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
          {session &&
            NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs md:text-sm font-medium transition whitespace-nowrap ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

          {session && <PeriodSelector />}

          <ThemeToggle />

          {session && (
            <button
              onClick={handleLogout}
              className="text-xs md:text-sm font-medium text-muted-foreground hover:text-red-500 transition whitespace-nowrap"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
