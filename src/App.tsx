import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DailyEntryForm } from './components/DailyEntryForm';
import { ReportGenerator } from './components/ReportGenerator';
import { Dashboard } from './components/Dashboard';
import { LogIn, LogOut, FileText, BarChart3, PlusCircle, LayoutDashboard, Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function Navigation({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const { profile, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'entry', label: 'Daily Entry', icon: PlusCircle },
    { id: 'reports', label: 'Generate Reports', icon: BarChart3 },
  ];

  return (
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
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] rounded-md text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      <div className="text-[11px] opacity-30 mt-auto">
        {profile?.centreId} | v1.0.2
      </div>
    </aside>
  );
}

function MainContent() {
  const { user, profile, loading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted text-sm font-medium">System initializing...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="w-full max-w-sm">
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-border text-center">
            <div className="w-16 h-16 bg-sidebar rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-sidebar mb-2">DLC Reporting</h1>
            <p className="text-text-muted text-sm mb-8">Please sign in to access the operational portal.</p>
            <button
              onClick={signIn}
              className="w-full flex items-center justify-center gap-3 bg-accent hover:opacity-90 text-white px-6 py-3.25 rounded-md text-sm font-bold shadow-sm transition active:scale-95"
            >
              <LogIn className="w-5 h-5" />
              Sign In with Google
            </button>
          </div>
          <p className="mt-8 text-center text-[10px] uppercase font-bold text-text-muted tracking-widest">
            Federal Road Safety Corps Nigeria
          </p>
        </div>
      </div>
    );
  }

  const tabLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    entry: 'Daily Entry',
    reports: 'AI Reports'
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <header className="fixed top-0 left-[220px] right-0 h-16 bg-white border-b border-border flex items-center justify-between px-8 z-40">
        <div className="text-[13px]">
          <span className="text-text-muted">Portal / </span>
          <strong className="text-sidebar font-bold">{tabLabels[activeTab]}</strong>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-sidebar">{profile?.displayName}</div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">
              {profile?.role === 'admin' ? 'Chief Officer' : 'Reporting Officer'}
            </div>
          </div>
          <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center text-[10px] font-bold text-text-muted">
            {profile?.displayName?.charAt(0)}
          </div>
        </div>
      </header>

      <main className="ml-[220px] pt-16 p-8 min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <Dashboard />
            </motion.div>
          )}
          {activeTab === 'entry' && (
            <motion.div key="entry" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <DailyEntryForm />
            </motion.div>
          )}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <ReportGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
