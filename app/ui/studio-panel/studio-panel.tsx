import React from 'react';
import VideoStream from './video-stream';
import AttentionChart from './attention-chart';
import AttentionLevelTracker from './attention-level-display';

export interface StudioPanelProps {
  focusScore?: number;
}

export default function StudioPanel(props: StudioPanelProps) {
  return (
    <div className="w-1/4 border-l bg-white px-4 py-8 flex flex-col justify-between">
      <AttentionLevelTracker />
      <AttentionChart />
      <VideoStream />
    </div>
  );
}
