'use client';

import React, { useState } from 'react';
import Sidebar from '@/app/ui/dashboard/sidebar';
import StudioPanel from '@/app/ui/dashboard/studio-panel';
import AddSourceModal from '@/app/ui/modal/upload-source-modal';
import TextViewer from '@/app/ui/text-component/text-viewer';
import MainDisplay from '@/app/ui/main-display/main-display';

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setSelectedFile(files[files.length - 1]);
  };

  const handleFileView = (file: File) => {
    setSelectedFile(file);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar
        onAddClick={() => setShowModal(true)}
        uploadedFiles={uploadedFiles}
        onFileView={handleFileView}
        selectedFile={selectedFile}
      />

      {/* Main Content Area */}
      {selectedFile ? (
        <TextViewer file={selectedFile} />
      ) : (
        <MainDisplay onUpload={() => setShowModal(true)} />
      )}

      {/* Right Studio Panel */}
      <StudioPanel />

      {/* Upload Source Modal */}
      {showModal && (
        <AddSourceModal
          onClose={() => setShowModal(false)}
          handleFileUpload={handleFileUpload}
        />
      )}
    </div>
  );
}
