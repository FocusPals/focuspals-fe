'use client';

import React, { useState, useEffect } from 'react';
import TextContent from './content/text-content';
import DefaultDisplay from './default-display';
import ReactEmbedViewer from '../react-embed-component/react-embed-viewer';
import FlipCardContent from './content/flip-card-content';
import QuizContent from './content/quiz-content';
import VideoContent from './content/video-content';
import {
  SAMPLE_FLIP_CARD_DATA,
  SAMPLE_QUIZ_DATA,
  SAMPLE_TEXT_DATA,
} from '@/app/lib/sample-data';
import { Spinner } from '../dashboard/redirect';

interface MainDisplayProps {
  isLoading?: boolean;
  contentData?: {
    focusScore: number;
    type: string;
    data: any;
  } | null;
  onUpload?: () => void;
}

type ContentType =
  | 'default'
  | 'text'
  | 'flipcard'
  | 'quiz'
  | 'react'
  | 'tiktok';

export default function MainDisplay({
  isLoading = false,
  contentData = null,
  onUpload,
}: MainDisplayProps) {
  const [demoMode, setDemoMode] = useState(false);
  const [selectedContentType, setSelectedContentType] =
    useState<ContentType>('default');

  // Update selected content type when contentData changes
  useEffect(() => {
    if (contentData && contentData.type) {
      setSelectedContentType(contentData.type as ContentType);
    }
  }, [contentData]);

  const handleContentTypeChange = (type: ContentType) => {
    setSelectedContentType(type);
  };

  // Render the appropriate component based on content type
  const renderContent = () => {
    // If in demo mode, use the sample data based on selected type
    if (demoMode) {
      switch (selectedContentType) {
        case 'text':
          return <TextContent data={SAMPLE_TEXT_DATA.data} />;
        case 'flipcard':
          return <FlipCardContent data={SAMPLE_FLIP_CARD_DATA.data} />;
        case 'tiktok':
          return <VideoContent />;
        case 'quiz':
          return <QuizContent data={SAMPLE_QUIZ_DATA.data} />;
        case 'react':
          return (
            <ReactEmbedViewer jsonPath="./app/ui/react-embed-component/SAMPLE_VISUALIZER_DATA.json" />
          );
        default:
          return <DefaultDisplay onUpload={onUpload} />;
      }
    }

    // If not demo mode, use the contentData provided by the API
    if (!contentData) {
      return <DefaultDisplay onUpload={onUpload} />;
    }

    function parseTextData(data: any) {
      let textData;
      if (data.data && typeof data.data === 'string') {
        try {
          textData = JSON.parse(data.data);
        } catch (e) {
          // If it's not valid JSON, treat it as plain text content
          textData = { content: data.data };
        }
      } else {
        // Already an object or null/undefined
        textData = data.data || SAMPLE_TEXT_DATA.data;
      }

      return textData;
    }

    switch (contentData.type) {
      case 'text':
        const textData = parseTextData(contentData.data);
        return <TextContent data={textData} />;
      case 'flipcard':
        return (
          <FlipCardContent
            data={contentData.data || SAMPLE_FLIP_CARD_DATA.data}
          />
        );
      case 'tiktok':
        return <VideoContent />;
      case 'quiz':
        return <QuizContent data={contentData.data || SAMPLE_QUIZ_DATA.data} />;
      case 'react':
        return (
          <ReactEmbedViewer jsonPath="./app/ui/react-embed-component/SAMPLE_VISUALIZER_DATA.json" />
        );
      default:
        return <TextContent data={{ content: 'Unsupported content type' }} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-white p-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto border rounded-lg p-8 bg-blue-50 border-blue-200 flex flex-col items-center justify-center">
          <Spinner />
          <h1 className="text-2xl font-bold text-gray-800">
            Processing your learning material
          </h1>
          <p className="text-gray-600 mb-4">Generating content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Learning Session</h1>

        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <span className="mr-2 text-sm text-gray-700">Demo Mode</span>
            <div
              className={`relative inline-block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                demoMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <input
                type="checkbox"
                className="opacity-0 absolute"
                checked={demoMode}
                onChange={() => setDemoMode(!demoMode)}
              />
              <div
                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  demoMode ? 'transform translate-x-4' : ''
                }`}
              ></div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-blue-50 border-blue-500 flex items-center justify-center">
        {renderContent()}
      </div>

      {/* DEMO MODE CONTROL BAR - MOVED TO BOTTOM */}
      <div className="mt-4 flex flex-col items-center">
        {/* Pills Button Selection */}
        {demoMode && (
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <button
              onClick={() => handleContentTypeChange('text')}
              className={`flex items-center px-4 py-2 rounded-full border transition ${
                selectedContentType === 'text'
                  ? 'bg-blue-100 border-blue-600 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <span className="mr-2">📄</span> Text
            </button>

            <button
              onClick={() => handleContentTypeChange('flipcard')}
              className={`flex items-center px-4 py-2 rounded-full border transition ${
                selectedContentType === 'flipcard'
                  ? 'bg-blue-100 border-blue-600 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <span className="mr-2">🗂️</span> Flip Card
            </button>

            <button
              onClick={() => handleContentTypeChange('quiz')}
              className={`flex items-center px-4 py-2 rounded-full border transition ${
                selectedContentType === 'quiz'
                  ? 'bg-blue-100 border-blue-600 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <span className="mr-2">❓</span> Quiz
            </button>

            <button
              onClick={() => handleContentTypeChange('tiktok')}
              className={`flex items-center px-4 py-2 rounded-full border transition ${
                selectedContentType === 'tiktok'
                  ? 'bg-blue-100 border-blue-600 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <span className="mr-2">📷</span> Video
            </button>

            <button
              onClick={() => handleContentTypeChange('react')}
              className={`flex items-center px-4 py-2 rounded-full border transition ${
                selectedContentType === 'react'
                  ? 'bg-blue-100 border-blue-600 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <span className="mr-2">🗺️</span> Mini Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
