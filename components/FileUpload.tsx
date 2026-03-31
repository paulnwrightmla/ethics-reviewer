
import React, { useState } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  files: { preview: string, file: File }[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, files }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('pdf')) return 'fa-file-pdf text-red-500';
    if (mime.includes('word') || mime.includes('officedocument')) return 'fa-file-word text-blue-500';
    return 'fa-file-lines text-slate-400';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Attach Ethics Forms (PDF or DOCX preferred)
      </label>
      <div 
        className={`flex items-center justify-center w-full transition-all duration-200 ${isDragging ? 'scale-[1.02]' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <i className={`fas fa-file-export text-3xl mb-3 ${isDragging ? 'text-indigo-600' : 'text-indigo-400'}`}></i>
            <p className="mb-2 text-sm text-slate-500 font-semibold">
              {isDragging ? 'Drop documents now' : 'Click to upload or drag documents'}
            </p>
            <p className="text-xs text-slate-400">PDF, DOCX (Max 10 files)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            multiple 
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            onChange={(e) => e.target.files && onFilesSelected(e.target.files)} 
          />
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {files.map((item, idx) => (
            <div key={idx} className="relative group p-2 border border-slate-200 rounded-lg bg-white shadow-sm">
              <div className="w-full h-12 flex items-center justify-center bg-slate-50 rounded mb-1">
                 <i className={`fas ${getFileIcon(item.file.type)} text-xl`}></i>
              </div>
              <p className="text-[10px] text-slate-500 truncate font-medium text-center">{item.file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
