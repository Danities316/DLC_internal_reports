"use client";

import { useState } from "react";
import { AuthSession } from "@/types";
import { LayoutDashboard, PlusCircle, BarChart3, LogOut, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { logout } from "@/app/actions/auth";
import { Dashboard } from "./Dashboard";
import { DailyEntryForm } from "./DailyEntryForm";
import { ReportGenerator } from "./ReportGenerator";

interface Props {
  session: AuthSession;
}

export default function DashboardWrapper({ session }: Props) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'entry', label: 'Daily Entry', icon: PlusCircle },
    { id: 'reports', label: 'Generate Reports', icon: BarChart3 },
  ];

  const tabLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    entry: 'Daily Entry',
    reports: 'AI Reports'
  };

  return (
    <div className="min-h-screen bg-bg selection:bg-accent selection:text-white">
      <aside className="fixed top-0 left-0 bottom-0 w-[240px] bg-sidebar text-white p-8 flex flex-col z-50">
        <div className="flex items-center gap-3 text-sm font-black tracking-[0.2em] mb-16 uppercase">
          <div className="w-2 h-2 bg-accent shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
          DLC System
        </div>
        
        <nav className="flex-grow space-y-10">
          <div>
            <h3 className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em] mb-4">Operations</h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-3 text-[12px] font-bold tracking-tight rounded-md transition-all cursor-pointer ${
                    activeTab === item.id 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-4 h-4 transition-colors ${activeTab === item.id ? 'text-accent' : 'text-inherit'}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em] mb-4">Terminal</h3>
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-3 py-3 text-[12px] font-bold tracking-tight rounded-md text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </nav>

        <div className="text-[9px] font-black tracking-[0.1em] text-white/20 mt-auto border-t border-white/5 pt-6">
          <p>STATION: {session.centreId}</p>
          <p className="mt-1">ENCRYPTED SESSION</p>
        </div>
      </aside>

      <header className="fixed top-0 left-[240px] right-0 h-20 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-10 z-40">
        <div className="flex items-center gap-4">
          <div className="h-6 w-[1px] bg-border mr-2" />
          <div className="text-[12px] font-bold tracking-tight">
            <span className="text-text-muted opacity-50 uppercase text-[10px] tracking-widest leading-none block mb-0.5">Location</span>
            <span className="text-sidebar uppercase">{tabLabels[activeTab]}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="h-10 w-[1px] bg-border" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[12px] font-black text-sidebar uppercase tracking-tight">{session.name}</div>
              <div className="text-[9px] text-accent font-black uppercase tracking-widest">
                {session.role === 'admin' ? 'Chief Superintendent' : 'Reporting Officer'}
              </div>
            </div>
            <div className="w-10 h-10 bg-sidebar text-white rounded-md flex items-center justify-center text-[12px] font-black shadow-lg shadow-sidebar/20 rotate-[3deg]">
              {session.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="ml-[240px] pt-20 p-10 min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.2 }}>
              <Dashboard session={session} />
            </motion.div>
          )}
          {activeTab === 'entry' && (
            <motion.div key="entry" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.2 }}>
              <DailyEntryForm session={session} />
            </motion.div>
          )}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.2 }}>
              <ReportGenerator session={session} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
