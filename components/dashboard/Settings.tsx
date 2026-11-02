"use client";

import AppSidebar from "@/components/dashboard/AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getUser } from "@/lib/auth";
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
  const user = getUser();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur-md sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <SettingsIcon className="size-4 text-slate-500" />
            <h1 className="text-sm font-semibold">Settings</h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-slate-50/50">
          <div className="max-w-2xl w-full mx-auto space-y-4">

            {/* Profile */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <User className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-800">Profile</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.fullname ?? ""}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email ?? ""}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Bell className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-800">Notifications</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Health reminders", description: "Daily health logging prompts" },
                  { label: "AI insights", description: "Weekly AI-generated health summaries" },
                  { label: "Report alerts", description: "Notify when a new report is uploaded" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-teal-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:size-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Shield className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-800">Security</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all"
                  />
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer">
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
                  <Palette className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-800">Appearance</h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Theme</p>
                  <p className="text-xs text-slate-400">Choose your preferred color scheme</p>
                </div>
                <div className="flex gap-2">
                  {["Light", "Dark", "System"].map((t) => (
                    <button
                      key={t}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        t === "Light"
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
