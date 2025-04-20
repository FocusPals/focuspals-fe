import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Coffee } from 'lucide-react';
import {
  BACKEND_API_URL,
  FOCUS_HISTORY_SIZE,
  LOW_FOCUS_THRESHOLD,
  SUGGESTION_COOLDOWN,
} from '@/app/lib/constants';
import io from 'socket.io-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

interface AttentionLevelTrackerProps {
  onAttentionChange?: (attentionData: {
    attentionLevel: number;
    shouldSwitchContent: boolean;
    suggestBreak?: boolean;
    suggestedContentType?: string;
  }) => void;
  isContentLoaded?: boolean;
  currentContentType?: string; // New prop to know the current content type
}

export default function AttentionLevelTracker({
  onAttentionChange,
  isContentLoaded = false,
  currentContentType = '',
}: AttentionLevelTrackerProps) {
  const [attentionLevel, setAttentionLevel] = useState(75);
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [focusScoreHistory, setFocusScoreHistory] = useState<number[]>([]);
  const [averageFocusScore, setAverageFocusScore] = useState<number>(75);
  const [showContentSuggestionModal, setShowContentSuggestionModal] =
    useState(false);
  const [suggestedContentType, setSuggestedContentType] =
    useState<string>('text');
  const lastSuggestionTimeRef = useRef<number | null>(null);
  const consecutiveSameRangeRef = useRef<number>(0);
  const previousScoreRangeRef = useRef<string>('');
  const [suggestBreak, setSuggestBreak] = useState(false);

  // Get status indicator color based on connection and content state
  const getStatusIndicator = () => {
    if (!isConnected) {
      return {
        color: '#ef4444', // Red for disconnected
      };
    } else if (!isContentLoaded) {
      return {
        color: '#eab308', // Yellow for waiting for content
      };
    } else {
      return {
        color: '#22c55e', // Green for fully operational
      };
    }
  };

  const statusIndicator = getStatusIndicator();

  // Socket connection setup
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
          if (data.focusScore !== undefined) {
            const roundedScore = Math.round(data.focusScore);

            // Update current attention level
            setAttentionLevel(roundedScore);

            // Only update focus history if we have content loaded
            if (isContentLoaded) {
              setFocusScoreHistory(prevHistory => {
                const newHistory = [...prevHistory, roundedScore];
                // Keep only the most recent FOCUS_HISTORY_SIZE scores
                if (newHistory.length > FOCUS_HISTORY_SIZE) {
                  return newHistory.slice(-FOCUS_HISTORY_SIZE);
                }
                return newHistory;
              });
            }
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
        socketRef.current.off('focusScoreUpdate');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.disconnect();
      }
    };
  }, [isContentLoaded]); // Add isContentLoaded as a dependency

  // Determine content type based on attention level
  const getContentTypeForAttentionLevel = (level: number): string => {
    if (level > 80) return 'text';
    if (level > 60) return 'flipcard';
    if (level > 40) return 'tiktok';
    if (level > 20) return 'quiz';
    return 'react';
  };

  // Get the score range identifier for tracking consecutive same range suggestions
  const getScoreRangeIdentifier = (level: number): string => {
    if (level > 80) return '80+';
    if (level > 60) return '60-80';
    if (level > 40) return '40-60';
    if (level > 20) return '20-40';
    return '0-20';
  };

  // Calculate average focus score whenever history changes
  useEffect(() => {
    // Always pass the current attention level even if we don't have content
    if (onAttentionChange) {
      onAttentionChange({
        attentionLevel: attentionLevel,
        shouldSwitchContent: false,
      });
    }

    // Skip suggestion logic if content isn't loaded or history is empty
    if (!isContentLoaded || focusScoreHistory.length === 0) return;

    // Calculate average
    const sum = focusScoreHistory.reduce((acc, score) => acc + score, 0);
    const avg = Math.round(sum / focusScoreHistory.length);
    setAverageFocusScore(avg);

    // Get the score range for the current average
    const currentScoreRange = getScoreRangeIdentifier(avg);

    // Check if we're in the same score range as before
    if (currentScoreRange === previousScoreRangeRef.current) {
      consecutiveSameRangeRef.current += 1;
    } else {
      consecutiveSameRangeRef.current = 0;
      previousScoreRangeRef.current = currentScoreRange;
    }

    // Determine if we should suggest a break instead
    // If we've been in the same score range for 3 consecutive checks
    const shouldSuggestBreak = consecutiveSameRangeRef.current >= 3;
    setSuggestBreak(shouldSuggestBreak);

    // Determine content types to avoid and suggest
    const recommendedType = getContentTypeForAttentionLevel(avg);
    let newSuggestedType = recommendedType;

    // If the recommended type is the same as current, try to find an alternative
    if (recommendedType === currentContentType && !shouldSuggestBreak) {
      // Try adjacent content types based on focus level
      const alternativeTypes = [
        'text',
        'flipcard',
        'tiktok',
        'quiz',
        'react',
      ].filter(type => type !== currentContentType);

      // If available, pick a type that matches better with the current attention level
      if (alternativeTypes.length > 0) {
        // Sort by how close they are to the ideal content type for this attention level
        // This gives preference to content types that are more suitable for the current attention
        const typeRanks = {
          text: 1,
          flipcard: 2,
          tiktok: 3,
          quiz: 4,
          react: 5,
        };

        const currentTypeRank =
          typeRanks[recommendedType as keyof typeof typeRanks];

        // Sort alternatives by how close they are to the ideal content type
        alternativeTypes.sort((a, b) => {
          const rankA = typeRanks[a as keyof typeof typeRanks];
          const rankB = typeRanks[b as keyof typeof typeRanks];
          return (
            Math.abs(rankA - currentTypeRank) -
            Math.abs(rankB - currentTypeRank)
          );
        });

        newSuggestedType = alternativeTypes[0];
      }
    }

    setSuggestedContentType(newSuggestedType);

    // Check if we should suggest content change
    const currentTime = Date.now();
    const isOnCooldown =
      lastSuggestionTimeRef.current &&
      currentTime - lastSuggestionTimeRef.current < SUGGESTION_COOLDOWN;

    // Only suggest if attention is low or we've detected a need for change, and not on cooldown
    if (
      focusScoreHistory.length >= FOCUS_HISTORY_SIZE &&
      (avg < LOW_FOCUS_THRESHOLD || shouldSuggestBreak) &&
      !isOnCooldown &&
      !showContentSuggestionModal &&
      (newSuggestedType !== currentContentType || shouldSuggestBreak)
    ) {
      setShowContentSuggestionModal(true);
    }

    // Pass attention data to parent component with the calculated average
    if (onAttentionChange) {
      onAttentionChange({
        attentionLevel: avg,
        shouldSwitchContent: false, // This will only be true when user confirms
      });
    }
  }, [
    focusScoreHistory,
    showContentSuggestionModal,
    onAttentionChange,
    attentionLevel,
    isContentLoaded,
    currentContentType,
  ]);

  // Handle content change request
  const handleContentChange = () => {
    // Update the last suggestion time
    lastSuggestionTimeRef.current = Date.now();

    // Close modal
    setShowContentSuggestionModal(false);

    // Reset consecutive same range counter when user accepts change
    consecutiveSameRangeRef.current = 0;

    // Only notify parent to switch content if we have content loaded
    if (onAttentionChange && isContentLoaded) {
      onAttentionChange({
        attentionLevel: averageFocusScore,
        shouldSwitchContent: true,
        suggestBreak: suggestBreak,
        suggestedContentType: suggestedContentType,
      });
    }
  };

  // Dismiss suggestion without changing content
  const handleDismissSuggestion = () => {
    lastSuggestionTimeRef.current = Date.now();
    setShowContentSuggestionModal(false);
  };

  // Get label based on attention level
  const getAttentionLabel = (level: number) => {
    if (level < 30) return 'Take a break!';
    if (level < 70) return 'We can do better';
    if (level < 90) return 'LOCKED IN';
    return 'LFG';
  };

  // Get a user-friendly name for content types
  const getContentTypeName = (type: string) => {
    switch (type) {
      case 'text':
        return 'Text Reading';
      case 'flipcard':
        return 'Flip Cards';
      case 'tiktok':
        return 'Video Content';
      case 'quiz':
        return 'Interactive Quiz';
      case 'react':
        return 'Mini Map';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get an emoji for the content type
  const getContentTypeEmoji = (type: string) => {
    switch (type) {
      case 'text':
        return '📄';
      case 'flipcard':
        return '🗂️';
      case 'tiktok':
        return '📷';
      case 'quiz':
        return '❓';
      case 'react':
        return '🗺️';
      default:
        return '📚';
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" /> Current Attention Level
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: statusIndicator.color }}
              ></div>
            </div>
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

      {/* Content Suggestion Modal only shown if content is loaded */}
      {isContentLoaded && (
        <Dialog
          open={showContentSuggestionModal}
          onOpenChange={setShowContentSuggestionModal}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {suggestBreak ? 'Time for a Break?' : 'Attention Dropping'}
              </DialogTitle>
              <DialogDescription>
                Your average attention level is {averageFocusScore}%, which
                suggests{' '}
                {suggestBreak
                  ? 'you might need a short break.'
                  : 'you might be losing focus.'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {suggestBreak ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-2xl">☕</div>
                  <div>
                    <div className="font-medium">
                      Suggested: Take a short 5-minute break
                    </div>
                    <div className="text-sm text-gray-600">
                      Stand up, stretch, or grab a drink. A short break helps
                      refresh your mind.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-lg font-medium">
                      Current format is not holding your attention.
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="text-2xl">
                      {getContentTypeEmoji(suggestedContentType)}
                    </div>
                    <div>
                      <div className="font-medium">
                        Suggested format:{' '}
                        {getContentTypeName(suggestedContentType)}
                      </div>
                      <div className="text-sm text-gray-600">
                        This format might help you maintain focus better
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleDismissSuggestion}>
                Not Now
              </Button>
              <Button onClick={handleContentChange}>
                {suggestBreak ? 'Take Break' : 'Switch Format'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
