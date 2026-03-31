
import React, { useState } from 'react';
import { FileAnalysis } from '../types';

interface AnalysisViewProps {
  analyses: FileAnalysis[];
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ analyses }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = analyses[selectedIndex];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'Ready': return 'bg-green-500 text-white';
      case 'Needs Revisions': return 'bg-amber-500 text-white';
      case 'Requires Major Changes': return 'bg-red-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getVerdictIcon = (verdict?: string) => {
    switch (verdict) {
      case 'Ready': return 'fa-check-circle text-green-500';
      case 'Needs Revisions': return 'fa-triangle-exclamation text-amber-500';
      case 'Requires Major Changes': return 'fa-circle-xmark text-red-500';
      default: return 'fa-circle-dot text-slate-300';
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-4 space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Analyzed Documents</h3>
        <div className="space-y-2">
          {analyses.map((analysis, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                selectedIndex === idx 
                ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
                : 'bg-white border-slate-200 hover:border-indigo-300'
              }`}
            >
              <i className={`fas ${getVerdictIcon(analysis.result?.overallVerdict)} text-lg`}></i>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{analysis.fileName}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  {analysis.result?.overallVerdict || 'Analyzing...'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      <div className="lg:col-span-8 space-y-6">
        {selected.status === 'analyzing' ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Processing {selected.fileName}...</p>
          </div>
        ) : selected.result ? (
          <div className="space-y-6">
            {/* Summary Card */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Review Summary</h2>
                <span className={`px-4 py-1 rounded-full text-xs font-bold ${getVerdictBadge(selected.result.overallVerdict)}`}>
                  {selected.result.overallVerdict}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">{selected.result.summary}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-2 flex items-center text-sm">
                    <i className="fas fa-microscope mr-2"></i> Methodology Critique
                  </h3>
                  <p className="text-xs text-indigo-800 leading-relaxed">{selected.result.methodologyCritique}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <h3 className="font-bold text-purple-900 mb-2 flex items-center text-sm">
                    <i className="fas fa-table mr-2"></i> Tables Analysis
                  </h3>
                  <div className="space-y-2 text-xs text-purple-800">
                    <p><strong>Table 3:</strong> {selected.result.tableAnalysis.table3}</p>
                    <p><strong>Table 6:</strong> {selected.result.tableAnalysis.table6}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Inconsistencies */}
            {selected.result.inconsistencies.length > 0 && (
              <section className="bg-red-50 p-6 rounded-3xl border border-red-100">
                <h2 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i> Document Contradictions
                </h2>
                <ul className="space-y-2">
                  {selected.result.inconsistencies.map((inc, i) => (
                    <li key={i} className="flex items-start text-red-800 text-sm">
                      <span className="mr-2 font-bold">•</span>
                      {inc}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Checklist */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 px-1">Checklist Breakdown</h2>
              <div className="grid gap-3">
                {selected.result.checklistFeedback.map((item, i) => (
                  <div key={i} className={`p-4 rounded-2xl border transition-all ${getStatusColor(item.status)}`}>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-sm">{item.section}</h4>
                      <i className={`fas ${item.status === 'compliant' ? 'fa-check-circle' : 'fa-circle-exclamation'} opacity-60`}></i>
                    </div>
                    <p className="text-sm mb-2 opacity-90">{item.observation}</p>
                    {item.recommendation && (
                      <div className="mt-2 pt-2 border-t border-black border-opacity-5">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Action Required</p>
                        <p className="text-xs italic leading-relaxed">{item.recommendation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center">
            <i className="fas fa-circle-xmark text-red-500 text-3xl mb-4"></i>
            <p className="text-red-800 font-bold">Analysis Failed</p>
            <p className="text-red-600 text-sm">{selected.error || 'An unexpected error occurred.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
