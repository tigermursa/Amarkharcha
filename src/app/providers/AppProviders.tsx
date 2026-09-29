"use client";

import { ThemeProvider } from "next-themes";
import StoreProvider from "./StoreProvider";
import { ConfirmProvider } from "../components/ConfirmDialog";
import ToastProvider from "../components/ToastProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <StoreProvider>
        <ConfirmProvider>
          {children}
          <ToastProvider />
        </ConfirmProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
