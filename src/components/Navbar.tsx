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
  RotateCcw,
  Camera,
  FileSpreadsheet,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import { usePlatform } from "./PlatformProvider";
import type { RegionCode, UserRole } from "@/types/taxonomy";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    data,
    regionCode,
    setRegionCode,
    bilingual,
    setBilingual,
    activeRole,
    setActiveRole,
    activeStudentId,
    setActiveStudentId,
    resetDemoData,
  } = usePlatform();

  const students = (data?.users ?? []).filter((u) => u.role === "student");
  const dueWrongCount = (data?.wrongQuestions ?? []).filter(
    (w) => w.studentId === activeStudentId && w.status !== "cleared"
  ).length;

  const navItems = [
    { href: "/", label: "个人总览", icon: Compass, roles: ["student"] },
    { href: "/explore", label: "知识图谱星海", icon: Network, roles: ["student", "teacher", "parent"] },
    { href: "/diagnose", label: "靶向回溯诊断", icon: Crosshair, roles: ["student", "teacher"] },
    { href: "/capture", label: "AI智能录错题", icon: Camera, roles: ["student", "parent"] },
    {
      href: "/wrong-book",
      label: "FSRS 错题清零",
      icon: BookOpenCheck,
      badge: dueWrongCount > 0 ? dueWrongCount : undefined,
      roles: ["student", "parent"],
    },
    { href: "/teacher", label: "教师教研台", icon: GraduationCap, roles: ["teacher"] },
    { href: "/paper-builder", label: "9地组AB卷", icon: FileSpreadsheet, roles: ["teacher"] },
    { href: "/studio", label: "校本工坊/IRT", icon: FlaskConical, roles: ["teacher"] },
    { href: "/parent", label: "家长伴学空间", icon: Users, roles: ["parent"] },
    { href: "/auth", label: "账号/PIN/隐私盾", icon: ShieldCheck, roles: ["student", "teacher", "parent"] },
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
        {/* Top Row: Brand + 3-Role Switcher + 9-Region Switcher + Bilingual + Student Selector */}
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
                  万象学阶 · 9地全科
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Global Canonical Knowledge Graph & Adaptive Tutor
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {/* 3-Role Switcher */}
            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs">
              {(
                [
                  { key: "student", label: "🎒 学生端" },
                  { key: "teacher", label: "👩‍🏫 教师端" },
                  { key: "parent", label: "👨‍👧 家长端" },
                ] as const
              ).map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleRoleSwitch(r.key)}
                  className={`rounded-md px-2.5 py-1 font-medium transition ${
                    activeRole === r.key
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Active Student Persona Selector */}
            <select
              aria-label="切换当前学生档案"
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.avatarEmoji} {s.displayName} ({s.regionCode} G{s.currentGrade})
                </option>
              ))}
            </select>

            {/* 9-Region Curriculum & Notation Switcher */}
            <select
              aria-label="切换 9 地课标与学制"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value as RegionCode)}
              className="rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-2.5 py-1.5 text-xs font-semibold text-indigo-200 focus:border-indigo-400 focus:outline-none"
            >
              {(data?.regions ?? []).map((reg) => (
                <option key={reg.code} value={reg.code} className="bg-slate-900 text-slate-100">
                  {reg.flag} {reg.code} · {reg.nameZh}
                </option>
              ))}
            </select>

            {/* Bilingual Toggle */}
            <button
              onClick={() => setBilingual(!bilingual)}
              title="切换中英双语对照（适配香港 EMI / 新加坡 / 马来西亚 DLP / 国际课程衔接）"
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                bilingual
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Languages className="h-3.5 w-3.5" />
              <span>双语 {bilingual ? "ON" : "OFF"}</span>
            </button>

            {/* Reset Demo DB */}
            <button
              onClick={() => void resetDemoData()}
              title="重置演示数据库至初始状态"
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
