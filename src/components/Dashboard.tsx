"use client";

import React, { useEffect, useState } from 'react';
import { getDashboardStats } from "@/app/actions/reports";
import { AuthSession } from "@/types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, FileText, CheckCircle2, Users } from 'lucide-react';

export function Dashboard({ session }: { session: AuthSession }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-[1.5px] border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pieData = [
    { name: 'Fresh', value: stats.fresh },
    { name: 'Renewal', value: stats.renewal },
    { name: 'Reissue', value: stats.reissue },
  ];

  const barData = stats.reports.map((r: any) => ({
    date: r.date.split('-').slice(1).join('/'),
    total: r.totalProduction
  }));

  const chartColors = ['#2563eb', '#64748b', '#0f172a', '#e2e8f0'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Cumulative Output', value: stats.totalProduction, icon: TrendingUp },
          { label: 'Fresh Applications', value: stats.fresh, icon: FileText },
          { label: 'Renewal Volume', value: stats.renewal, icon: CheckCircle2 },
          { label: 'System Integrity', value: 'OPTIMAL', icon: Users, isBadge: true },
        ].map((stat, i) => (
          <div key={i} className="minimal-card">
            <div className="label-upper flex items-center justify-between mb-4">
              {stat.label}
              <stat.icon className="w-3 h-3 opacity-40" />
            </div>
            <div className="flex items-baseline justify-between">
              {typeof stat.value === 'string' && stat.isBadge ? (
                <span className="px-2 py-0.5 rounded-sm bg-accent/5 text-accent text-[9px] font-bold tracking-widest border border-accent/10">{stat.value}</span>
              ) : (
                <p className="text-3xl font-bold font-mono tracking-tighter text-sidebar leading-none">{stat.value.toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 minimal-card">
          <h3 className="label-upper mb-8">Production Periodicity (Active Window)</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} 
                />
                <Tooltip />
                <Bar dataKey="total" fill="#0f172a" radius={[2, 2, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="minimal-card flex flex-col">
          <h3 className="label-upper mb-8">Operational Delta</h3>
          <div className="flex-1 space-y-6">
             {[
               { label: 'Fresh Requests', value: stats.fresh },
               { label: 'Renewal Requests', value: stats.renewal },
               { label: 'Lost / Damaged', value: stats.reissue },
               { label: 'Gender Parity', value: stats.male ? (stats.male / (stats.female || 1)).toFixed(2) : '0.00' },
             ].map((item, i) => (
               <div key={i} className="flex justify-between items-center group">
                 <span className="text-[13px] text-text-muted group-hover:text-sidebar transition-colors">{item.label}</span>
                 <span className="text-[14px] font-bold font-mono text-sidebar tracking-tight">{item.value}</span>
               </div>
             ))}
          </div>
          
          <div className="mt-auto pt-8 border-t border-border">
            <div className="h-[140px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
