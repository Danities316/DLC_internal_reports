import React, { useState } from 'react';
import { saveDailyReport } from '@/app/actions/reports';
import { AuthSession } from '@/types';
import { 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Layers, 
  UserPlus, 
  ClipboardList,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  session: AuthSession;
}

export function DailyEntryForm({ session }: Props) {
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
    remarks: "",
    balBF: 0,
    received: 0,
    claimed: 0,
    balCF: 0
  });

  const totals = {
    gender: formData.male + formData.female,
    types: formData.fresh + formData.renewal + formData.reissue,
    classes: Object.values(formData.classes).reduce((a, b) => a + b, 0),
    ages: Object.values(formData.ageGroups).reduce((a, b) => a + b, 0)
  };

  const validate = () => {
    if (totals.gender !== formData.totalProduction) {
      return "The sum of Male and Female must match the Total Production.";
    }
    if (totals.types !== formData.totalProduction) {
      return "The sum of Fresh, Renewal, and Reissue must match the Total Production.";
    }
    if (totals.classes !== formData.totalProduction) {
      return "The sum of Licence Classes must match the Total Production.";
    }
    if (totals.ages !== formData.totalProduction) {
      return "The sum of Age Groups must match the Total Production.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setError(err.message || "Something went wrong. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border/50">
      <div className="p-1.5 rounded-md bg-primary/5 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest text-primary">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="bg-accent/10 border border-accent/20 p-4 rounded-xl flex items-center gap-4 text-accent"
            >
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 1: Date & Total */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={Calendar} title="Date & Main Production" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[11px] font-black uppercase tracking-widest text-text-muted">Recording Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full h-14 px-5 bg-bg border border-border rounded-xl text-lg font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black uppercase tracking-widest text-text-muted">Total Licenses Produced</label>
              <input 
                type="number" 
                placeholder="0"
                value={formData.totalProduction || ''}
                onChange={e => setFormData({...formData, totalProduction: parseInt(e.target.value) || 0})}
                className="w-full h-14 px-5 bg-primary/5 border-2 border-primary text-primary rounded-xl text-2xl font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              />
              <p className="text-[10px] text-primary/60 font-bold italic">* This is the master number for the day.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 2: Application Types */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden">
            <SectionHeader icon={UserPlus} title="Application Type" />
            <div className="space-y-6">
              {[
                { id: 'fresh', label: 'Fresh (New)' },
                { id: 'renewal', label: 'Renewal' },
                { id: 'reissue', label: 'Re-Issue (Lost/Damage)' },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <label className="text-sm font-bold text-text-main">{item.label}</label>
                  <input 
                    type="number" 
                    value={(formData as any)[item.id] || ''}
                    onChange={e => setFormData({...formData, [item.id]: parseInt(e.target.value) || 0})}
                    className="w-24 h-12 text-center bg-bg border border-border rounded-lg font-bold focus:border-primary outline-none"
                  />
                </div>
              ))}
              <div className={`mt-4 pt-4 border-t border-dashed ${totals.types === formData.totalProduction ? 'border-green-200' : 'border-accent/20'}`}>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span>Current Sum:</span>
                  <span className={totals.types === formData.totalProduction ? 'text-green-600' : 'text-accent'}>{totals.types} / {formData.totalProduction}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Gender */}
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden">
            <SectionHeader icon={Users} title="Gender Breakdown" />
            <div className="space-y-6">
              {[
                { id: 'male', label: 'Male Applicants' },
                { id: 'female', label: 'Female Applicants' },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between gap-4">
                  <label className="text-sm font-bold text-text-main">{item.label}</label>
                  <input 
                    type="number" 
                    value={(formData as any)[item.id] || ''}
                    onChange={e => setFormData({...formData, [item.id]: parseInt(e.target.value) || 0})}
                    className="w-24 h-12 text-center bg-bg border border-border rounded-lg font-bold focus:border-primary outline-none"
                  />
                </div>
              ))}
              <div className={`mt-4 pt-4 border-t border-dashed ${totals.gender === formData.totalProduction ? 'border-green-200' : 'border-accent/20'}`}>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span>Current Sum:</span>
                  <span className={totals.gender === formData.totalProduction ? 'text-green-600' : 'text-accent'}>{totals.gender} / {formData.totalProduction}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: License Classes Grid */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={Layers} title="Licence Classes" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Object.keys(formData.classes).map(cls => (
              <div key={cls} className="p-4 bg-bg rounded-xl border border-border text-center space-y-2">
                <label className="block text-[10px] font-black text-primary uppercase">Class {cls}</label>
                <input 
                  type="number" 
                  value={(formData.classes as any)[cls] || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    classes: { ...formData.classes, [cls]: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full h-10 text-center bg-white border border-border rounded-lg font-black text-lg outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <div className="px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
               <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mr-3">Class Total:</span>
               <span className={`text-sm font-black ${totals.classes === formData.totalProduction ? 'text-green-600' : 'text-accent'}`}>{totals.classes}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Age Groups */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={ClipboardList} title="Age Group Analysis" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {Object.keys(formData.ageGroups).map(age => (
              <div key={age} className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-text-muted">Ages {age}</label>
                <input 
                  type="number" 
                  value={(formData.ageGroups as any)[age] || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    ageGroups: { ...formData.ageGroups, [age]: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full h-14 px-5 bg-bg border border-border rounded-xl text-xl font-bold focus:border-primary outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Stock Balance */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={ClipboardList} title="License Card Inventory (Stock)" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'balBF', label: 'Bal B/F' },
              { id: 'received', label: 'Received (Print Farm)' },
              { id: 'claimed', label: 'Claimed / Issued' },
              { id: 'balCF', label: 'Bal C/F (Carried)' },
            ].map(item => (
              <div key={item.id} className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">{item.label}</label>
                <input 
                  type="number" 
                  value={(formData as any)[item.id] || ''}
                  onChange={e => setFormData({...formData, [item.id]: parseInt(e.target.value) || 0})}
                  className={`w-full h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary ${item.id === 'balCF' ? 'bg-primary/5 border-primary/20' : ''}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-text-muted italic">
            <Info className="w-3 h-3" />
            <span>Calculation: (B/F + Received) - Claimed = C/F</span>
          </div>
        </div>

        {/* Section 7: Remarks */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={Info} title="Remarks & Observations" />
          <textarea 
            placeholder="Add any extra notes here..."
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
            className="w-full h-32 p-5 bg-bg border border-border rounded-xl font-medium focus:border-primary outline-none resize-none"
          />
        </div>

        {/* Submit Section */}
        <div className="sticky bottom-8 z-20">
          <div className="max-w-xs mx-auto">
            <button
              disabled={loading}
              className="group w-full h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="text-lg font-black tracking-tight">Save Record</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/20 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-primary mb-2">Record Saved!</h2>
              <p className="text-text-muted font-bold mb-8">The database has been updated successfully.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="w-full py-4 bg-primary text-white rounded-xl font-black"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
