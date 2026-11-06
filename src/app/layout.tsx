import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { PlatformProvider } from "@/components/PlatformProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "OmniGraph K12（万象学阶）— 全球 9 地全科知识图谱与自适应题库系统",
  description:
    "支持中、日、韩、港、台、新、马、英、美 9 地课标映射的全科 K12 知识图谱教学网站、防刷穿参数化题库、FSRS 错题清零与学生/教师/家长三端协同平台。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <PlatformProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="no-print border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
              <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center justify-between gap-2">
                <span>
                  OmniGraph K12（万象学阶） · Clean-Room Commercial-Ready Architecture (MIT Code + Canonical Core + 9-Region Standard Overlays)
                </span>
                <span>
                  支持地区：🇨🇳中 · 🇭🇰港 · 🇹🇼台 · 🇸🇬新 · 🇲🇾马 · 🇯🇵日 · 🇰🇷韩 · 🇬🇧英 · 🇺🇸美
                </span>
              </div>
            </footer>
          </div>
        </PlatformProvider>
      </body>
    </html>
  );
}
