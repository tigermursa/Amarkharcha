// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import StoreProvider from "./providers/StoreProvider";
import Navbar from "./components/Navbar";
import ToastProvider from "./components/ToastProvider";
import { ConfirmProvider } from "./components/ConfirmDialog";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amar Kharcha - Track Your Expenses",
  description: "Track your daily expenses easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <ConfirmProvider>
              <Navbar />
              {children}
              <ToastProvider />
            </ConfirmProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
