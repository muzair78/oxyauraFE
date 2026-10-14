"use client";

import Image from "next/image";
import AppSidebar from "@/components/dashboard/AppSidebar";
import logo from "@/public/images/oxyauraai_svg_logo.svg";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getUser } from "@/lib/auth";
import { Activity, AlertTriangle, Check, CheckCircle2, HeartPulse, Sparkles, User } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- Last 7 days static data ---
const bpData = [
  { day: "Mon", systolic: 118, diastolic: 76 },
  { day: "Tue", systolic: 122, diastolic: 80 },
  { day: "Wed", systolic: 145, diastolic: 95 }, // spike — dangerous
  { day: "Thu", systolic: 125, diastolic: 82 },
  { day: "Fri", systolic: 119, diastolic: 78 },
  { day: "Sat", systolic: 117, diastolic: 75 },
  { day: "Sun", systolic: 120, diastolic: 77 },
];

const hrData = [
  { day: "Mon", bpm: 72 },
  { day: "Tue", bpm: 75 },
  { day: "Wed", bpm: 103 }, // spike — dangerous
  { day: "Thu", bpm: 78 },
  { day: "Fri", bpm: 74 },
  { day: "Sat", bpm: 68 },
  { day: "Sun", bpm: 71 },
];

// --- Derive status from latest (Sun) reading ---
function getBPStatus(s: number, d: number) {
  if (s >= 140 || d >= 90) return { label: "Dangerous", color: "bg-rose-100 text-rose-600 border-rose-200", icon: "danger" };
  if (s >= 130 || d >= 80) return { label: "Elevated", color: "bg-amber-100 text-amber-600 border-amber-200", icon: "warn" };
  if (s >= 90 && d >= 60)  return { label: "Good", color: "bg-emerald-100 text-emerald-600 border-emerald-200", icon: "good" };
  return { label: "Low", color: "bg-sky-100 text-sky-600 border-sky-200", icon: "warn" };
}

function getHRStatus(bpm: number) {
  if (bpm > 100) return { label: "Dangerous", color: "bg-rose-100 text-rose-600 border-rose-200", icon: "danger" };
  if (bpm > 90)  return { label: "Elevated", color: "bg-amber-100 text-amber-600 border-amber-200", icon: "warn" };
  if (bpm >= 60) return { label: "Good", color: "bg-emerald-100 text-emerald-600 border-emerald-200", icon: "good" };
  return { label: "Low", color: "bg-sky-100 text-sky-600 border-sky-200", icon: "warn" };
}

const latestBP  = bpData[bpData.length - 1];
const latestHR  = hrData[hrData.length - 1];
const bpStatus  = getBPStatus(latestBP.systolic, latestBP.diastolic);
const hrStatus  = getHRStatus(latestHR.bpm);

const tooltipStyle = {
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "11px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

function StatusIcon({ type }: { type: string }) {
  if (type === "good")   return <CheckCircle2 className="size-3.5 text-emerald-500" />;
  if (type === "danger") return <AlertTriangle className="size-3.5 text-rose-500" />;
  return <AlertTriangle className="size-3.5 text-amber-500" />;
}

export default function Dashboard() {
  const user = getUser();
  const doctorName = user?.fullname ? `Dr. ${user.fullname}` : "Doctor";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur-md sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-sm font-semibold">Dashboard</h1>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Welcome back, {user?.fullname?.split(" ")[0] ?? "Doctor"}
            </p>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-neutral-950">

          {/* AI Assistant Banner Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100/90 p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -bottom-12 -right-12 size-72 rounded-full bg-gradient-to-br from-emerald-100/60 via-teal-100/40 to-cyan-100/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Image src={logo} alt="Oxyaura AI" width={56} height={56} className="shrink-0" />
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Oxyaura<span className="text-primary"> AI</span>
                </span>
              </div>
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-600 shadow-xs hover:bg-slate-50 transition cursor-pointer">
                <User className="size-4.5" />
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-[#008B8B] border border-emerald-100/80">
                  <Sparkles className="size-3.5 text-[#008B8B]" />
                  <span>AI Clinical Assistant</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back, {doctorName}
                </h2>
                <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-500 max-w-xl">
                  Your AI health assistant is ready to support you.
                </p>
              </div>

              <div className="flex shrink-0 items-center self-start md:self-end">
                <div className="flex items-center gap-3.5 rounded-full bg-white/90 backdrop-blur-md px-5 py-3 shadow-md shadow-slate-200/50 border border-slate-100">
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#00A896] text-white shrink-0 shadow-xs">
                    <Check className="size-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Baseline Calibrated</p>
                    <p className="text-[11px] font-medium text-slate-400">All Markers Normal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Health Trend Charts */}
          <div className="grid gap-5 lg:grid-cols-2">

            {/* Blood Pressure — 7 Day Trend */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-rose-50">
                    <Activity className="size-4.5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Blood Pressure</p>
                    <p className="text-xs text-slate-400">Last 7 days · mmHg</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${bpStatus.color}`}>
                  <StatusIcon type={bpStatus.icon} />
                  {bpStatus.label}
                </span>
              </div>

              {/* Latest reading */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight text-slate-900">
                  {latestBP.systolic}/{latestBP.diastolic}
                </span>
                <span className="text-sm font-medium text-slate-400">mmHg today</span>
              </div>

              {/* Chart */}
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bpData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashBpSys" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="dashBpDia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <YAxis domain={[60, 160]} hide />
                    {/* Danger threshold line */}
                    <ReferenceLine y={140} stroke="#f43f5e" strokeDasharray="4 3" strokeOpacity={0.6}
                      label={{ value: "Danger 140", position: "insideTopRight", fontSize: 10, fill: "#f43f5e" }} />
                    <Tooltip contentStyle={tooltipStyle}
                      formatter={(v: unknown, n: unknown) => [`${v ?? 0} mmHg`, n === "systolic" ? "Systolic" : "Diastolic"]} />
                    <Area type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2.5} fill="url(#dashBpSys)" />
                    <Area type="monotone" dataKey="diastolic" stroke="#fb923c" strokeWidth={2} strokeDasharray="4 3" fill="url(#dashBpDia)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-slate-500 -mt-2 border-t pt-3">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-rose-500" /> Systolic</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-orange-400" /> Diastolic</span>
                <span className="flex items-center gap-1.5 ml-auto text-rose-400 font-medium">
                  <AlertTriangle className="size-3" /> Wed spike detected
                </span>
              </div>
            </div>

            {/* Heart Rate — 7 Day Trend */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                    <HeartPulse className="size-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Heart Rate</p>
                    <p className="text-xs text-slate-400">Last 7 days · bpm</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${hrStatus.color}`}>
                  <StatusIcon type={hrStatus.icon} />
                  {hrStatus.label}
                </span>
              </div>

              {/* Latest reading */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tight text-slate-900">{latestHR.bpm}</span>
                <span className="text-sm font-medium text-slate-400">bpm today</span>
              </div>

              {/* Chart */}
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hrData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashHr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#008B8B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#008B8B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <YAxis domain={[50, 120]} hide />
                    {/* Danger threshold */}
                    <ReferenceLine y={100} stroke="#f43f5e" strokeDasharray="4 3" strokeOpacity={0.6}
                      label={{ value: "Danger 100", position: "insideTopRight", fontSize: 10, fill: "#f43f5e" }} />
                    {/* Normal range band */}
                    <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.4}
                      label={{ value: "Min 60", position: "insideBottomRight", fontSize: 10, fill: "#10b981" }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v ?? 0} bpm`, "Heart Rate"]} />
                    <Area type="monotone" dataKey="bpm" stroke="#008B8B" strokeWidth={2.5} fill="url(#dashHr)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-slate-500 -mt-2 border-t pt-3">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary" /> Heart Rate</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 border-t-2 border-dashed border-rose-400" /> Danger &gt;100
                </span>
                <span className="flex items-center gap-1.5 ml-auto text-rose-400 font-medium">
                  <AlertTriangle className="size-3" /> Wed spike detected
                </span>
              </div>
            </div>

          </div>

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
