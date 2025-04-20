'use client';

import { BACKEND_API_URL } from '@/app/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RefreshCw, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

declare class ImageCapture {
  constructor(videoTrack: MediaStreamTrack);
  grabFrame(): Promise<ImageBitmap>;
  takePhoto(): Promise<Blob>;
}

interface FocusData {
  frame: string; // base64 image
  timestamp: number;
  focusStatus: string;
  movement: number;
  eyesDetected: boolean;
  faceDetected: boolean;
}

const VideoStream = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [focusData, setFocusData] = useState<FocusData | null>(null);
  const [displayMode, setDisplayMode] = useState<'processed' | 'raw'>(
    'processed'
  );

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
        transports: ['websocket', 'polling'], // Try WebSocket first, then fallback to polling
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (err: any) => {
        console.error('Socket connection error:', err.message);
      });

      // Listen for uploadInfo events from backend
      socketRef.current.on(
        'updateInfo',
        (data: FocusData & { processedImage: string }) => {
          // Update focus data state
          setFocusData(data);

          // Display the processed image on canvas
          if (data.frame && displayMode === 'processed') {
            displayProcessedImage(data.frame);
          }
        }
      );

      // Start camera after socket is initialized
      startCamera();
    }, 1000); // 1 second delay before attempting connection

    return () => {
      // Clean up timeout, socket, and camera when component unmounts
      if (connectionTimeout) clearTimeout(connectionTimeout);
      stopCamera();
      if (socketRef.current) {
        socketRef.current.off('updateInfo');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.disconnect();
      }
    };
  }, [displayMode]);

  const displayProcessedImage = (base64Image: string) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create a new image object
    const img = new Image();

    // Set up the onload handler
    img.onload = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

      // Draw the new image
      ctx.drawImage(
        img,
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
    };

    img.src = `data:image/jpeg;base64,${base64Image}`;
  };

  const startCamera = () => {
    // Request access to the webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }

        // Set canvas dimensions to match video
        if (canvasRef.current && videoRef.current) {
          setTimeout(() => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          }, 200); // Short delay to ensure video dimensions are available
        }

        // Capture video frames and send them to the server
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);

        const captureFrame = () => {
          if (!socketRef.current || !socketRef.current.connected) {
            console.log('Socket not connected, skipping frame capture');
            return;
          }

          imageCapture
            .grabFrame()
            .then(imageBitmap => {
              // Create a canvas to extract image data from the ImageBitmap
              const canvas = document.createElement('canvas');
              canvas.width = imageBitmap.width;
              canvas.height = imageBitmap.height;

              // Draw the ImageBitmap on the canvas
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                console.error('Failed to get canvas context');
                return;
              }
              ctx.drawImage(imageBitmap, 0, 0);

              try {
                // Convert canvas to a base64 string (remove the "data:image/png;base64," prefix if needed)
                const base64Image = canvas
                  .toDataURL('image/jpeg', 0.7)
                  .split(',')[1];

                // Send the base64-encoded image to the server
                if (socketRef.current && socketRef.current.connected) {
                  socketRef.current.emit('sendVideoFrame', base64Image);
                  setFrameCount(prev => prev + 1);
                }
              } catch (e) {
                console.error('Error processing or sending frame:', e);
              }
            })
            .catch(err => {
              console.error('Error capturing frame:', err);
              // Don't throw the error further to prevent the promise from being uncaught
            });
        };

        // Capture and send video frames every 100ms
        const frameInterval = setInterval(captureFrame, 100);

        // Store the interval and stream in refs for cleanup
        if (videoRef.current) {
          videoRef.current.dataset.frameInterval = frameInterval.toString();
          videoRef.current.dataset.streamId = stream.id;
        }

        return () => {
          clearInterval(frameInterval);
          videoTrack.stop();
        };
      })
      .catch(error => {
        console.error('Error accessing webcam:', error);
        setIsCameraActive(false);
      });
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const frameInterval = parseInt(
        videoRef.current.dataset.frameInterval || '0'
      );
      if (frameInterval) clearInterval(frameInterval);

      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const toggleDisplayMode = () => {
    setDisplayMode(prev => (prev === 'raw' ? 'processed' : 'raw'));
  };

  return (
    <div className="relative aspect-video bg-gray-900 flex items-center justify-center rounded-lg overflow-hidden shadow-sm">
      {/* Raw video from camera - only shown in raw mode */}
      <video
        ref={videoRef}
        autoPlay
        muted
        className={`w-full h-full object-cover rounded-lg ${
          displayMode === 'processed' ? 'hidden' : ''
        }`}
      />

      {/* Canvas to display processed images - only shown in processed mode */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover rounded-lg ${
          displayMode === 'raw' ? 'hidden' : ''
        }`}
      />

      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <Badge
          variant={isConnected ? 'default' : 'destructive'}
          className="animate-pulse"
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>

        {isCameraActive && (
          <Badge
            variant="outline"
            className="bg-black/50 text-white border-none"
          >
            <Video
              className="w-3 h-3 mr-1 text-red-500 animate-pulse"
              stroke="white"
            />
            Live
          </Badge>
        )}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
          onClick={toggleCamera}
        >
          {isCameraActive ? (
            <CameraOff size={18} className="text-white" stroke="white" />
          ) : (
            <Camera size={18} className="text-white" stroke="white" />
          )}
        </Button>

        {isCameraActive && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
              onClick={() => startCamera()}
            >
              <RefreshCw size={18} className="text-white" stroke="white" />
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white"
              onClick={toggleDisplayMode}
            >
              {displayMode === 'processed' ? 'Raw Feed' : 'Processed Feed'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoStream;
