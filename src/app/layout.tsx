import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { PlatformProvider } from "@/components/PlatformProvider";
import { Navbar } from "@/components/Navbar";
import { AppFooter } from "@/components/AppFooter";

export const metadata: Metadata = {
  title: "OmniGraph K12 — Global 9-Region Knowledge Graph & Adaptive Learning Platform",
  description:
    "All-subject K12 Knowledge Graph teaching platform, anti-memorization parameterized question bank, FSRS spaced clearance, and Student/Teacher/Parent workspace across CN, HK, TW, SG, MY, JP, KR, UK, and US.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <PlatformProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <AppFooter />
          </div>
        </PlatformProvider>
      </body>
    </html>
  );
}
