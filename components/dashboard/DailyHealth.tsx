"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Activity, Clock, Droplets, Flame, FlaskConical, HeartPulse, Plus, Scale, Thermometer, Wind, X } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- Static Data (hourly readings, single patient today) ---
const bpData = [
  { t: "06:00", systolic: 116, diastolic: 74 },
  { t: "07:00", systolic: 119, diastolic: 77 },
  { t: "08:00", systolic: 122, diastolic: 80 },
  { t: "09:00", systolic: 120, diastolic: 78 },
  { t: "10:00", systolic: 118, diastolic: 76 },
  { t: "11:00", systolic: 121, diastolic: 79 },
  { t: "12:00", systolic: 123, diastolic: 81 },
  { t: "13:00", systolic: 120, diastolic: 77 },
];

const sugarData = [
  { t: "06:00", level: 88 },
  { t: "07:00", level: 95 },
  { t: "08:00", level: 110 },
  { t: "09:00", level: 104 },
  { t: "10:00", level: 98 },
  { t: "11:00", level: 102 },
  { t: "12:00", level: 115 },
  { t: "13:00", level: 97 },
];

const heartRateData = [
  { t: "06:00", bpm: 68 },
  { t: "07:00", bpm: 72 },
  { t: "08:00", bpm: 75 },
  { t: "09:00", bpm: 71 },
  { t: "10:00", bpm: 70 },
  { t: "11:00", bpm: 74 },
  { t: "12:00", bpm: 78 },
  { t: "13:00", bpm: 71 },
];

// SpO₂ — last 7 days (daily average)
const spo2Data = [
  { t: "Mon", spo2: 97 },
  { t: "Tue", spo2: 98 },
  { t: "Wed", spo2: 96 },
  { t: "Thu", spo2: 99 },
  { t: "Fri", spo2: 98 },
  { t: "Sat", spo2: 97 },
  { t: "Sun", spo2: 98 },
];

// Weight — last 30 days (daily reading)
const weightData = [
  { t: "Aug 9",  kg: 75.2 }, { t: "Aug 10", kg: 75.0 }, { t: "Aug 11", kg: 74.9 },
  { t: "Aug 12", kg: 74.8 }, { t: "Aug 13", kg: 74.9 }, { t: "Aug 14", kg: 74.7 },
  { t: "Aug 15", kg: 74.6 }, { t: "Aug 16", kg: 74.8 }, { t: "Aug 17", kg: 74.5 },
  { t: "Aug 18", kg: 74.4 }, { t: "Aug 19", kg: 74.6 }, { t: "Aug 20", kg: 74.3 },
  { t: "Aug 21", kg: 74.5 }, { t: "Aug 22", kg: 74.2 }, { t: "Aug 23", kg: 74.4 },
  { t: "Aug 24", kg: 74.1 }, { t: "Aug 25", kg: 74.3 }, { t: "Aug 26", kg: 74.0 },
  { t: "Aug 27", kg: 74.2 }, { t: "Aug 28", kg: 74.1 }, { t: "Aug 29", kg: 74.3 },
  { t: "Aug 30", kg: 74.0 }, { t: "Aug 31", kg: 74.2 }, { t: "Sep 1",  kg: 74.1 },
  { t: "Sep 2",  kg: 74.3 }, { t: "Sep 3",  kg: 74.0 }, { t: "Sep 4",  kg: 74.2 },
  { t: "Sep 5",  kg: 74.1 }, { t: "Sep 6",  kg: 74.3 }, { t: "Sep 7",  kg: 74.2 },
];

// Temperature — single current reading (no trend line needed)
const tempReading = 36.7;

// Water Intake — today's hourly log (glasses, target 8/day)
const waterData = [
  { t: "06:00", glasses: 1 },
  { t: "07:00", glasses: 1 },
  { t: "08:00", glasses: 1 },
  { t: "09:00", glasses: 1 },
  { t: "10:00", glasses: 1 },
  { t: "11:00", glasses: 0 },
  { t: "12:00", glasses: 1 },
  { t: "13:00", glasses: 0 },
];
const waterConsumed = waterData.reduce((s, d) => s + d.glasses, 0); // 6
const waterTarget = 8;

// Calories — today's meals
const caloriesData = [
  { meal: "Breakfast", kcal: 420 },
  { meal: "Snack",     kcal: 180 },
  { meal: "Lunch",     kcal: 650 },
  { meal: "Snack",     kcal: 120 },
  { meal: "Dinner",    kcal: 0   }, // not yet
];
const totalKcal = caloriesData.reduce((s, d) => s + d.kcal, 0); // 1370
const kcalTarget = 2000;

// BMI — single calculated value
const bmiValue = 24.6; // weight 74.2 kg / height 1.74m²
const bmiCategory = "Normal";

// --- Shared tooltip style ---
const tooltipStyle = {
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "11px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

function getBpStatus(systolic: number | null, diastolic: number | null) {
  if (systolic == null || diastolic == null) {
    return { label: "No data", className: "bg-slate-100 text-slate-500" };
  }
  if (systolic >= 180 || diastolic >= 120) {
    return { label: "Crisis", className: "bg-rose-50 text-rose-600" };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return { label: "High", className: "bg-rose-50 text-rose-600" };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return { label: "Stage 1", className: "bg-amber-50 text-amber-600" };
  }
  if (systolic >= 120) {
    return { label: "Elevated", className: "bg-amber-50 text-amber-600" };
  }
  return { label: "Normal", className: "bg-emerald-50 text-emerald-600" };
}

function toReadingNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function bpChartDomain(systolic: number | null, diastolic: number | null): [number, number] {
  if (systolic == null && diastolic == null) return [40, 180];
  const sys = systolic ?? 120;
  const dia = diastolic ?? 80;
  const low = Math.min(sys, dia);
  const high = Math.max(sys, dia);
  return [Math.max(0, low - 25), high + 25];
}

/** Arterial-style pulse scaled to the latest systolic / diastolic reading. */
function buildBpPulseSeries(systolic: number, diastolic: number, offset = 0, points = 48) {
  const range = Math.max(systolic - diastolic, 8);
  const cycle = 16;
  return Array.from({ length: points }, (_, i) => {
    const x = ((i + offset) % cycle) / cycle;
    let shape: number;
    if (x < 0.12) shape = x / 0.12;
    else if (x < 0.22) shape = 1 - ((x - 0.12) / 0.1) * 0.42;
    else if (x < 0.34) shape = 0.58 + ((x - 0.22) / 0.12) * 0.16;
    else shape = 0.74 * Math.exp(-(x - 0.34) * 6);
    return {
      t: i,
      systolic: Math.round(diastolic + range * shape),
      diastolic,
    };
  });
}

function useRealtimeBP(systolic: number | null, diastolic: number | null) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (systolic == null || diastolic == null) return;
    const id = setInterval(() => {
      setOffset((prev) => prev + 1);
    }, 120);
    return () => clearInterval(id);
  }, [systolic, diastolic]);

  if (systolic == null || diastolic == null) return [];
  return buildBpPulseSeries(systolic, diastolic, offset);
}

// ─── Real-time Heart Rate generator ──────────────────────────────────────────
function useRealtimeHR(windowSize = 30) {
  const [data, setData] = useState(() =>
    Array.from({ length: windowSize }, (_, i) => ({
      t: i,
      bpm: 68 + Math.round(Math.random() * 10),
    }))
  );
  const [latest, setLatest] = useState(71);

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        const bpm = Math.min(90, Math.max(58, last.bpm + (Math.random() * 6 - 3)));
        const next = { t: last.t + 1, bpm: Math.round(bpm) };
        setLatest(next.bpm);
        return [...prev.slice(1), next];
      });
    }, 850);
    return () => clearInterval(id);
  }, []);

  return { data, latest };
}

// ─── Live BP Card ─────────────────────────────────────────────────────────────
function LiveBPCard() {
  interface HealthReading {
    id: string;
    userId: string;
    weight_kg: number | null;
    bp_systolic: number | null;
    bp_diastolic: number | null;
    blood_sugar_mgdl: number | null;
    sugar_context: string | null;
    oxygen_spo2: number | null;
    heart_rate_bpm: number | null;
    notes: string | null;
    logged_at: string;
    created_at: string | null;
  }

  const user = getUser();
  const [reading, setReading] = useState<HealthReading | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    api
      .get(`/health-readings/user/${user.id}`)
      .then((res) => {
        const payload = res.data;
        const latest: HealthReading | null = Array.isArray(payload)
          ? (payload[payload.length - 1] ?? null)
          : (payload?.id || payload?.bp_systolic != null ? payload : payload?.data ?? null);
        setReading(latest);
      })
      .catch((err) => console.error("Failed to fetch health reading:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const systolic = toReadingNumber(reading?.bp_systolic);
  const diastolic = toReadingNumber(reading?.bp_diastolic);
  const data = useRealtimeBP(systolic, diastolic);
  const status = getBpStatus(systolic, diastolic);
  const [yMin, yMax] = bpChartDomain(systolic, diastolic);
  const lastUpdated = reading?.logged_at
    ? new Date(reading.logged_at).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 relative">
            <Activity className="size-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Blood Pressure</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                {systolic ?? "—"}/{diastolic ?? "—"}
              </span>
              <span className="text-xs font-medium text-slate-400">mmHg</span>
            </div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>{status.label}</span>
      </div>

      <div className="h-[130px] w-full min-h-[130px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-rose-50/50 text-xs font-medium text-slate-400">
            No blood pressure reading yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={130}>
            <ComposedChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="liveBpSys" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="t" hide />
              <YAxis domain={[yMin, yMax]} hide allowDataOverflow />
              <Area
                isAnimationActive={false}
                type="linear"
                dataKey="systolic"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#liveBpSys)"
                fillOpacity={1}
                baseValue={yMin}
                dot={false}
              />
              <Line
                isAnimationActive={false}
                type="linear"
                dataKey="diastolic"
                stroke="#fb923c"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center gap-1.5 -mt-2">
        <Clock className="size-3 shrink-0 text-slate-400" />
        <p className="text-[11px] text-slate-400 font-medium">Last updated: {lastUpdated}</p>
      </div>
    </div>
  );
}

// ─── Live Heart Rate Card ─────────────────────────────────────────────────────
function LiveHRCard() {
  const { data, latest } = useRealtimeHR();
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 relative">
            <HeartPulse className="size-5 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Heart Rate</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">{latest}</span>
              <span className="text-xs font-medium text-slate-400">bpm</span>
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Healthy</span>
      </div>

      <div className="h-[130px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="liveHrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#008B8B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#008B8B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="t" hide />
            <YAxis domain={[50, 100]} hide />
            <Area isAnimationActive={false} type="monotoneX" dataKey="bpm" stroke="#008B8B" strokeWidth={2.5} fill="url(#liveHrGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-1.5 -mt-2">
        <Clock className="size-3 shrink-0 text-slate-400" />
        <p className="text-[11px] text-slate-400 font-medium">Last updated: {now}</p>
      </div>
    </div>
  );
}

// --- Area Chart Card (BP, Sugar, HR) ---
function AreaMetricCard({
  icon, iconBg, iconColor, title, value, unit, status, statusColor, lastUpdated, chart,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string; title: string;
  value: string; unit: string; status: string; statusColor: string;
  lastUpdated: string; chart: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</span>
              <span className="text-xs font-medium text-slate-400">{unit}</span>
            </div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>{status}</span>
      </div>
      <div className="h-[130px] w-full">{chart}</div>
      <div className="flex items-center gap-1.5 -mt-2">
        <Clock className="size-3 shrink-0 text-slate-400" />
        <p className="text-[11px] text-slate-400 font-medium">Last updated: {lastUpdated}</p>
      </div>
    </div>
  );
}

// --- Line Chart Card (SpO₂, Weight, Temp) ---
function LineMetricCard({
  icon, iconBg, iconColor, title, value, unit, status, statusColor, lastUpdated, chart,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string; title: string;
  value: string; unit: string; status: string; statusColor: string;
  lastUpdated: string; chart: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-xl ${iconBg}`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">{title}</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</span>
              <span className="text-xs font-medium text-slate-400">{unit}</span>
            </div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>{status}</span>
      </div>
      <div className="h-[130px] w-full">{chart}</div>
      <div className="flex items-center gap-1.5 -mt-2">
        <Clock className="size-3 shrink-0 text-slate-400" />
        <p className="text-[11px] text-slate-400 font-medium">Last updated: {lastUpdated}</p>
      </div>
    </div>
  );
}

export default function DailyHealth() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getUser();

  const metrics = [
    { id: "blood_pressure",  label: "Blood Pressure",        icon: <Activity className="size-4" />,    color: "bg-rose-50 border-rose-200 text-rose-600" },
    { id: "blood_sugar",     label: "Blood Sugar",           icon: <Droplets className="size-4" />,    color: "bg-amber-50 border-amber-200 text-amber-600" },
    { id: "heart_rate",      label: "Heart Rate",            icon: <HeartPulse className="size-4" />,  color: "bg-teal-50 border-teal-200 text-teal-600" },
    { id: "spo2",            label: "SpO₂",                  icon: <Wind className="size-4" />,        color: "bg-sky-50 border-sky-200 text-sky-600" },
    { id: "weight",          label: "Weight",                icon: <Scale className="size-4" />,       color: "bg-violet-50 border-violet-200 text-violet-600" },
    { id: "temperature",     label: "Body Temperature",      icon: <Thermometer className="size-4" />, color: "bg-orange-50 border-orange-200 text-orange-600" },
    { id: "water_intake",    label: "Water Intake",          icon: <FlaskConical className="size-4" />,color: "bg-cyan-50 border-cyan-200 text-cyan-600" },
    { id: "calories",        label: "Calories",              icon: <Flame className="size-4" />,       color: "bg-rose-50 border-rose-200 text-rose-500" },
    { id: "bmi",             label: "BMI",                   icon: <Scale className="size-4" />,       color: "bg-indigo-50 border-indigo-200 text-indigo-600" },
  ];

  const fieldMap: Record<string, { name: string; placeholder: string; unit: string; type?: string }[]> = {
    blood_pressure: [
      { name: "systolic",  placeholder: "e.g. 120", unit: "mmHg (Systolic)" },
      { name: "diastolic", placeholder: "e.g. 80",  unit: "mmHg (Diastolic)" },
    ],
    blood_sugar: [
      { name: "level",     placeholder: "e.g. 97",  unit: "mg/dL" },
      { name: "reading_type", placeholder: "Fasting / Post-meal / Random", unit: "Reading Type" },
    ],
    heart_rate: [
      { name: "bpm",       placeholder: "e.g. 72",  unit: "bpm" },
    ],
    spo2: [
      { name: "spo2",      placeholder: "e.g. 98",  unit: "%" },
    ],
    weight: [
      { name: "kg",        placeholder: "e.g. 74.2", unit: "kg" },
    ],
    temperature: [
      { name: "celsius",   placeholder: "e.g. 36.7", unit: "°C" },
    ],
    water_intake: [
      { name: "glasses",   placeholder: "e.g. 6",    unit: "glasses" },
    ],
    calories: [
      { name: "kcal",      placeholder: "e.g. 650",  unit: "kcal" },
      { name: "meal",      placeholder: "Breakfast / Lunch / Dinner / Snack", unit: "Meal" },
    ],
    bmi: [
      { name: "weight_kg", placeholder: "e.g. 74.2", unit: "kg (Weight)" },
      { name: "height_m",  placeholder: "e.g. 1.74", unit: "m (Height)" },
    ],
  };

  const handleMetricSelect = (id: string) => {
    setSelectedMetric(id);
    setFormValues({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMetric || !user) return;

    // Map form fields to the backend HealthReadingCreate model
    const payload: Record<string, unknown> = {
      userId: user.id,
      logged_at: new Date().toISOString(),
    };

    if (selectedMetric === "blood_pressure") {
      payload.bp_systolic  = Number(formValues.systolic);
      payload.bp_diastolic = Number(formValues.diastolic);
    } else if (selectedMetric === "blood_sugar") {
      payload.blood_sugar_mgdl = Number(formValues.level);
      const ctx = formValues.reading_type?.toLowerCase();
      if (ctx === "fasting")       payload.sugar_context = "fasting";
      else if (ctx === "post-meal" || ctx === "post_meal") payload.sugar_context = "after_meal";
      else                         payload.sugar_context = "before_meal";
    } else if (selectedMetric === "heart_rate") {
      payload.heart_rate_bpm = Number(formValues.bpm);
    } else if (selectedMetric === "spo2") {
      payload.oxygen_spo2 = Number(formValues.spo2);
    } else if (selectedMetric === "weight") {
      payload.weight_kg = Number(formValues.kg);
    }

    try {
      setIsSubmitting(true);
      const res = await api.post(
        "/health-readings/",
        payload
      );
      console.log("Health reading saved:", res.data);
    } catch (err) {
      console.error("Failed to save health reading:", err);
    } finally {
      setIsSubmitting(false);
      setModalOpen(false);
      setSelectedMetric(null);
      setFormValues({});
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedMetric(null);
    setFormValues({});
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur-md sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-semibold">Daily Health Insights</h1>
          <div className="ml-auto">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 transition-all"
            >
              <Plus className="size-3.5" />
              Log Health Reading
            </button>
          </div>
        </header>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
            />
            {/* Modal box */}
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 mx-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Log Health Reading</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Select a metric then fill in your values</p>
                </div>
                <button
                  onClick={handleClose}
                  className="flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Metric selector grid */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {metrics.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleMetricSelect(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      selectedMetric === m.id
                        ? m.color + " shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <span className={selectedMetric === m.id ? "" : "text-slate-400"}>
                      {m.icon}
                    </span>
                    <span className="text-center leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic fields */}
              {selectedMetric && (
                <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-100 pt-4">
                  {fieldMap[selectedMetric].map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {field.unit}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={field.placeholder}
                        value={formValues[field.name] ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  ))}

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm active:scale-95 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save Reading"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50 dark:bg-neutral-950">

          {/* Row 1 — Area charts: BP, Sugar, Heart Rate */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            <LiveBPCard />

            <AreaMetricCard
              icon={<Droplets className="size-5" />}
              iconBg="bg-amber-50" iconColor="text-amber-500"
              title="Blood Sugar" value="97" unit="mg/dL"
              status="Optimal" statusColor="bg-emerald-50 text-emerald-600"
              lastUpdated="Sep 8, 2026 · 07:15 AM"
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sugarData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sugarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="t" hide />
                    <YAxis domain={[80, 125]} hide />
<Tooltip
  contentStyle={tooltipStyle}
  formatter={(v) => [`${v ?? 0} mg/dL`, "Blood Sugar"]}
/>                    <Area type="monotone" dataKey="level" stroke="#f59e0b" strokeWidth={2.5} fill="url(#sugarGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              }
            />

            <LiveHRCard />

          </div>

          {/* Row 2 — Line charts: SpO₂, Weight, Temperature */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {/* SpO₂ */}
            <LineMetricCard
              icon={<Wind className="size-5" />}
              iconBg="bg-sky-50" iconColor="text-sky-500"
              title="SpO₂ Oxygen Saturation" value="98" unit="%"
              status="Normal" statusColor="bg-emerald-50 text-emerald-600"
              lastUpdated="Sep 8, 2026 · 09:05 AM"
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spo2Data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="t" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <YAxis domain={[94, 100]} hide />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v ?? 0}%`, "SpO₂"]} />
                    <Line
                      type="monotone" dataKey="spo2" stroke="#0ea5e9" strokeWidth={2.5}
                      dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#0ea5e9" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              }
            />

            {/* Weight */}
            <LineMetricCard
              icon={<Scale className="size-5" />}
              iconBg="bg-violet-50" iconColor="text-violet-500"
              title="Weight" value="74.2" unit="kg"
              status="Stable" statusColor="bg-slate-100 text-slate-600"
              lastUpdated="Sep 8, 2026 · 06:30 AM"
              chart={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} stroke="#94a3b8" interval={4} />
                    <YAxis domain={[73.5, 75.5]} hide />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v ?? 0} kg`, "Weight"]} />
                    <Line
                      type="monotone" dataKey="kg" stroke="#8b5cf6" strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              }
            />

            {/* Temperature — single current reading */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50">
                    <Thermometer className="size-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Body Temperature</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-extrabold tracking-tight text-slate-900">{tempReading}</span>
                      <span className="text-xs font-medium text-slate-400">°C</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Normal</span>
              </div>

              {/* Single reading visual */}
              <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-orange-50/60 py-6">
                <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm border border-orange-100">
                  <Thermometer className="size-8 text-orange-400" />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-orange-500 tracking-tight">{tempReading}°C</p>
                  <p className="text-xs text-slate-400 mt-1">Single point reading</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Within normal range (36.1°C – 37.2°C)
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="size-3 shrink-0 text-slate-400" />
                <p className="text-[11px] text-slate-400 font-medium">Last updated: Sep 8, 2026 · 09:10 AM</p>
              </div>
            </div>

          </div>

          {/* Row 3 — Water Intake, Calories, BMI */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {/* Water Intake */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-50">
                    <FlaskConical className="size-5 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Water Intake</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-extrabold tracking-tight text-slate-900">{waterConsumed}</span>
                      <span className="text-xs font-medium text-slate-400">/ {waterTarget} glasses</span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${waterConsumed >= waterTarget ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  {waterConsumed >= waterTarget ? "Goal Met" : "In Progress"}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>{waterConsumed} glasses consumed</span>
                  <span>{waterTarget - waterConsumed} remaining</span>
                </div>
                <div className="h-3 w-full rounded-full bg-cyan-50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all"
                    style={{ width: `${(waterConsumed / waterTarget) * 100}%` }}
                  />
                </div>
              </div>

              {/* Hourly bar chart */}
              <div className="h-[100px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barSize={14}>
                    <XAxis dataKey="t" fontSize={9} tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <YAxis hide domain={[0, 1]} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v ?? 0} glass`, "Intake"]} />
                    <Bar dataKey="glasses" radius={[4, 4, 0, 0]}>
                      {waterData.map((entry, i) => (
                        <Cell key={i} fill={entry.glasses > 0 ? "#22d3ee" : "#e2e8f0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center gap-1.5 -mt-2">
                <Clock className="size-3 shrink-0 text-slate-400" />
                <p className="text-[11px] text-slate-400 font-medium">Last updated: Sep 8, 2026 · 01:00 PM</p>
              </div>
            </div>

            {/* Calories / Nutrition */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50">
                    <Flame className="size-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Calories / Nutrition</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-extrabold tracking-tight text-slate-900">{totalKcal.toLocaleString()}</span>
                      <span className="text-xs font-medium text-slate-400">/ {kcalTarget.toLocaleString()} kcal</span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${totalKcal >= kcalTarget ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {totalKcal >= kcalTarget ? "At Limit" : "On Track"}
                </span>
              </div>

              {/* Calorie bar chart by meal */}
              <div className="h-[130px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={caloriesData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="meal" fontSize={10} tickLine={false} axisLine={false} stroke="#94a3b8" />
                    <YAxis hide domain={[0, 800]} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v ?? 0} kcal`, "Calories"]} />
                    <Bar dataKey="kcal" radius={[5, 5, 0, 0]}>
                      {caloriesData.map((entry, i) => (
                        <Cell key={i} fill={entry.kcal === 0 ? "#e2e8f0" : i === 2 ? "#f43f5e" : "#fb923c"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center gap-1.5 -mt-2">
                <Clock className="size-3 shrink-0 text-slate-400" />
                <p className="text-[11px] text-slate-400 font-medium">Last updated: Sep 8, 2026 · 01:00 PM</p>
              </div>
            </div>

            {/* BMI */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50">
                    <Scale className="size-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">BMI</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-extrabold tracking-tight text-slate-900">{bmiValue}</span>
                      <span className="text-xs font-medium text-slate-400">kg/m²</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">{bmiCategory}</span>
              </div>

              {/* BMI scale visual */}
              <div className="flex flex-1 flex-col justify-center gap-4 rounded-xl bg-indigo-50/40 px-5 py-5">
                {/* Colour bar */}
                <div className="relative h-4 w-full rounded-full overflow-hidden flex">
                  <div className="flex-1 bg-sky-300" title="Underweight" />
                  <div className="flex-1 bg-emerald-400" title="Normal" />
                  <div className="flex-1 bg-amber-400" title="Overweight" />
                  <div className="flex-1 bg-rose-500" title="Obese" />
                  {/* Needle */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-slate-800 rounded-full shadow"
                    style={{ left: `${Math.min(Math.max(((bmiValue - 15) / (40 - 15)) * 100, 2), 98)}%` }}
                  />
                </div>
                {/* Labels */}
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>Underweight<br/>&lt;18.5</span>
                  <span className="text-center">Normal<br/>18.5–24.9</span>
                  <span className="text-center">Overweight<br/>25–29.9</span>
                  <span className="text-right">Obese<br/>≥30</span>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-indigo-600">{bmiValue}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Based on 74.2 kg · 1.74 m</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="size-3 shrink-0 text-slate-400" />
                <p className="text-[11px] text-slate-400 font-medium">Last updated: Sep 8, 2026 · 06:30 AM</p>
              </div>
            </div>

          </div>

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
