import React, { useState } from 'react';
import UserLevel from './user-level';
import DailyChallenges from './daily-challenges';

export default function GamificationPanel() {
  const [level, setLevel] = useState(5);
  const [currentXP, setCurrentXP] = useState(340);
  const xpToNextLevel = 500;
  
  const [challenges, setChallenges] = useState([
    {
      id: '1',
      title: 'Focus Master',
      description: 'Maintain 80%+ focus for 30 minutes straight',
      xpReward: 50,
      progress: 75,
      completed: false,
    },
    {
      id: '2',
      title: 'Study Marathon',
      description: 'Complete 2 hours of total study time today',
      xpReward: 100,
      progress: 45,
      completed: false,
    },
    {
      id: '3',
      title: 'Distraction Dodger',
      description: 'Recover from 5 focus drops in one session',
      xpReward: 30,
      progress: 100,
      completed: true,
    },
  ]);

  const handleCompleteChallenge = (id: string) => {
    setChallenges(challenges.map(challenge => 
      challenge.id === id 
        ? { ...challenge, completed: true } 
        : challenge
    ));
    
    // Find the challenge to award XP
    const challenge = challenges.find(c => c.id === id);
    if (challenge && !challenge.completed) {
      const newXP = currentXP + challenge.xpReward;
      setCurrentXP(newXP);
      
      // Level up if enough XP
      if (newXP >= xpToNextLevel) {
        setLevel(level + 1);
        setCurrentXP(newXP - xpToNextLevel);
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Progress</h2>
      <UserLevel 
        level={level} 
        currentXP={currentXP} 
        xpToNextLevel={xpToNextLevel} 
      />
      <DailyChallenges 
        challenges={challenges}
        onCompleteChallenge={handleCompleteChallenge}
      />
    </div>
  );
} 