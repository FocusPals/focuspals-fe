import React from 'react';
import VideoStream from './video-stream';
import AttentionChart from './attention-chart';
import AttentionLevelTracker from './attention-level-display';

export interface StudioPanelProps {
  onAttentionChange?: (attentionData: {
    attentionLevel: number;
    shouldSwitchContent: boolean;
  }) => void;
}

export default function StudioPanel({ onAttentionChange }: StudioPanelProps) {
  return (
    <div className="w-[320px] bg-white border-l flex-shrink-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Studio Panel</h2>
        <div className="space-y-4">
          <AttentionLevelTracker onAttentionChange={onAttentionChange} />
          <AttentionChart />
          <VideoStream />
        </div>
      </div>
    </div>
  );
}
