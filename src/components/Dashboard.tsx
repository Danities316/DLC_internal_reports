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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Production', value: stats.totalProduction, icon: TrendingUp },
          { label: 'Fresh Apps', value: stats.fresh, icon: FileText },
          { label: 'Renewals', value: stats.renewal, icon: CheckCircle2 },
          { label: 'Integrity', value: '100% OK', icon: Users, isBadge: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-border">
            <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-4 flex items-center justify-between">
              {stat.label}
              <stat.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-baseline justify-between">
              {typeof stat.value === 'string' && stat.isBadge ? (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">{stat.value}</span>
              ) : (
                <p className="text-2xl font-bold font-mono tracking-tighter text-sidebar">{stat.value.toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-border">
          <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-6">Production Volume (Window Data)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'none', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-border">
          <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-6">Aggregate Breakdown</h3>
          <div className="space-y-4">
             {[
               { label: 'Fresh Applications', value: stats.fresh },
               { label: 'Renewals Issued', value: stats.renewal },
               { label: 'Re-issues / Lost', value: stats.reissue },
               { label: 'Male/Female Ratio', value: stats.male ? (stats.male / (stats.female || 1)).toFixed(1) + ':1' : 'N/A' },
             ].map((item, i) => (
               <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                 <span className="text-xs text-text-main">{item.label}</span>
                 <span className="text-[13px] font-bold font-mono text-sidebar">{item.value}</span>
               </div>
             ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-border">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
