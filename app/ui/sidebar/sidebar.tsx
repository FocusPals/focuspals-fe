'use client';

import { FileText, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onAddClick?: () => void;
  uploadedFiles?: File[];
  onFileView?: (file: File) => void;
  selectedFile?: File;
  className?: string;
}

export default function Sidebar({
  onAddClick,
  uploadedFiles = [],
  onFileView,
  selectedFile,
  className = ''
}: SidebarProps) {
  const handleViewFile = (file: File) => {
    if (onFileView) {
      onFileView(file);
    }
  };

  return (
    <div className={`w-72 bg-white shadow-md overflow-y-auto ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold mb-4">Sources</h1>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-xl font-medium text-base"
            onClick={onAddClick}
          >
            + Add
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 border-gray-200 bg-white hover:bg-gray-50 rounded-xl font-medium text-base"
          >
            Discover
          </Button>
        </div>
      </div>

      {uploadedFiles.length > 0 ? (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Upload Log</h2>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => {
              const isTextFile =
                file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.pdf');
              const isSelected = selectedFile === file;

              return (
                <div
                  key={index}
                  onClick={() => handleViewFile(file)}
                  className={`p-4 rounded-lg transition-all duration-200 flex items-center cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center flex-1 overflow-hidden">
                    <div className={`flex items-center justify-center w-9 h-9 mr-3 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-white text-blue-500'}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {isTextFile && onFileView && (
                    <div className="ml-2">
                      {isSelected ? (
                        <Eye className="h-4 w-4 text-blue-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400 text-sm flex-1">
          <p className="text-base font-medium text-gray-500">Saved sources will appear here</p>
          <p className="mt-2">
            Add PDFs, websites, text, videos, or audio files
          </p>
        </div>
      )}
    </div>
  );
}
