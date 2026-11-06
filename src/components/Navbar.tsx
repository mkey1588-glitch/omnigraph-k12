"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Network,
  Compass,
  Crosshair,
  BookOpenCheck,
  GraduationCap,
  Users,
  Languages,
  Globe,
  RotateCcw,
  Camera,
  FileSpreadsheet,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import { usePlatform } from "./PlatformProvider";
import type { LocaleCode, RegionCode, UserRole } from "@/types/taxonomy";
import { LOCALE_OPTIONS } from "@/lib/i18n";
import { NAV_COPY } from "@/lib/i18n/ui-common";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    data,
    locale,
    setLocale,
    regionCode,
    setRegionCode,
    bilingual,
    setBilingual,
    activeRole,
    setActiveRole,
    activeStudentId,
    setActiveStudentId,
    resetDemoData,
    pick,
    userName,
    regionName,
  } = usePlatform();

  const students = (data?.users ?? []).filter((u) => u.role === "student");
  const dueWrongCount = (data?.wrongQuestions ?? []).filter(
    (w) => w.studentId === activeStudentId && w.status !== "cleared"
  ).length;

  const navItems = [
    { href: "/", label: pick(NAV_COPY.tabs.overview), icon: Compass, roles: ["student"] },
    {
      href: "/explore",
      label: pick(NAV_COPY.tabs.explore),
      icon: Network,
      roles: ["student", "teacher", "parent"],
    },
    {
      href: "/diagnose",
      label: pick(NAV_COPY.tabs.diagnose),
      icon: Crosshair,
      roles: ["student", "teacher"],
    },
    {
      href: "/capture",
      label: pick(NAV_COPY.tabs.capture),
      icon: Camera,
      roles: ["student", "parent"],
    },
    {
      href: "/wrong-book",
      label: pick(NAV_COPY.tabs.wrongBook),
      icon: BookOpenCheck,
      badge: dueWrongCount > 0 ? dueWrongCount : undefined,
      roles: ["student", "parent"],
    },
    {
      href: "/teacher",
      label: pick(NAV_COPY.tabs.teacher),
      icon: GraduationCap,
      roles: ["teacher"],
    },
    {
      href: "/paper-builder",
      label: pick(NAV_COPY.tabs.paperBuilder),
      icon: FileSpreadsheet,
      roles: ["teacher"],
    },
    {
      href: "/studio",
      label: pick(NAV_COPY.tabs.studio),
      icon: FlaskConical,
      roles: ["teacher"],
    },
    {
      href: "/parent",
      label: pick(NAV_COPY.tabs.parent),
      icon: Users,
      roles: ["parent"],
    },
    {
      href: "/auth",
      label: pick(NAV_COPY.tabs.auth),
      icon: ShieldCheck,
      roles: ["student", "teacher", "parent"],
    },
  ];

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role);
    if (role === "teacher" && pathname !== "/teacher" && pathname !== "/explore") {
      router.push("/teacher");
    } else if (role === "parent" && !pathname.startsWith("/parent") && pathname !== "/explore") {
      router.push("/parent");
    } else if (role === "student" && (pathname === "/teacher" || pathname.startsWith("/parent"))) {
      router.push("/");
    }
  };

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Row: Brand + 3-Role Switcher + Student + 9-Region + 6-Locale UI Language + Bilingual */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-2.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white">
                  OmniGraph K12
                </span>
                <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                  {pick(NAV_COPY.brandBadge)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {pick(NAV_COPY.brandSubtitle)}
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {/* 3-Role Switcher */}
            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs">
              {(["student", "teacher", "parent"] as const).map((roleKey) => (
                <button
                  key={roleKey}
                  onClick={() => handleRoleSwitch(roleKey)}
                  className={`rounded-md px-2.5 py-1 font-medium transition ${
                    activeRole === roleKey
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {pick(NAV_COPY.roles[roleKey])}
                </button>
              ))}
            </div>

            {/* Active Student Persona Selector */}
            <select
              aria-label={pick(NAV_COPY.studentAria)}
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.avatarEmoji} {userName(s)} ({s.regionCode} G{s.currentGrade})
                </option>
              ))}
            </select>

            {/* 9-Region Curriculum & Notation Switcher */}
            <select
              aria-label={pick(NAV_COPY.regionAria)}
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value as RegionCode)}
              className="rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-2.5 py-1.5 text-xs font-semibold text-indigo-200 focus:border-indigo-400 focus:outline-none"
            >
              {(data?.regions ?? []).map((reg) => (
                <option key={reg.code} value={reg.code} className="bg-slate-900 text-slate-100">
                  {reg.flag} {reg.code} · {regionName(reg.code)}
                </option>
              ))}
            </select>

            {/* Explicit 6-Locale UI Language Switcher */}
            <div className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-950/30 px-2 py-1 text-xs text-cyan-200">
              <Globe className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <select
                aria-label={pick(NAV_COPY.localeAria)}
                value={locale}
                onChange={(e) => setLocale(e.target.value as LocaleCode)}
                className="bg-transparent font-semibold text-cyan-100 focus:outline-none cursor-pointer"
              >
                {LOCALE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code} className="bg-slate-900 text-slate-100">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bilingual Toggle */}
            <button
              onClick={() => setBilingual(!bilingual)}
              title={pick(NAV_COPY.bilingualTitle)}
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                bilingual
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Languages className="h-3.5 w-3.5" />
              <span>
                {pick(NAV_COPY.bilingualBtn)} {bilingual ? "ON" : "OFF"}
              </span>
            </button>

            {/* Reset Demo DB */}
            <button
              onClick={() => void resetDemoData()}
              title={pick(NAV_COPY.resetDemoTitle)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Second Row: Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-2 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const isHighlightedForRole = item.roles.includes(activeRole);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white ring-1 ring-indigo-500/50"
                    : isHighlightedForRole
                      ? "text-slate-300 hover:bg-slate-900 hover:text-white"
                      : "text-slate-500 hover:bg-slate-900/60 hover:text-slate-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-indigo-400" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-300 border border-rose-500/40">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
