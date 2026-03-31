
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { analyzeSingleForm } from './services/geminiService';
import { FileAnalysis, Attachment } from './types';

declare const mammoth: any;

const App: React.FC = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [batchResults, setBatchResults] = useState<FileAnalysis[]>([]);
  const [currentProgress, setCurrentProgress] = useState<{current: number, total: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File): Promise<Attachment> => {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    let extractedText = '';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Use convertToHtml to preserve table structure better for the text fallback
        const result = await mammoth.convertToHtml({ arrayBuffer });
        extractedText = result.value;
      } catch (e) {
        console.error("Mammoth failed to parse docx", e);
      }
    }

    return {
      file,
      preview: URL.createObjectURL(file),
      base64,
      mimeType: file.type || (file.name.endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/octet-stream'),
      extractedText
    };
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const newAttachments: Attachment[] = [];
    const filesArray = Array.from(files).slice(0, 10);
    
    for (const file of filesArray) {
      try {
        const processed = await processFile(file);
        newAttachments.push(processed);
      } catch (err) {
        console.error("Error processing file:", file.name, err);
      }
    }
    
    setAttachments(prev => [...prev, ...newAttachments].slice(0, 10));
  }, []);

  const handleSubmit = async () => {
    if (attachments.length === 0) {
      setError("Please upload at least one ethics form (PDF or DOCX).");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    // Initialize batch results
    const initialAnalyses: FileAnalysis[] = attachments.map(att => ({
      fileName: att.file.name,
      attachment: att,
      result: null,
      status: 'pending'
    }));
    
    setBatchResults(initialAnalyses);
    setCurrentProgress({ current: 0, total: attachments.length });

    // Run all analyses in parallel
    const analysisPromises = attachments.map(async (attachment, index) => {
      setBatchResults(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: 'analyzing' };
        return updated;
      });

      try {
        const result = await analyzeSingleForm(attachment);
        setBatchResults(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], result, status: 'completed' };
          return updated;
        });
        setCurrentProgress(prev => prev ? { ...prev, current: prev.current + 1 } : null);
      } catch (err: any) {
        setBatchResults(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], status: 'error', error: err.message || "Analysis failed." };
          return updated;
        });
        setCurrentProgress(prev => prev ? { ...prev, current: prev.current + 1 } : null);
        console.error(err);
      }
    });

    await Promise.all(analysisPromises);

    setIsAnalyzing(false);
    setCurrentProgress(null);
  };

  const reset = () => {
    setBatchResults([]);
    setAttachments([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <i className="fas fa-shield-halved text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">EthicsGuard <span className="text-slate-400 font-normal">Colleague Edition</span></h1>
          </div>
          {batchResults.length > 0 && !isAnalyzing && (
            <button 
              onClick={reset}
              className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Start New Batch
            </button>
          )}
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-8">
        {batchResults.length === 0 ? (
          <div className="grid lg:grid-cols-12 gap-12 pt-8">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-5xl font-extrabold text-slate-900 leading-tight">
                Batch Review <span className="text-indigo-600">Ethics Forms.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Upload up to 10 ethics submissions. Each document is reviewed independently against MLA guidelines.
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-circle-info text-amber-400"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-800 leading-snug">
                      <strong>Important:</strong> This is NOT a formal agreement for ethical approval. That decision rests with MLA's Ethics Committee. However, it will guide you regarding areas where they may question your application, so you can strengthen your request.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <i className="fas fa-ship mr-2 text-indigo-500"></i> Maritime Context
                </h3>
                <p className="text-xs text-slate-500 italic">
                  Note: Students working on boats/ships for their jobs do not require separate workplace risk assessments for being on board.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-indigo-100 border border-slate-100">
                <div className="space-y-8">
                  <FileUpload onFilesSelected={handleFiles} files={attachments} />

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                      <i className="fas fa-circle-exclamation"></i>
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleSubmit}
                    disabled={isAnalyzing || attachments.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 text-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Analyzing Batch...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-wand-magic-sparkles"></i>
                        Review {attachments.length} Document{attachments.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentProgress && (
              <div className="bg-indigo-600 p-4 rounded-2xl text-white flex items-center justify-between shadow-lg mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-400 p-2 rounded-lg">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                  <div>
                    <p className="font-bold">Analyzing Batch...</p>
                    <p className="text-xs text-indigo-100">{currentProgress.current} of {currentProgress.total} completed</p>
                  </div>
                </div>
                <div className="w-48 bg-indigo-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-500" 
                    style={{ width: `${(currentProgress.current / currentProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            <AnalysisView analyses={batchResults} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <p className="text-slate-400 text-xs">
            © 2024 EthicsGuard Colleague Batch Reviewer. Supporting MLA Research Ethics Standards.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
