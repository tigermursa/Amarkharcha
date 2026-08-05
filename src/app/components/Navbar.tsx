// components/Navbar.tsx
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <Link href="/" className="text-xl font-bold text-foreground">
        Amar Kharcha
      </Link>
      <ThemeToggle />
    </nav>
  );
}
