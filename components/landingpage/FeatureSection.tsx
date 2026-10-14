'use client';

import { useState } from 'react';
import { 
  Activity, 
  UploadCloud, 
  Bot, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare, 
  Plus, 
  ArrowUpRight,
  Heart,
  Droplet,
  Zap,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type FeatureId = 'vitals' | 'vault' | 'chatbot';

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>('vitals');

  const featuresList = [
    {
      id: 'vitals' as FeatureId,
      icon: Activity,
      badge: 'Vitals Logging',
      title: 'Daily Biometric Tracking',
      description: 'Easily log and monitor vital indices including Blood Pressure, Glucose levels, Pulse Rate, and Oxygen Saturation (SpO2). Visualize historical trends with interactive status alerts.',
      iconColor: 'text-emerald-500 bg-emerald-500/10',
      activeColor: 'border-emerald-500/30 bg-emerald-500/5',
    },
    {
      id: 'vault' as FeatureId,
      icon: UploadCloud,
      badge: 'Medical Memory',
      title: 'Smart Health Records Vault',
      description: 'Securely upload diagnostic files, prescriptions, and lab reports. Keep your entire clinical history safely indexed in local storage for instant dashboard tracking.',
      iconColor: 'text-blue-500 bg-blue-500/10',
      activeColor: 'border-blue-500/30 bg-blue-500/5',
    },
    {
      id: 'chatbot' as FeatureId,
      icon: Bot,
      badge: 'AI Diagnostic Support',
      title: 'AI-Powered Health Companion',
      description: 'Interact with an intelligent clinical chatbot trained to understand your medical vault. Extract complex report summaries, translate jargon, and request wellness suggestions.',
      iconColor: 'text-purple-500 bg-purple-500/10',
      activeColor: 'border-purple-500/30 bg-purple-500/5',
    }
  ];

  return (
    <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-200 to-white dark:from-slate-950 dark:to-slate-900 border-t border-slate-100 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-20">
         <span className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary text-primary text-xs font-semibold tracking-wider uppercase mb-4">
  <Sparkles className="h-3.5 w-3.5 mr-1 text-primary animate-pulse" />
  <span>Clinical Workspace</span>
</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary dark:text-white mb-4">
            Take Control of Your Health Data
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-600 max-w-3xl mx-auto font-semibold">
            A unified, secure clinical companion designed to track daily bio-metrics, catalog diagnostic records, and translate medical jargon into simple clinical insights.
          </p>
        </div>

        {/* Interactive Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch mb-24">
          
          {/* Left Column: Triggers List */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
              Select core feature to preview
            </div>
            {featuresList.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeFeature === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveFeature(item.id)}
                  className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 group cursor-pointer focus:outline-none ${
                    isActive 
                      ? `${item.activeColor} border-primary/50 shadow-md shadow-primary/5` 
                      : 'border-slate-200/60 dark:border-slate-800/60 bg-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white' : item.iconColor}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-primary/20 text-primary dark:text-blue-300' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                        {isActive && <ArrowUpRight className="h-4 w-4 text-primary animate-bounce" />}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: High-Fidelity Interactive Preview Panel */}
          <div className="lg:col-span-7 flex items-center justify-center">
            <div className="w-full h-full min-h-[460px] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-900/50 backdrop-blur-md p-6 sm:p-8 flex flex-col shadow-xl shadow-slate-100/50 dark:shadow-none relative overflow-hidden">
              
              {/* Top ambient glow matching active category */}
              <div className={`absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${
                activeFeature === 'vitals' ? 'bg-emerald-500' : activeFeature === 'vault' ? 'bg-blue-500' : 'bg-purple-500'
              }`} />

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  {activeFeature === 'vitals' && 'vitals_dashboard_mockup.tsx'}
                  {activeFeature === 'vault' && 'smart_vault_explorer.exe'}
                  {activeFeature === 'chatbot' && 'clinical_ai_chatbot.md'}
                </div>
              </div>

              {/* DYNAMIC COMPONENT PREVIEWS */}
              
              {/* Preview 1: Vitals Tracking Dashboard */}
              {activeFeature === 'vitals' && (
                <div className="flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h4 className="text-md font-bold text-slate-900 dark:text-white mb-1">Weekly Health Diagnostics</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Updates hourly based on patient vitals log</p>
                  </div>
                  
                  {/* Grid of Biometrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Blood Pressure</span>
                        <Heart className="h-4 w-4 text-rose-500" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">120/80</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">mmHg • Optimal</div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[80%]" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Blood Sugar</span>
                        <Droplet className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">98 <span className="text-xs font-normal text-slate-400 dark:text-slate-500">mg/dL</span></div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Fasting • Normal</div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[60%]" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Oxygen Saturation</span>
                        <Zap className="h-4 w-4 text-emerald-500 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">99%</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">SpO2 • Excellent</div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[99%]" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pulse Rate</span>
                        <Activity className="h-4 w-4 text-emerald-500 animate-bounce" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">72 <span className="text-xs font-normal text-slate-400 dark:text-slate-500">bpm</span></div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Resting • Stable</div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[72%]" />
                      </div>
                    </div>
                  </div>

                  {/* Vitals Log Action */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Quick-log today's measurements:</span>
                    <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Log Vitals</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Preview 2: Medical Memory Vault Documents */}
              {activeFeature === 'vault' && (
                <div className="flex-1 flex flex-col justify-between space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-md font-bold text-slate-900 dark:text-white mb-1">Clinical Vault Folder</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">HIPAA Encrypted Patient Storage</p>
                    </div>
                    <span className="inline-flex items-center space-x-1 text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/50">
                      <Lock className="h-2.5 w-2.5" />
                      <span>SECURED</span>
                    </span>
                  </div>

                  {/* Vault File List Mockup */}
                  <div className="space-y-3">
                    {[
                      { name: 'Blood_Panel_Report.pdf', size: '2.4 MB', type: 'PDF Report', date: 'Yesterday' },
                      { name: 'Cardiology_Rx_Aug2026.png', size: '1.8 MB', type: 'Prescription Scan', date: '3 days ago' },
                      { name: 'MRI_Lumbar_Spine.pdf', size: '14.2 MB', type: 'Radiology Scan', date: '2 weeks ago' }
                    ].map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 shadow-sm hover:border-blue-500/20 transition-all duration-300">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-500">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-950 dark:text-slate-200 max-w-[180px] sm:max-w-xs truncate">{file.name}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">{file.type} • {file.size}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          <span>{file.date}</span>
                          <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload Action Panel */}
                  <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition duration-300 cursor-pointer group">
                    <div className="flex flex-col items-center space-y-2 text-center">
                      <UploadCloud className="h-8 w-8 text-blue-500 group-hover:scale-110 transition duration-300" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Drag & drop new health reports</span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Supports PDF, JPG, PNG up to 25MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview 3: AI Clinical Chatbot Dialogues */}
              {activeFeature === 'chatbot' && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Clinical AI Assistant</h4>
                      <span className="inline-block text-[9px] text-emerald-500 font-semibold uppercase animate-pulse">● Online & Reading Vault</span>
                    </div>
                  </div>

                  {/* Chat Bubbles */}
                  <div className="space-y-3.5 overflow-y-auto max-h-[220px] pr-1.5 flex-grow py-2">
                    <div className="flex items-start space-x-2 max-w-[90%]">
                      <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                        What does a high bilirubin level mean in my lab report?
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 max-w-[90%] ml-auto justify-end">
                      <div className="p-3 rounded-2xl bg-purple-600 text-white text-xs leading-relaxed shadow-sm">
                        High bilirubin levels can suggest your liver or gallbladder is processing red blood cells differently. I see your alkaline phosphatase values in <span className="underline font-mono cursor-pointer">Blood_Panel.pdf</span> are normal, which is a good sign. You should ask your physician about checking your biliary tract next.
                      </div>
                    </div>
                  </div>

                  {/* Message Input Mockup */}
                  <div className="relative">
                    <div className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 dark:text-slate-500 pl-2">Ask details about your reports...</span>
                      <button className="flex items-center justify-center p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition cursor-pointer">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* Suggested Questions */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Summarize my MRI scan', 'Explain prescription dosage'].map((q, i) => (
                        <span key={i} className="text-[9px] font-medium text-purple-600 dark:text-purple-300 bg-purple-100/50 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-900/30 px-2 py-0.5 rounded-full cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-950/60 transition">
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Benefit Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-100 dark:border-slate-800/60">
          
          <div className="flex space-x-4">
            <div className="p-3 h-fit rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">HIPAA-Compliant Security</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Your medical charts and reports are encrypted at rest and in transit. We prioritize clinical grade privacy so you own and control your patient records.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="p-3 h-fit rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Continuous Trend Analysis</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect the dots between your metrics. Watch how blood pressure and glucose stabilize over time alongside medication adjustments logged in memory.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="p-3 h-fit rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Immediate Medical Summaries</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Transform a lengthy multi-page laboratory pdf report into a neat, high-level summary that captures main points, so you can review key findings in seconds.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}