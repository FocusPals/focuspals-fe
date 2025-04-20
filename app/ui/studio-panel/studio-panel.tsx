import React, { useState, useEffect } from 'react';
import VideoStream from './video-stream';
import AttentionChart from './attention-chart';
import AttentionLevelTracker from './attention-level-display';
import GamificationPanel from '../gamification/gamification-panel';
import SessionTimer from './session-timer';
import { Activity, Trophy, ChevronRight } from 'lucide-react';

export interface StudioPanelProps {
  onAttentionChange?: (attentionData: {
    attentionLevel: number;
    shouldSwitchContent: boolean;
  }) => void;
  isContentLoaded?: boolean;
  currentContentType?: string;
  className?: string;
}

export default function StudioPanel({onAttentionChange,
  isContentLoaded,
  currentContentType,
  className = '',
}: StudioPanelProps) {
  const [activeTab, setActiveTab] = useState('focus'); // 'focus' or 'gamification'
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse when className contains 'collapsed'
  useEffect(() => {
    if (className.includes('collapsed')) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [className]);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-96'} bg-white shadow-md overflow-y-auto flex flex-col h-full transition-all duration-300 ${className}`}>
      <div className={`${isCollapsed ? 'p-3 justify-center' : 'p-6'} border-b border-gray-100 flex items-center`}>
        {!isCollapsed && <h2 className="font-bold text-2xl">Studio</h2>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`${isCollapsed ? 'mx-auto' : 'ml-auto'} p-2 rounded-full hover:bg-gray-100`}
        >
          <ChevronRight className={`h-5 w-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Session Timer - Always visible at the top */}
      <div className={`${isCollapsed ? 'px-2 pt-4 text-center' : 'px-6 pt-6'}`}>
        {!isCollapsed && <SessionTimer />}
        {isCollapsed && (
          <button 
            className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto"
            title="Timer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Tabs */}
      {!isCollapsed && (
        <div className="flex border-b border-gray-200 px-2 mt-4">
          <button
            className={`flex-1 py-4 px-2 font-medium text-sm flex items-center justify-center transition-all ${
              activeTab === 'focus' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('focus')}
          >
            <Activity className={`mr-2 h-4 w-4 ${activeTab === 'focus' ? 'text-blue-600' : 'text-gray-500'}`} />
            Focus Metrics
          </button>
          <button
            className={`flex-1 py-4 px-2 font-medium text-sm flex items-center justify-center transition-all ${
              activeTab === 'gamification' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('gamification')}
          >
            <Trophy className={`mr-2 h-4 w-4 ${activeTab === 'gamification' ? 'text-blue-600' : 'text-gray-500'}`} />
            Achievements
          </button>
        </div>
      )}
      
      {isCollapsed && (
        <div className="flex flex-col items-center mt-4 space-y-6">
          <button
            className={`p-3 rounded-full ${activeTab === 'focus' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('focus')}
          >
            <Activity className="h-6 w-6" />
          </button>
          <button
            className={`p-3 rounded-full ${activeTab === 'gamification' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('gamification')}
          >
            <Trophy className="h-6 w-6" />
          </button>
        </div>
      )}
      
      {/* Tab content */}
      {!isCollapsed && (
        <div className="flex-grow overflow-y-auto p-6">
          {activeTab === 'focus' && (
            <div className="flex flex-col h-full space-y-6">
              <AttentionLevelTracker />
              <div className="mt-6">
                <VideoStream />
              </div>
              <AttentionChart />
            </div>
          )}
          
          {activeTab === 'gamification' && (
            <GamificationPanel />
          )}
        </div>
      )}
    </div>
  );
}
