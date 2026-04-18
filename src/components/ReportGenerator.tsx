import React, { useState } from 'react';
import { reportService } from '../services/reportService';
import { aiService } from '../services/aiService';
import { exportService } from '../lib/exportUtils';
import { useAuth } from '../hooks/useAuth';
import { ReportType } from '../types';
import Markdown from 'react-markdown';
import { FileText, Sparkles, Download, FileJson, Loader2, AlertCircle } from 'lucide-react';

export function ReportGenerator() {
  const { profile } = useAuth();
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    try {
      let aggregatedData;
      const centreId = profile.centreId;

      if (reportType === 'daily') {
        aggregatedData = await reportService.getAggregatedData(date, date, centreId);
      } else if (reportType === 'weekly') {
        aggregatedData = await reportService.getWeeklyReport(date, centreId);
      } else if (reportType === 'monthly') {
        aggregatedData = await reportService.getMonthlyReport(year, month, centreId);
      } else if (reportType === 'quarterly') {
        aggregatedData = await reportService.getQuarterlyReport(year, quarter, centreId);
      } else {
        aggregatedData = await reportService.getAnnualReport(year, centreId);
      }

      if (!aggregatedData) {
        throw new Error("No operational data found for the selected period.");
      }

      const aiText = await aiService.generateReportText(aggregatedData, reportType, profile.centreId);
      setGeneratedReport(aiText || "Could not generate report content.");
    } catch (err: any) {
      setError(err.message || "Failed to generate report.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentTitle = `${reportType.toUpperCase()} REPORT - ${profile?.centreId}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Config Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-lg border border-border">
          <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-6 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Report Assistant
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-text-main block mb-3">Target Periodicity</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'quarterly', label: 'Quarter' },
                  { id: 'annual', label: 'Annual' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id as ReportType)}
                    className={`px-3 py-2 rounded-[4px] text-[12px] font-semibold transition ${
                      reportType === type.id 
                        ? 'bg-accent text-white shadow-sm' 
                        : 'bg-white border border-border text-text-muted hover:border-accent hover:text-accent'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-4">
               {['daily', 'weekly'].includes(reportType) && (
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-text-main">Reference Date</label>
                   <input 
                     type="date" 
                     value={date} 
                     onChange={e => setDate(e.target.value)}
                     className="px-3 py-2 bg-white border border-border rounded-[4px] font-mono text-[13px] outline-none focus:border-accent transition"
                   />
                 </div>
               )}

               {['monthly'].includes(reportType) && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-bold text-text-main">Month</label>
                     <select 
                       value={month} 
                       onChange={e => setMonth(parseInt(e.target.value))}
                       className="px-3 py-2 bg-white border border-border rounded-[4px] text-[13px] outline-none focus:border-accent transition"
                     >
                       {Array.from({ length: 12 }, (_, i) => (
                         <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                       ))}
                     </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-bold text-text-main">Year</label>
                     <input 
                       type="number" 
                       value={year} 
                       onChange={e => setYear(parseInt(e.target.value))}
                       className="px-3 py-2 bg-white border border-border rounded-[4px] font-mono text-[13px] outline-none focus:border-accent transition"
                     />
                   </div>
                 </div>
               )}

               {['quarterly'].includes(reportType) && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-bold text-text-main">Quarter</label>
                     <select 
                       value={quarter} 
                       onChange={e => setQuarter(parseInt(e.target.value))}
                       className="px-3 py-2 bg-white border border-border rounded-[4px] text-[13px] outline-none focus:border-accent transition"
                     >
                        <option value={1}>Q1 (Jan-Mar)</option>
                        <option value={2}>Q2 (Apr-Jun)</option>
                        <option value={3}>Q3 (Jul-Sep)</option>
                        <option value={4}>Q4 (Oct-Dec)</option>
                     </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[11px] font-bold text-text-main">Year</label>
                     <input 
                       type="number" 
                       value={year} 
                       onChange={e => setYear(parseInt(e.target.value))}
                       className="px-3 py-2 bg-white border border-border rounded-[4px] font-mono text-[13px] outline-none focus:border-accent transition"
                     />
                   </div>
                 </div>
               )}

               {['annual'].includes(reportType) && (
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-bold text-text-main">Year</label>
                   <input 
                     type="number" 
                     value={year} 
                     onChange={e => setYear(parseInt(e.target.value))}
                     className="px-3 py-2 bg-white border border-border rounded-[4px] font-mono text-[13px] outline-none focus:border-accent transition"
                   />
                 </div>
               )}
            </div>

            <button
               onClick={handleGenerate}
               disabled={loading}
               className="w-full mt-8 bg-accent hover:opacity-90 text-white py-3.5 rounded-[4px] text-[13px] font-bold shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Official Report
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-[4px] text-[11px] font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-[#eff6ff] border border-dashed border-accent p-4 rounded-md text-[11px] text-accent leading-relaxed">
            <strong>Gemini AI Intelligence:</strong> Drafting document structure and finalizing operational breakdown based on FRSC tone standards...
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg border border-border min-h-[700px] flex flex-col shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="text-[10px] uppercase font-bold text-text-muted tracking-widest flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-text-muted" />
              Document Preview
            </div>
            {generatedReport && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => exportService.toDocx(currentTitle, generatedReport)}
                  className="px-3 py-1.5 bg-white border border-border text-sidebar text-[10px] font-bold rounded-md hover:border-accent hover:text-accent transition flex items-center gap-2"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  DOCX
                </button>
                <button 
                  onClick={() => exportService.toPdf(currentTitle, generatedReport)}
                   className="px-3 py-1.5 bg-white border border-border text-sidebar text-[10px] font-bold rounded-md hover:border-accent hover:text-accent transition flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-10 overflow-y-auto bg-white">
             {!generatedReport && !loading && (
               <div className="h-full flex flex-col items-center justify-center text-text-muted/40">
                  <FileText className="w-12 h-12 mb-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest">Awaiting Parameterization</p>
               </div>
             )}

             {loading && (
               <div className="h-full flex flex-col items-center justify-center gap-6">
                  <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[11px] font-bold text-accent uppercase tracking-widest animate-pulse">Drafting Master Report...</p>
               </div>
             )}

             {generatedReport && (
               <div className="prose prose-sm max-w-none prose-table:border prose-table:border-neutral-200 prose-th:bg-neutral-50 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2">
                 <Markdown>{generatedReport}</Markdown>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
