// src/components/ToastProvider.tsx
"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export default function ToastProvider() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      theme={(theme as "light" | "dark" | "system") || "system"}
      richColors
      closeButton
      toastOptions={{
        className: "font-sans",
        duration: 3500,
      }}
    />
  );
}
