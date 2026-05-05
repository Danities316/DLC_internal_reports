import React, { useState } from 'react';
import { generateReport } from '@/app/actions/reports';
import { exportService } from '@/lib/exportUtils';
import { AuthSession, ReportType } from '@/types';
import Markdown from 'react-markdown';
import { 
  FileText, Download, FileJson, Loader2, AlertCircle, Calendar,
  Eye, ChevronRight, FileCheck, Zap, MessageCircle, Copy, Check,
  ChevronDown, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ReportGenerator({ session }: { session: AuthSession }) {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [reportFormat, setReportFormat] = useState<'whatsapp' | 'document'>('whatsapp');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async (type?: ReportType) => {
    const useType = type || reportType;
    setLoading(true);
    setError(null);
    setGeneratedReport(null);
    setCopied(false);

    try {
      const result = await generateReport(useType, { date, month, year, quarter });
      if (result.text) {
        setGeneratedReport(result.text);
        setReportFormat(result.format as any);
        if (type) setReportType(useType);
        // Auto-scroll to preview on mobile
        setTimeout(() => {
          document.getElementById('report-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    } catch (err: any) {
      setError(err.message || "No data found for this period.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    const encoded = encodeURIComponent(generatedReport);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const currentTitle = `${reportType.toUpperCase()} PRODUCTION REPORT - ${session.centreId}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Quick Daily Report — 1-click shortcut */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 sm:p-6 rounded-2xl shadow-xl shadow-green-600/20 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">Quick Daily Report</h2>
              <p className="text-white/70 text-sm">Generate today&apos;s WhatsApp summary in one click</p>
            </div>
          </div>
          <button
            onClick={() => handleGenerate('daily')}
            disabled={loading}
            className="w-full sm:w-auto h-12 px-8 bg-white text-green-700 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
          >
            {loading && reportType === 'daily' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Generate Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Settings — collapsible on mobile */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-bg/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-sm font-black uppercase tracking-widest text-primary">Other Report Types</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
                {/* Report Type Selection */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Report Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'daily', label: 'Daily', sub: 'WhatsApp' },
                      { id: 'weekly', label: 'Weekly', sub: 'WhatsApp' },
                      { id: 'monthly', label: 'Monthly', sub: 'PDF' },
                      { id: 'quarterly', label: 'Quarterly', sub: 'PDF' },
                      { id: 'annual', label: 'Annual', sub: 'PDF' },
                    ].map(type => (
                      <button key={type.id}
                        onClick={() => { setReportType(type.id as ReportType); setGeneratedReport(null); }}
                        className={`px-3 py-3 rounded-xl text-[11px] font-bold transition-all border text-center ${
                          reportType === type.id 
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                            : 'bg-bg border-border text-text-muted hover:border-primary/40'
                        }`}
                      >
                        <div>{type.label}</div>
                        <div className={`text-[9px] mt-0.5 ${reportType === type.id ? 'text-white/60' : 'text-text-muted/50'}`}>{type.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selectors */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 block">Time Period</label>
                  {['daily', 'weekly'].includes(reportType) && (
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="w-full sm:w-64 h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary"
                    />
                  )}
                  {reportType === 'monthly' && (
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
                        className="h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary">
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                      </select>
                      <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))}
                        className="h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary" />
                    </div>
                  )}
                  {reportType === 'quarterly' && (
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <select value={quarter} onChange={e => setQuarter(parseInt(e.target.value))}
                        className="h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary">
                        <option value={1}>Q1 (Jan-Mar)</option>
                        <option value={2}>Q2 (Apr-Jun)</option>
                        <option value={3}>Q3 (Jul-Sep)</option>
                        <option value={4}>Q4 (Oct-Dec)</option>
                      </select>
                      <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))}
                        className="h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary" />
                    </div>
                  )}
                  {reportType === 'annual' && (
                    <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))}
                      className="w-full sm:w-40 h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary" />
                  )}
                </div>

                {/* Generate Button */}
                <button onClick={() => handleGenerate()} disabled={loading}
                  className="w-full sm:w-auto h-12 px-8 bg-primary text-white rounded-xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Generate Report</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black">No Data Found</p>
              <p className="text-[12px] font-bold opacity-80">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Section */}
      <div id="report-preview" className="bg-white rounded-2xl border border-border shadow-sm min-h-[400px] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/5 rounded-lg">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">
              {reportFormat === 'whatsapp' ? 'WhatsApp Message' : 'Report Preview'}
            </h3>
          </div>

          {/* Document export buttons (PDF/Word) */}
          {generatedReport && reportFormat === 'document' && (
            <div className="flex items-center gap-2">
              <button onClick={() => exportService.toDocx(currentTitle, generatedReport)}
                className="h-9 px-4 bg-bg border border-border rounded-lg text-[11px] font-black flex items-center gap-2 hover:border-primary transition-colors">
                <FileJson className="w-3.5 h-3.5" /> WORD
              </button>
              <button onClick={() => exportService.toPdf(currentTitle, generatedReport)}
                className="h-9 px-4 bg-accent text-white rounded-lg text-[11px] font-black flex items-center gap-2 hover:opacity-90 shadow-lg shadow-accent/20">
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto bg-bg/20">
          {/* Empty state */}
          {!generatedReport && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-text-muted/30 py-20">
              <FileText className="w-16 h-16 mb-6 stroke-[1]" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-center max-w-[240px]">
                Use Quick Daily Report above or choose settings to generate
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-6 py-20">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Compiling Report...</p>
            </div>
          )}

          {/* WhatsApp preview */}
          {generatedReport && reportFormat === 'whatsapp' && (
            <div className="max-w-[500px] mx-auto space-y-4">
              <div className="bg-white p-6 sm:p-8 shadow-sm border border-border/50 rounded-xl font-mono text-sm whitespace-pre-wrap leading-relaxed text-sidebar">
                {generatedReport}
              </div>

              {/* WhatsApp Action Buttons — prominent & clear */}
              <div className="space-y-3">
                <button onClick={handleWhatsAppShare}
                  className="w-full h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-black flex items-center justify-center gap-3 shadow-xl shadow-[#25D366]/30 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  Share via WhatsApp
                </button>
                <button onClick={handleCopy}
                  className={`w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm border ${
                    copied 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-white border-border text-text-muted hover:border-primary/40'
                  }`}
                >
                  {copied ? <><Check className="w-4 h-4" /> Copied to clipboard!</> : <><Copy className="w-4 h-4" /> Copy text only</>}
                </button>
              </div>
            </div>
          )}

          {/* Document preview */}
          {generatedReport && reportFormat === 'document' && (
            <div id="pdf-report-content" style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }} className="bg-white p-10 lg:p-16 shadow-xl border border-border/50 rounded-sm mx-auto max-w-[800px]
              prose prose-sm max-w-none
              prose-h1:text-[22px] prose-h1:font-black prose-h1:tracking-tight prose-h1:text-primary prose-h1:border-b-4 prose-h1:border-primary/10 prose-h1:pb-4
              prose-h2:text-[16px] prose-h2:font-black prose-h2:text-text-main prose-h2:mt-10
              prose-h3:text-[13px] prose-h3:font-black prose-h3:uppercase prose-h3:tracking-widest prose-h3:text-accent
              prose-p:text-[14px] prose-p:leading-relaxed prose-p:text-text-main
              prose-table:block prose-table:overflow-x-auto prose-table:border prose-table:border-border prose-table:rounded-xl
              prose-th:bg-primary/5 prose-th:px-4 prose-th:py-4 prose-th:text-[10px] prose-th:font-black prose-th:uppercase prose-th:text-primary prose-th:border-r prose-th:border-border
              prose-td:px-4 prose-td:py-4 prose-td:text-[13px] prose-td:font-bold prose-td:border-r prose-td:border-border
              prose-hr:border-border/50
            ">
              <Markdown>{generatedReport}</Markdown>
              <div className="mt-20 pt-10 border-t border-border flex justify-between items-end italic opacity-40 text-[10px]">
                <div>
                  <p>Generated by: {session.name}</p>
                  <p>Station ID: {session.centreId}</p>
                </div>
                <div className="text-right">
                  <p>Authorized DLC System Output</p>
                  <p>{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
