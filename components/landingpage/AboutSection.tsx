import React from 'react';
import { 
  Activity, 
  Heart, 
  Droplet, 
  Wind,
  ShieldCheck, 
  MessageSquareText, 
  FolderHeart,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Background ambient glows using primary color */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/10 dark:bg-primary/20 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary font-semibold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Next-Generation Health Tracking</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your comprehensive health <br className="hidden md:block" /> ecosystem, unified.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Monitor critical vitals, secure your medical documents, and leverage an intelligent AI assistant to understand your health journey better.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,_auto)]">

          {/* Feature 1: The Vitals Dashboard (Spans 2 columns) */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
            
            <div className="flex flex-col h-full justify-between gap-8">
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Activity className="h-6 w-6 stroke-[2]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Vitals Dashboard</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                  Log and monitor your blood sugar, blood pressure, resting pulse, and SpO2 levels. Catch anomalies early with real-time visual trends.
                </p>
              </div>

              {/* Abstract UI Element: Vitals Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Droplet, label: 'Glucose', val: '98', unit: 'mg/dL' },
                  { icon: Heart, label: 'Blood Press.', val: '120/80', unit: 'mmHg' },
                  { icon: Activity, label: 'Pulse', val: '72', unit: 'bpm' },
                  { icon: Wind, label: 'SpO2', val: '99', unit: '%' },
                ].map((vital, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    <vital.icon className="h-5 w-5 text-primary mb-3" />
                    <p className="text-xs text-slate-500 font-medium mb-1">{vital.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{vital.val}</span>
                      <span className="text-[10px] text-slate-400">{vital.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 2: Health Vault (Spans 1 column) */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col h-full gap-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <FolderHeart className="h-6 w-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Secure Health Vault</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Never lose a prescription again. Upload and organize your lab reports, prescriptions, and medical history in one secure, encrypted memory bank.
                </p>
              </div>
              
              {/* Abstract UI Element: Files */}
              <div className="mt-auto space-y-3">
                {[1, 2].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                    <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mb-1.5" />
                      <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3: Smart Insights (Spans 1 column) */}
          <div className="md:col-span-1 group relative overflow-hidden rounded-3xl bg-primary text-white p-8 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="flex flex-col h-full gap-6 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Proactive Tracking</h3>
                <p className="text-primary-foreground/80 text-sm leading-relaxed">
                  The system analyzes your daily inputs against your historical data, alerting you to sudden spikes or gradual changes before they become emergencies.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4: AI Chatbot (Spans 2 columns) */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl transition-all duration-300">
             <div className="flex flex-col md:flex-row gap-8 h-full items-center">
              
              <div className="flex-1 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <MessageSquareText className="h-6 w-6 stroke-[2]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">AI Medical Assistant</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Have a question about your recent blood test? Chat directly with your medical data. The AI reads your uploaded reports and vitals to give you clear, actionable suggestions and personalized health insights.
                </p>
              </div>

              {/* Abstract UI Element: Chat Interface */}
              <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-3">
                <div className="self-end bg-primary text-white text-sm py-2 px-4 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                  What does my latest lipid profile report indicate?
                </div>
                <div className="self-start bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm py-3 px-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm border border-slate-100 dark:border-slate-700 flex gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <p>Based on the lab report you uploaded yesterday, your HDL cholesterol has improved by 12%. However, I noticed your blood pressure trend was slightly elevated last week. Would you like some dietary suggestions?</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}