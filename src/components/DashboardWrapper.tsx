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
    <div className="min-h-screen bg-bg">
      <aside className="fixed top-0 left-0 bottom-0 w-[220px] bg-sidebar text-white p-6 flex flex-col">
        <div className="flex items-center gap-2 text-lg font-black tracking-tighter mb-10">
          <div className="w-3 h-3 bg-red-500 rounded-sm" />
          FRSC DLC
        </div>
        
        <nav className="flex-grow space-y-6">
          <div>
            <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-3">Management</h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-[13px] rounded-md transition-all cursor-pointer ${
                    activeTab === item.id 
                      ? 'bg-accent text-white font-semibold' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-3">System</h3>
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] rounded-md text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </nav>

        <div className="text-[11px] opacity-30 mt-auto">
          {session.centreId} | v1.1.0
        </div>
      </aside>

      <header className="fixed top-0 left-[220px] right-0 h-16 bg-white border-b border-border flex items-center justify-between px-8 z-40">
        <div className="text-[13px]">
          <span className="text-text-muted">Portal / </span>
          <strong className="text-sidebar font-bold">{tabLabels[activeTab]}</strong>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-sidebar">{session.name}</div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">
              {session.role === 'admin' ? 'Chief Officer' : 'Reporting Officer'}
            </div>
          </div>
          <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center text-[10px] font-bold text-text-muted">
            {session.name.charAt(0)}
          </div>
        </div>
      </header>

      <main className="ml-[220px] pt-16 p-8 min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <Dashboard session={session} />
            </motion.div>
          )}
          {activeTab === 'entry' && (
            <motion.div key="entry" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <DailyEntryForm session={session} />
            </motion.div>
          )}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <ReportGenerator session={session} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
