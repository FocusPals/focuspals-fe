import React from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  completed: boolean;
}

interface DailyChallengesProps {
  challenges: Challenge[];
  onCompleteChallenge: (id: string) => void;
}

export default function DailyChallenges({ challenges, onCompleteChallenge }: DailyChallengesProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-bold mb-3 flex items-center">
        <span className="mr-2">🎯</span> Daily Challenges
      </h3>
      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-800">{challenge.title}</h4>
              <span className="text-emerald-500 font-medium">+{challenge.xpReward} XP</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
            
            <div className="flex items-center mt-2">
              <div className="flex-grow">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${challenge.completed ? 'bg-emerald-500' : 'bg-blue-500'} h-2 rounded-full`} 
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-2 text-xs text-gray-500">{challenge.progress}%</span>
              
              {challenge.completed ? (
                <span className="ml-3 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                  Completed
                </span>
              ) : (
                <button
                  className="ml-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full hover:bg-blue-200"
                  onClick={() => onCompleteChallenge(challenge.id)}
                >
                  Claim
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 