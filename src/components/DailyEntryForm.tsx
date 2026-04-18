"use client";

import React, { useState } from 'react';
import { saveDailyReport } from '@/app/actions/reports';
import { AuthSession } from '@/types';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export function DailyEntryForm({ session }: { session: AuthSession }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalProduction: 0,
    fresh: 0,
    renewal: 0,
    reissue: 0,
    male: 0,
    female: 0,
    classes: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, J: 0 },
    ageGroups: { "18-25": 0, "26-60": 0, "60+": 0 },
    remarks: ""
  });

  const validate = () => {
    if (formData.male + formData.female !== formData.totalProduction) {
      return "Gender breakdown (Male + Female) must match Total Production.";
    }
    if (formData.fresh + formData.renewal + formData.reissue !== formData.totalProduction) {
      return "Application type breakdown (Fresh + Renewal + Reissue) must match Total Production.";
    }
    const classTotal = Object.values(formData.classes).reduce((a, b) => a + b, 0);
    if (classTotal !== formData.totalProduction) {
       return "Classes breakdown must match Total Production.";
    }
    const ageTotal = Object.values(formData.ageGroups).reduce((a, b) => a + b, 0);
    if (ageTotal !== formData.totalProduction) {
       return "Age Groups breakdown must match Total Production.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await saveDailyReport(formData);
      if (result.error) throw new Error(result.error);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateClass = (cls: string, val: string) => {
    setFormData({ ...formData, classes: { ...formData.classes, [cls]: parseInt(val) || 0 } });
  };

  const updateAge = (age: string, val: string) => {
    setFormData({ ...formData, ageGroups: { ...formData.ageGroups, [age]: parseInt(val) || 0 } });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="lg:col-span-2 space-y-10">
        <div className="minimal-card">
          <h3 className="label-upper mb-10">Operational Record: {formData.date}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="label-upper !mb-0 font-semibold opacity-60">Reporting Date</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="input-field-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="label-upper !mb-0 font-semibold opacity-60">Total Production</label>
                <input 
                  type="number" 
                  value={formData.totalProduction} 
                  onChange={e => setFormData({...formData, totalProduction: parseInt(e.target.value) || 0})}
                  className="input-field-mono font-bold text-accent bg-accent/[0.02]"
                />
              </div>
              <div className="space-y-2 opacity-60">
                 <label className="label-upper !mb-0 font-semibold opacity-60">Authentication Status</label>
                 <div className="h-10 flex items-center px-3 text-[9px] font-bold uppercase tracking-widest text-green-600 border border-border rounded-md bg-bg/50">Secure / Verified</div>
              </div>
            </div>

            <div className="pt-10 border-t border-border">
              <h4 className="label-upper mb-10">Categorization Vector</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { id: 'fresh', label: 'Fresh Issuance' },
                  { id: 'renewal', label: 'License Renewal' },
                  { id: 'reissue', label: 'Re-Issuance' },
                ].map(item => (
                  <div key={item.id} className="space-y-2">
                    <label className="text-[11px] font-semibold text-text-muted">{item.label}</label>
                    <input 
                      type="number" 
                      value={(formData as any)[item.id]} 
                      onChange={e => setFormData({...formData, [item.id]: parseInt(e.target.value) || 0})}
                      className="input-field-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t border-border">
              <h4 className="label-upper mb-10">Identity Audit (Gender)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['male', 'female'].map(s => (
                  <div key={s} className="space-y-2">
                    <label className="text-[11px] font-semibold text-text-muted capitalize">{s} Applicants</label>
                    <input 
                      type="number" 
                      value={(formData as any)[s]} 
                      onChange={e => setFormData({...formData, [s]: parseInt(e.target.value) || 0})}
                      className="input-field-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="minimal-card">
          <label className="label-upper mb-6">Operational Remarks & Incident Logs</label>
          <textarea 
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
            className="input-field h-36 resize-none py-3"
            placeholder="Document any deviations from standard operational protocol..."
          />
        </div>
      </div>

      <div className="space-y-10">
        <div className="minimal-card">
          <h3 className="label-upper mb-10">Class Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.keys(formData.classes).map(cls => (
              <div key={cls} className="space-y-2">
                <label className="text-[9px] font-black text-text-muted text-center block">CLS {cls}</label>
                <input 
                  type="number" 
                  value={(formData.classes as any)[cls]} 
                  onChange={e => updateClass(cls, e.target.value)}
                  className="input-field-mono text-center h-10 px-0"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="minimal-card">
          <h3 className="label-upper mb-10">Demographic Analysis</h3>
          <div className="space-y-6">
            {Object.keys(formData.ageGroups).map(age => (
              <div key={age} className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-text-main">Years {age}</label>
                <input 
                  type="number" 
                  value={(formData.ageGroups as any)[age]} 
                  onChange={e => updateAge(age, e.target.value)}
                  className="w-24 input-field-mono text-right h-10"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 sticky top-24">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-3 h-14"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            Validate & Push to Mainframe
          </button>
          
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-md text-[11px] font-bold flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-md text-[11px] font-bold flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Data integrity verified. System updated.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
