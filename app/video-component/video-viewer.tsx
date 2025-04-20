'use client';

import { useRef } from 'react';

export default function VideoViewer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8 px-4">
      <div className="bg-gray-900 p-4 rounded-xl shadow-2xl overflow-hidden">
        <video
          ref={videoRef}
          className="w-full max-h-[90vh] object-contain rounded-md"
          controls
          autoPlay
          loop
        >
          <source src="/brainRot.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
