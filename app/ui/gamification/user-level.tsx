import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface UserLevelProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
}

export default function UserLevel({ level, currentXP, xpToNextLevel }: UserLevelProps) {
  const progress = (currentXP / xpToNextLevel) * 100;
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-md mb-4">
      <div className="flex items-center">
        <div className="w-16 h-16 mr-4">
          <CircularProgressbar
            value={progress}
            text={`${level}`}
            styles={buildStyles({
              textSize: '32px',
              pathColor: '#10B981',
              textColor: '#111827',
              trailColor: '#F3F4F6',
            })}
          />
        </div>
        <div>
          <h3 className="text-lg font-bold">Level {level}</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {currentXP} / {xpToNextLevel} XP to level {level + 1}
          </p>
        </div>
      </div>
    </div>
  );
} 