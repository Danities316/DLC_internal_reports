"use client";

import React, { useState } from 'react';
import { generateReport } from '@/app/actions/reports';
import { exportService } from '@/lib/exportUtils';
import { AuthSession, ReportType } from '@/types';
import Markdown from 'react-markdown';
import { FileText, Download, FileJson, Loader2, AlertCircle, Settings2, Eye } from 'lucide-react';

export function ReportGenerator({ session }: { session: AuthSession }) {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    try {
      const result = await generateReport(reportType, { date, month, year, quarter });
      if (result.text) {
        setGeneratedReport(result.text);
      }
    } catch (err: any) {
      setError(err.message || "Failed to compile report. Ensure data exists for the selected period.");
    } finally {
      setLoading(false);
    }
  };

  const currentTitle = `${reportType.toUpperCase()} REPORT - ${session.centreId}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="lg:col-span-1 space-y-8">
        <div className="minimal-card">
          <div className="label-upper mb-10 border-b border-border pb-4 flex items-center gap-2">
            <Settings2 className="w-3 h-3 text-sidebar" />
            Report Configuration
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="label-upper !mb-0 text-[11px]">Temporal Vector</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'quarterly', label: 'Quarterly' },
                  { id: 'annual', label: 'Annual' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id as ReportType)}
                    className={`px-3 py-2.5 rounded-md text-[11px] font-bold tracking-tight transition-all ${
                      reportType === type.id 
                        ? 'bg-sidebar text-white' 
                        : 'bg-white border border-border text-text-muted hover:border-sidebar hover:text-sidebar'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-border space-y-6">
               {['daily', 'weekly'].includes(reportType) && (
                 <div className="space-y-2">
                   <label className="label-upper !mb-0">Reference Point</label>
                   <input 
                     type="date" 
                     value={date} 
                     onChange={e => setDate(e.target.value)}
                     className="input-field-mono"
                   />
                 </div>
               )}

               {['monthly'].includes(reportType) && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="label-upper !mb-0">Month</label>
                     <select 
                       value={month} 
                       onChange={e => setMonth(parseInt(e.target.value))}
                       className="input-field py-2.5"
                     >
                       {Array.from({ length: 12 }, (_, i) => (
                         <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                       ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="label-upper !mb-0">Year</label>
                     <input 
                       type="number" 
                       value={year} 
                       onChange={e => setYear(parseInt(e.target.value))}
                       className="input-field-mono"
                     />
                   </div>
                 </div>
               )}

               {['quarterly'].includes(reportType) && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="label-upper !mb-0">Quarter</label>
                     <select 
                       value={quarter} 
                       onChange={e => setQuarter(parseInt(e.target.value))}
                       className="input-field py-2.5"
                     >
                        <option value={1}>Q1 / JAN-MAR</option>
                        <option value={2}>Q2 / APR-JUN</option>
                        <option value={3}>Q3 / JUL-SEP</option>
                        <option value={4}>Q4 / OCT-DEC</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="label-upper !mb-0">Year</label>
                     <input 
                       type="number" 
                       value={year} 
                       onChange={e => setYear(parseInt(e.target.value))}
                       className="input-field-mono"
                     />
                   </div>
                 </div>
               )}

               {['annual'].includes(reportType) && (
                 <div className="space-y-2">
                   <label className="label-upper !mb-0">Fiscal Year</label>
                   <input 
                     type="number" 
                     value={year} 
                     onChange={e => setYear(parseInt(e.target.value))}
                     className="input-field-mono"
                   />
                 </div>
               )}
            </div>

            <button
               onClick={handleGenerate}
               disabled={loading}
               className="w-full btn-primary h-14"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Compile Official Report"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-[11px] font-bold flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-sidebar p-6 rounded-lg text-[11px] text-white/40 leading-relaxed font-mono">
          <p className="mb-2 text-white/60">SYSTEM LOG:</p>
          <div className="space-y-1">
            <p>&gt; Engine initialized</p>
            <p>&gt; Aggregation protocol: {reportType.toUpperCase()}</p>
            {loading && <p className="animate-pulse text-accent">&gt; Compiling data vectors...</p>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg border border-border min-h-[750px] flex flex-col transition-all overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="label-upper !mb-0 flex items-center gap-2">
              <Eye className="w-3 h-3 text-text-muted" />
              Document Manifest
            </div>
            {generatedReport && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => exportService.toDocx(currentTitle, generatedReport)}
                  className="btn-outline !py-1.5 flex items-center gap-2"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  DOCX
                </button>
                <button 
                  onClick={() => exportService.toPdf(currentTitle, generatedReport)}
                   className="btn-outline !py-1.5 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-12 overflow-y-auto">
             {!generatedReport && !loading && (
               <div className="h-full flex flex-col items-center justify-center text-text-muted/20">
                  <FileText className="w-16 h-16 mb-6 stroke-[1]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Standby for Parameter Selection</p>
               </div>
             )}

             {loading && (
               <div className="h-full flex flex-col items-center justify-center gap-8">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] animate-pulse">Compiling Master Data...</p>
               </div>
             )}

             {generatedReport && (
               <div className="prose prose-sm max-w-none 
                 prose-h1:text-[20px] prose-h1:font-black prose-h1:tracking-tighter prose-h1:uppercase
                 prose-h2:text-[16px] prose-h2:font-bold prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                 prose-h3:text-[13px] prose-h3:font-black prose-h3:uppercase prose-h3:tracking-widest prose-h3:text-text-muted
                 prose-p:text-[14px] prose-p:leading-relaxed prose-p:text-text-main
                 prose-table:border prose-table:border-border prose-table:rounded-sm prose-table:overflow-hidden 
                 prose-th:bg-bg prose-th:px-4 prose-th:py-3 prose-th:text-[11px] prose-th:font-black prose-th:uppercase prose-th:tracking-wider prose-th:border-r prose-th:border-border
                 prose-td:px-4 prose-td:py-3 prose-td:text-[13px] prose-td:font-mono prose-td:border-r prose-td:border-border
                 prose-hr:border-border
               ">
                 <Markdown>{generatedReport}</Markdown>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
