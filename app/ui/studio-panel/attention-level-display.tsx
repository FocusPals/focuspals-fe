import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { BACKEND_API_URL } from '@/app/lib/constants';
import io from 'socket.io-client';

// Custom progress bar component with controlled animations and colors
interface CustomProgressProps {
  value: number;
  max: number;
  height?: string;
  className?: string;
}

function CustomProgress({
  value,
  max,
  height = '0.75rem',
  className = '',
}: CustomProgressProps) {
  const percentage = (value / max) * 100;

  // Determine color based on attention level
  const getProgressColor = (level: number) => {
    if (level < 30) return '#ef4444'; // red-500
    if (level < 70) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  return (
    <div
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${percentage}%`,
          backgroundColor: getProgressColor(value),
        }}
      />
    </div>
  );
}

export default function AttentionLevelTracker() {
  const [attentionLevel, setAttentionLevel] = useState(75);
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let connectionTimeout: NodeJS.Timeout;

    // Delay socket connection to ensure component is fully mounted
    connectionTimeout = setTimeout(() => {
      // Create WebSocket connection with reconnection options
      socketRef.current = io(BACKEND_API_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
      });

      socketRef.current.on('connect', () => {
        console.log('Attention tracker socket connected');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Attention tracker socket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (err: any) => {
        console.error(
          'Attention tracker socket connection error:',
          err.message
        );
      });

      // Listen for focus score updates
      socketRef.current.on(
        'focusScoreUpdate',
        (data: { timestamp: number; focusScore: number }) => {
          // console.log('Raw focus score update data:', data);
          if (data.focusScore !== undefined) {
            setAttentionLevel(Math.round(data.focusScore));
          } else {
            console.error('Invalid focus score data received:', data);
          }
        }
      );
    }, 1000);

    return () => {
      // Clean up timeout and socket when component unmounts
      if (connectionTimeout) clearTimeout(connectionTimeout);
      if (socketRef.current) {
        socketRef.current.off('focus_score_update');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Get label based on attention level
  const getAttentionLabel = (level: number) => {
    if (level < 30) return 'Take a break!';
    if (level < 70) return 'We can do better';
    if (level < 90) return 'LOCKED IN';
    return 'LFG';
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4" /> Current Attention Level
          {!isConnected && (
            <span className="text-xs text-red-500">(Disconnected)</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{attentionLevel}%</div>
            <div
              className="text-sm font-medium"
              style={{
                color:
                  attentionLevel < 30
                    ? '#ef4444'
                    : attentionLevel < 70
                    ? '#eab308'
                    : '#22c55e',
              }}
            >
              {getAttentionLabel(attentionLevel)}
            </div>
          </div>

          <CustomProgress value={attentionLevel} max={100} height="0.75rem" />

          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
