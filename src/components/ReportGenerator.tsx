import React, { useState } from 'react';
import { generateReport } from '@/app/actions/reports';
import { exportService } from '@/lib/exportUtils';
import { AuthSession, ReportType } from '@/types';
import Markdown from 'react-markdown';
import { 
  FileText, 
  Download, 
  FileJson, 
  Loader2, 
  AlertCircle, 
  Calendar,
  Settings,
  Eye,
  ChevronRight,
  FileCheck
} from 'lucide-react';

export function ReportGenerator({ session }: { session: AuthSession }) {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [reportFormat, setReportFormat] = useState<'whatsapp' | 'document'>('document');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedReport(null);
    setCopied(false);

    try {
      const result = await generateReport(reportType, { date, month, year, quarter });
      if (result.text) {
        setGeneratedReport(result.text);
        setReportFormat(result.format as any);
      }
    } catch (err: any) {
      setError(err.message || "No data found for this period. Please select a different date.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTitle = `${reportType.toUpperCase()} PRODUCTION REPORT - ${session.centreId}`;

  const SectionTitle = ({ num, title }: { num: string, title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">
        {num}
      </div>
      <h3 className="text-[11px] font-black uppercase tracking-widest text-primary">{title}</h3>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Left Column: Settings */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-8 text-primary">
            <Settings className="w-5 h-5" />
            <h2 className="text-xl font-black tracking-tight">Report Settings</h2>
          </div>

          <div className="space-y-10">
            {/* Step 1 */}
            <div>
              <SectionTitle num="1" title="Report Type" />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'daily', label: 'Daily (WhatsApp)' },
                  { id: 'weekly', label: 'Weekly (WhatsApp)' },
                  { id: 'monthly', label: 'Monthly (PDF)' },
                  { id: 'quarterly', label: 'Quarterly (PDF)' },
                  { id: 'annual', label: 'Annual (PDF)' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setReportType(type.id as ReportType);
                      setGeneratedReport(null);
                    }}
                    className={`px-4 py-3 rounded-xl text-[12px] font-bold transition-all border ${
                      reportType === type.id 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-bg border-border text-text-muted hover:border-primary/40'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="pt-8 border-t border-border">
              <SectionTitle num="2" title="Time Period" />
              <div className="space-y-4">
                 {['daily', 'weekly'].includes(reportType) && (
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Select Reference Date</label>
                     <input 
                       type="date" 
                       value={date} 
                       onChange={e => setDate(e.target.value)}
                       className="w-full h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary"
                     />
                   </div>
                 )}

                 {['monthly'].includes(reportType) && (
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Month</label>
                       <select 
                         value={month} 
                         onChange={e => setMonth(parseInt(e.target.value))}
                         className="w-full h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary"
                       >
                         {Array.from({ length: 12 }, (_, i) => (
                           <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                         ))}
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Year</label>
                       <input 
                         type="number" 
                         value={year} 
                         onChange={e => setYear(parseInt(e.target.value))}
                         className="w-full h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary"
                       />
                     </div>
                   </div>
                 )}

                 {['quarterly'].includes(reportType) && (
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Quarter</label>
                       <select 
                         value={quarter} 
                         onChange={e => setQuarter(parseInt(e.target.value))}
                         className="w-full h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary"
                       >
                          <option value={1}>Q1 (Jan-Mar)</option>
                          <option value={2}>Q2 (Apr-Jun)</option>
                          <option value={3}>Q3 (Jul-Sep)</option>
                          <option value={4}>Q4 (Oct-Dec)</option>
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Year</label>
                       <input 
                         type="number" 
                         value={year} 
                         onChange={e => setYear(parseInt(e.target.value))}
                         className="w-full h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary"
                       />
                     </div>
                   </div>
                 )}

                 {['annual'].includes(reportType) && (
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Select Year</label>
                     <input 
                       type="number" 
                       value={year} 
                       onChange={e => setYear(parseInt(e.target.value))}
                       className="w-full h-12 px-4 bg-bg border border-border rounded-xl font-bold outline-none focus:border-primary"
                     />
                   </div>
                 )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="pt-8 border-t border-border">
              <button
                 onClick={handleGenerate}
                 disabled={loading}
                 className="group w-full h-14 bg-primary text-white rounded-xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <FileCheck className="w-5 h-5" />
                    <span>Generate Report</span>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-5 bg-accent/5 border border-accent/20 text-accent rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-black">No Data Found</p>
              <p className="text-[12px] font-bold opacity-80">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Preview */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm min-h-[600px] flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-lg">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-primary">
                {reportFormat === 'whatsapp' ? 'WhatsApp Message' : 'Report Preview'}
              </h3>
            </div>
            
            {generatedReport && reportFormat === 'whatsapp' && (
              <button 
                onClick={handleCopy}
                className={`h-10 px-6 ${copied ? 'bg-green-600' : 'bg-accent'} text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/20`}
              >
                {copied ? <FileCheck className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                {copied ? 'COPIED TO CLIPBOARD' : 'COPY FOR WHATSAPP'}
              </button>
            )}

            {generatedReport && reportFormat === 'document' && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => exportService.toDocx(currentTitle, generatedReport)}
                  className="flex-1 sm:flex-none h-10 px-4 bg-bg border border-border rounded-lg text-[11px] font-black flex items-center justify-center gap-2 hover:border-primary transition-colors"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  WORD
                </button>
                <button 
                  onClick={() => exportService.toPdf(currentTitle, generatedReport)}
                   className="flex-1 sm:flex-none h-10 px-4 bg-accent text-white rounded-lg text-[11px] font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-bg/20">
             {!generatedReport && !loading && (
               <div className="h-full flex flex-col items-center justify-center text-text-muted/30 py-20">
                  <FileText className="w-16 h-16 mb-6 stroke-[1]" />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-center max-w-[200px]">Choose your settings and click generate</p>
               </div>
             )}

             {loading && (
               <div className="h-full flex flex-col items-center justify-center gap-6 py-20">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Compiling Report...</p>
               </div>
             )}

             {generatedReport && reportFormat === 'whatsapp' && (
               <div className="bg-white p-8 lg:p-12 shadow-sm border border-border/50 rounded-xl max-w-[500px] mx-auto font-mono text-sm whitespace-pre-wrap leading-relaxed text-sidebar">
                 {generatedReport}
               </div>
             )}

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
    </div>
  );
}
