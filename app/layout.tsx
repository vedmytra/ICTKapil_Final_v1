import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "IctKapil — Forex Trading Cockpit",
  description: "Premium ICT / Smart Money Concepts trading journal, backtester and dashboard.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
