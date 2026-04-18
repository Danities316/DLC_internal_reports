import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export function DailyEntryForm() {
  const { profile } = useAuth();
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
      await addDoc(collection(db, "dailyReports"), {
        ...formData,
        centreId: profile?.centreId,
        createdBy: profile?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Reset some fields but keep date or increment?
    } catch (err) {
      setError("Failed to save report. Please try again.");
      console.error(err);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-lg border border-border">
          <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-6">Operational Data Entry: {formData.date}</div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-text-main">Date</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="px-3 py-2 bg-white border border-border rounded-[4px] font-mono text-[13px] outline-none focus:border-accent transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-text-main">Total Production</label>
                <input 
                  type="number" 
                  value={formData.totalProduction} 
                  onChange={e => setFormData({...formData, totalProduction: parseInt(e.target.value) || 0})}
                  className="px-3 py-2 bg-white border border-border rounded-[4px] font-mono text-[13px] outline-none focus:border-accent transition"
                />
              </div>
              <div className="flex flex-col gap-1.5 opacity-40 italic">
                 <label className="text-[11px] font-bold text-text-main">Status</label>
                 <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-green-600">Pending Post</div>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-6">Aggregate Drivers Breakdown</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { id: 'fresh', label: 'Fresh' },
                  { id: 'renewal', label: 'Renewal' },
                  { id: 'reissue', label: 'Re-Issue' },
                ].map(item => (
                  <div key={item.id} className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-main">{item.label}</label>
                    <input 
                      type="number" 
                      value={(formData as any)[item.id]} 
                      onChange={e => setFormData({...formData, [item.id]: parseInt(e.target.value) || 0})}
                      className="px-3 py-2 bg-white border border-border rounded-[4px] font-mono text-[13px] outline-none focus:border-accent transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-6">Identity (Sex) Analysis</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['male', 'female'].map(s => (
                  <div key={s} className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-text-main capitalize">{s}</label>
                    <input 
                      type="number" 
                      value={(formData as any)[s]} 
                      onChange={e => setFormData({...formData, [s]: parseInt(e.target.value) || 0})}
                      className="px-3 py-2 bg-white border border-border rounded-[4px] font-mono text-[13px] outline-none focus:border-accent transition"
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-lg border border-border">
          <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-4">Remarks & Observations</div>
          <textarea 
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
            className="w-full p-3 border border-border rounded-[4px] text-[12px] h-32 resize-none outline-none focus:border-accent transition"
            placeholder="Official log entries..."
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-8 rounded-lg border border-border shadow-sm">
          <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-6">Licence Classes (A-J)</div>
          <div className="grid grid-cols-3 gap-4">
            {Object.keys(formData.classes).map(cls => (
              <div key={cls} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-main">Cls {cls}</label>
                <input 
                  type="number" 
                  value={(formData.classes as any)[cls]} 
                  onChange={e => updateClass(cls, e.target.value)}
                  className="px-2 py-1.5 bg-white border border-border rounded-[4px] font-mono text-[12px] text-center outline-none focus:border-accent transition"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg border border-border shadow-sm">
          <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-6">Age Cohorts</div>
          <div className="space-y-4">
            {Object.keys(formData.ageGroups).map(age => (
              <div key={age} className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-text-main">Years {age}</label>
                <input 
                  type="number" 
                  value={(formData.ageGroups as any)[age]} 
                  onChange={e => updateAge(age, e.target.value)}
                  className="w-20 px-2 py-1.5 bg-white border border-border rounded-[4px] font-mono text-[12px] text-right outline-none focus:border-accent transition"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-accent hover:opacity-90 text-white px-6 py-3.5 rounded-[4px] text-[13px] font-bold shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            Validate & Post Daily Data
          </button>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-[4px] text-[11px] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-[4px] text-[11px] font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Data synchronized successfully.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
