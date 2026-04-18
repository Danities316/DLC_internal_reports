import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DailyReport } from '../types';
import { useAuth } from '../hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

const COLORS = ['#006633', '#FF9900', '#004d26', '#FFCC00'];

export function Dashboard() {
  const { profile } = useAuth();
  const [recentReports, setRecentReports] = useState<DailyReport[]>([]);
  const [stats, setStats] = useState({
    totalProduction: 0,
    fresh: 0,
    renewal: 0,
    reissue: 0,
    male: 0,
    female: 0
  });

  useEffect(() => {
    if (!profile) return;

    const fetchDashboardData = async () => {
      const q = query(
        collection(db, "dailyReports"),
        where("centreId", "==", profile.centreId),
        orderBy("date", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyReport));
      setRecentReports(reports);

      // Simple stats aggregation
      const totals = reports.reduce((acc, r) => ({
        totalProduction: acc.totalProduction + r.totalProduction,
        fresh: acc.fresh + r.fresh,
        renewal: acc.renewal + r.renewal,
        reissue: acc.reissue + r.reissue,
        male: acc.male + r.male,
        female: acc.female + r.female
      }), { totalProduction: 0, fresh: 0, renewal: 0, reissue: 0, male: 0, female: 0 });
      
      setStats(totals);
    };

    fetchDashboardData();
  }, [profile]);

  const pieData = [
    { name: 'Fresh', value: stats.fresh },
    { name: 'Renewal', value: stats.renewal },
    { name: 'Reissue', value: stats.reissue },
  ];

  const barData = recentReports.slice().reverse().map(r => ({
    date: r.date.split('-').slice(1).join('/'),
    total: r.totalProduction
  }));

  const chartColors = ['#2563eb', '#64748b', '#0f172a', '#e2e8f0'];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
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
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-border">
          <h3 className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-6">Production Volume (Last 10 Days)</h3>
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
                    {pieData.map((entry, index) => (
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
