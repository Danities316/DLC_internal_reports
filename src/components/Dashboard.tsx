import React, { useEffect, useState } from 'react';
import { getSimplifiedStats } from "@/app/actions/reports";
import { AuthSession } from "@/types";
import { 
  Calendar, 
  FileText, 
  PlusCircle, 
  BarChart, 
  ChevronRight,
  ClipboardCheck,
  TrendingUp
} from 'lucide-react';

interface Props {
  session: AuthSession;
  onNavigate: (tab: string) => void;
}

export function Dashboard({ session, onNavigate }: Props) {
  const [stats, setStats] = useState<{today: number, week: number, month: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSimplifiedStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-[2px] border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Message */}
      <div className="bg-white p-8 lg:p-10 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-black text-primary tracking-tight mb-2">
            Welcome, {session.name}
          </h1>
          <p className="text-text-muted text-sm lg:text-base max-w-md">
            Ready to record today's production? Select an action below to get started.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-bg px-4 py-2 rounded-lg border border-border self-start md:self-auto relative z-10">
          <Calendar className="w-4 h-4 text-accent" />
          <span className="text-[12px] font-bold uppercase tracking-widest text-primary">
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Today's Total", value: stats.today, icon: ClipboardCheck, color: 'text-primary' },
          { label: "This Week Total", value: stats.week, icon: TrendingUp, color: 'text-accent' },
          { label: "This Month Total", value: stats.month, icon: BarChart, color: 'text-primary' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-border shadow-sm hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-2 rounded-lg bg-bg ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-text-muted">
                {item.label}
              </span>
            </div>
            <div className="text-4xl font-black text-primary tracking-tighter">
              {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate('entry')}
          className="group relative bg-primary text-white p-8 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-24 h-24" />
          </div>
          <PlusCircle className="w-8 h-8 mb-4 text-white" />
          <h3 className="text-xl font-bold mb-2">Enter Daily Report</h3>
          <p className="text-white/70 text-sm mb-6">Log today's production numbers and demographics.</p>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded">
            Start Entry <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        <button 
          onClick={() => onNavigate('reports')}
          className="group relative bg-white text-primary p-8 rounded-xl border-2 border-primary/10 shadow-sm hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform text-accent">
            <FileText className="w-24 h-24" />
          </div>
          <FileText className="w-8 h-8 mb-4 text-accent" />
          <h3 className="text-xl font-bold mb-2 text-primary">Weekly Report</h3>
          <p className="text-text-muted text-sm mb-6">Compile and download the summary for this week.</p>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-accent">
            Generate Now <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        <button 
          onClick={() => onNavigate('reports')}
          className="group relative bg-white text-primary p-8 rounded-xl border-2 border-primary/10 shadow-sm hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform text-primary">
            <BarChart className="w-24 h-24" />
          </div>
          <BarChart className="w-8 h-8 mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2 text-primary">Monthly Report</h3>
          <p className="text-text-muted text-sm mb-6">Review performance across the entire month.</p>
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary">
            View Analytics <ChevronRight className="w-3 h-3" />
          </div>
        </button>
      </div>

      {/* Simple Footer/Info */}
      <div className="text-center pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 rounded-full border border-accent/10">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
            Official DLC Reporting Mainframe Active
          </span>
        </div>
      </div>
    </div>
  );
}
