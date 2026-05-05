import React, { useState, useEffect, useCallback } from 'react';
import { saveDailyReport, getPreviousBalance, checkDateExists } from '@/app/actions/reports';
import { AuthSession } from '@/types';
import { 
  Save, AlertCircle, CheckCircle2, Calendar, Users, 
  Layers, UserPlus, ClipboardList, Info, Lock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props { session: AuthSession; }

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export function DailyEntryForm({ session }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const isAdmin = session.role === 'admin';

  const [formData, setFormData] = useState({
    date: todayStr(),
    totalProduction: 0,
    fresh: 0, renewal: 0, reissue: 0,
    male: 0, female: 0,
    classes: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, J: 0 },
    ageGroups: { "18-25": 0, "26-60": 0, "60+": 0 },
    validity3Yr: 0, validity5Yr: 0,
    remarks: "",
    balBF: 0, received: 0, damaged: 0, claimed: 0, balCF: 0
  });

  // Issue 2: Lock all fields until totalProduction > 0
  const isLocked = formData.totalProduction === 0;

  // Issue 4: Auto-calculate Bal C/F
  const autoBalCF = formData.balBF + formData.received - formData.claimed - formData.damaged;

  // Issue 4: Auto-fetch previous day's balance when date changes
  const fetchPreviousBalance = useCallback(async (date: string) => {
    try {
      const result = await getPreviousBalance(date);
      setFormData(prev => ({ ...prev, balBF: result.balBF }));
    } catch { /* silent fail — user can still enter manually */ }
  }, []);

  useEffect(() => {
    fetchPreviousBalance(formData.date);
  }, [formData.date, fetchPreviousBalance]);

  const totals = {
    production: formData.fresh + formData.renewal + formData.reissue,
    gender: formData.male + formData.female,
    classes: Object.values(formData.classes).reduce((a, b) => a + b, 0),
    ages: Object.values(formData.ageGroups).reduce((a, b) => a + b, 0),
    validity: formData.validity3Yr + formData.validity5Yr
  };

  const validate = () => {
    if (formData.totalProduction === 0) return "Total Licenses Produced must be greater than 0.";
    if (totals.gender !== formData.totalProduction) return "Male + Female must equal Total Production.";
    if (totals.production !== formData.totalProduction) return "Fresh + Renewal + Reissue must equal Total Production.";
    if (totals.classes !== formData.totalProduction) return "Licence Classes total must equal Total Production.";
    if (totals.ages !== formData.totalProduction) return "Age Groups total must equal Total Production.";
    if (totals.validity !== formData.totalProduction) return "3-Year + 5-Year must equal Total Production.";
    return null;
  };

  const doSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const submitData = { ...formData, balCF: autoBalCF };
      const result = await saveDailyReport(submitData);
      if (result.error) throw new Error(result.error);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Check your internet connection.");
    } finally {
      setLoading(false);
      setShowOverwriteConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    // Issue 5: Date check (client-side)
    if (formData.date !== todayStr() && !isAdmin) {
      setError("You can only submit for today's date. Contact your admin for corrections.");
      return;
    }

    // Issue 5: Duplicate check
    try {
      const existing = await checkDateExists(formData.date);
      if (existing.exists) {
        if (!isAdmin) {
          setError(`A report for ${formData.date} already exists. Contact your admin to modify it.`);
          return;
        }
        setShowOverwriteConfirm(true);
        return;
      }
    } catch { /* proceed anyway if check fails */ }

    await doSubmit();
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border/50">
      <div className="p-1.5 rounded-md bg-primary/5 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-widest text-primary">{title}</h3>
    </div>
  );

  // Locked section wrapper
  const LockableSection = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      {isLocked && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-not-allowed">
          <Lock className="w-5 h-5 text-text-muted/40" />
          <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest text-center px-4">
            Enter Total Licenses above first
          </p>
        </div>
      )}
      <div className={isLocked ? 'opacity-40 pointer-events-none' : ''}>{children}</div>
    </div>
  );

  const matchClass = (sum: number) => sum === formData.totalProduction ? 'text-green-600' : 'text-accent';
  const matchBorder = (sum: number) => sum === formData.totalProduction ? 'border-green-200' : 'border-accent/20';

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Date & Total (always unlocked) */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={Calendar} title="Date & Main Production" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[11px] font-black uppercase tracking-widest text-text-muted">Recording Date</label>
              {isAdmin ? (
                <input type="date" value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full h-14 px-5 bg-bg border border-border rounded-xl text-lg font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
              ) : (
                <div className="w-full h-14 px-5 bg-bg border border-border rounded-xl text-lg font-bold flex items-center text-text-main">
                  {new Date(formData.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
              {!isAdmin && (
                <p className="text-[10px] text-text-muted/60 font-bold italic flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Date is locked to today. Admins can override.
                </p>
              )}
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black uppercase tracking-widest text-text-muted">Total Licenses Produced</label>
              <input type="number" placeholder="0"
                value={formData.totalProduction || ''}
                onChange={e => setFormData({...formData, totalProduction: parseInt(e.target.value) || 0})}
                className="w-full h-14 px-5 bg-primary/5 border-2 border-primary text-primary rounded-xl text-2xl font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              />
              <p className="text-[10px] text-primary/60 font-bold italic">
                {isLocked ? '⚠️ Fill this first to unlock all sections below.' : '✓ Sections unlocked. Fill in the breakdown below.'}
              </p>
            </div>
          </div>
        </div>

        {/* All remaining sections wrapped in LockableSection */}
        <LockableSection>
        <div className="space-y-8">

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
                  <input type="number" value={(formData as any)[item.id] || ''}
                    onChange={e => setFormData({...formData, [item.id]: parseInt(e.target.value) || 0})}
                    className="w-24 h-12 text-center bg-bg border border-border rounded-lg font-bold focus:border-primary outline-none"
                  />
                </div>
              ))}
              <div className={`mt-4 pt-4 border-t border-dashed ${matchBorder(totals.production)}`}>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span>Current Sum:</span>
                  <span className={matchClass(totals.production)}>{totals.production} / {formData.totalProduction}</span>
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
                  <input type="number" value={(formData as any)[item.id] || ''}
                    onChange={e => setFormData({...formData, [item.id]: parseInt(e.target.value) || 0})}
                    className="w-24 h-12 text-center bg-bg border border-border rounded-lg font-bold focus:border-primary outline-none"
                  />
                </div>
              ))}
              <div className={`mt-4 pt-4 border-t border-dashed ${matchBorder(totals.gender)}`}>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span>Current Sum:</span>
                  <span className={matchClass(totals.gender)}>{totals.gender} / {formData.totalProduction}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: License Classes */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={Layers} title="Licence Classes" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Object.keys(formData.classes).map(cls => (
              <div key={cls} className="p-4 bg-bg rounded-xl border border-border text-center space-y-2">
                <label className="block text-[10px] font-black text-primary uppercase">Class {cls}</label>
                <input type="number" value={(formData.classes as any)[cls] || ''}
                  onChange={e => setFormData({ ...formData, classes: { ...formData.classes, [cls]: parseInt(e.target.value) || 0 } })}
                  className="w-full h-10 text-center bg-white border border-border rounded-lg font-black text-lg outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <div className="px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
               <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mr-3">Class Total:</span>
               <span className={`text-sm font-black ${matchClass(totals.classes)}`}>{totals.classes}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Validity */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={Calendar} title="License Validity Period" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {['validity3Yr', 'validity5Yr'].map(type => (
              <div key={type} className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-text-muted">
                  {type === 'validity3Yr' ? '3-Year License' : '5-Year License'}
                </label>
                <input type="number" value={(formData as any)[type] || ''}
                  onChange={e => setFormData({...formData, [type]: parseInt(e.target.value) || 0})}
                  className="w-full h-14 px-5 bg-bg border border-border rounded-xl text-xl font-bold focus:border-primary outline-none"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-border flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
            <span className="text-text-muted">Validity Total</span>
            <span className={matchClass(totals.validity)}>{totals.validity} / {formData.totalProduction}</span>
          </div>
        </div>

        {/* Section 6: Age Groups */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={ClipboardList} title="Age Group Analysis" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {Object.keys(formData.ageGroups).map(age => (
              <div key={age} className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-text-muted">Ages {age}</label>
                <input type="number" value={(formData.ageGroups as any)[age] || ''}
                  onChange={e => setFormData({ ...formData, ageGroups: { ...formData.ageGroups, [age]: parseInt(e.target.value) || 0 } })}
                  className="w-full h-14 px-5 bg-bg border border-border rounded-xl text-xl font-bold focus:border-primary outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Stock Balance — Issue 4: auto-calculated */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={ClipboardList} title="License Card Inventory (Stock)" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { id: 'balBF', label: 'Bal B/F', readOnly: false, hint: 'Auto-loaded from previous day' },
              { id: 'received', label: 'Received (Print Farm)', readOnly: false },
              { id: 'damaged', label: 'Damaged Cards', readOnly: false },
              { id: 'claimed', label: 'Claimed / Issued', readOnly: false },
            ].map(item => (
              <div key={item.id} className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">{item.label}</label>
                <input type="number"
                  value={(formData as any)[item.id] || ''}
                  onChange={e => setFormData({...formData, [item.id]: parseInt(e.target.value) || 0})}
                  className={`w-full h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary ${item.id === 'damaged' ? 'text-accent' : ''}`}
                />
                {item.hint && <p className="text-[9px] text-text-muted/50 font-bold italic">{item.hint}</p>}
              </div>
            ))}
            {/* Bal C/F: auto-calculated read-only */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Bal C/F (Auto)</label>
              <div className="w-full h-12 px-4 bg-primary/5 border-2 border-primary/20 rounded-xl font-black text-primary flex items-center gap-2">
                <Lock className="w-3 h-3 opacity-40" />
                {autoBalCF}
              </div>
              <p className="text-[9px] text-primary/50 font-bold italic">Auto: (B/F + Received) − (Claimed + Damaged)</p>
            </div>
          </div>
        </div>

        {/* Section 8: Remarks */}
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <SectionHeader icon={Info} title="Remarks & Observations" />
          <textarea placeholder="Add any extra notes here..."
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
            className="w-full h-32 p-5 bg-bg border border-border rounded-xl font-medium focus:border-primary outline-none resize-none"
          />
        </div>

        </div>
        </LockableSection>

        {/* Submit */}
        <div className="sticky bottom-8 z-20">
          <div className="max-w-xs mx-auto">
            <button disabled={loading || isLocked}
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

      {/* Issue 6: Fixed bottom toast for errors — always visible */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 80 }}
            className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[100]"
          >
            <div className="bg-red-600 text-white p-4 rounded-xl shadow-2xl shadow-red-600/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-bold flex-1">{error}</p>
              <button onClick={() => setError(null)} className="shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin overwrite confirmation dialog */}
      <AnimatePresence>
        {showOverwriteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-primary mb-2">Record Exists</h2>
              <p className="text-text-muted text-sm font-bold mb-6">
                A report for <strong>{formData.date}</strong> already exists. Do you want to overwrite it?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowOverwriteConfirm(false)}
                  className="flex-1 py-3 bg-bg border border-border rounded-xl font-bold text-text-muted hover:bg-border/30 transition-colors">
                  Cancel
                </button>
                <button onClick={doSubmit}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20">
                  {loading ? 'Saving...' : 'Overwrite'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/20 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-primary mb-2">Record Saved!</h2>
              <p className="text-text-muted font-bold mb-8">The database has been updated successfully.</p>
              <button onClick={() => setSuccess(false)}
                className="w-full py-4 bg-primary text-white rounded-xl font-black">
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
