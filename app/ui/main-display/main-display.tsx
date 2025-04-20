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
  focusMode?: boolean;
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
  focusMode = false,
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
    <div className={`flex-grow flex flex-col ${focusMode ? 'max-w-4xl mx-auto' : ''}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-xl">Learning Session</h2>
        {/* You can show a "Focus Mode Active" badge here when in focus mode */}
        {focusMode && (
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Focus Mode Active
          </span>
        )}
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {/* Content area */}
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading content...</p>
          </div>
        ) : contentData ? (
          // Render your content here based on contentData
          <div className="h-full">
            {renderContent()}
          </div>
        ) : (
          // Empty state when no content
          <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-xl font-semibold mb-2">Ready to get focused?</h3>
            <p className="text-gray-600 mb-4 text-center">
              Upload your learning materials to start a personalized learning experience
            </p>
            <button
              onClick={onUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload Materials
            </button>
          </div>
        )}
      </div>
      
      {/* When in focus mode, show a small exit button at the bottom */}
      {focusMode && (
        <div className="text-center p-4 text-sm text-gray-500">
          Press ESC or click the button in the top-right to exit focus mode
        </div>
      )}

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
              <span className="mr-2">🗺️</span> Mini Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
