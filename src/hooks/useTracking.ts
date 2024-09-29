import { useState, useCallback, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as poseDetection from '@tensorflow-models/pose-detection';

type TrackingType = 'image' | 'face' | 'pose';

interface TrackingResult {
  type: TrackingType;
  data: any;
}

export function useTracking(type: TrackingType) {
  const [isTracking, setIsTracking] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modelRef = useRef<any>(null);

  const startTracking = useCallback(async () => {
    if (!videoRef.current) return;

    setIsTracking(true);

    try {
      await tf.ready();

      switch (type) {
        case 'face':
          modelRef.current = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
          );
          break;
        case 'pose':
          modelRef.current = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet
          );
          break;
        case 'image':
          // For image tracking, we'll use a placeholder model
          // In a real application, you'd use a proper image recognition model
          modelRef.current = {
            detect: async (image: HTMLImageElement) => {
              // Placeholder detection logic
              return [{ bbox: [0, 0, image.width, image.height] }];
            }
          };
          break;
      }

      requestAnimationFrame(detect);
    } catch (error) {
      console.error('Error starting tracking:', error);
      setIsTracking(false);
    }
  }, [type]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setResult(null);
  }, []);

  const detect = useCallback(async () => {
    if (!isTracking || !videoRef.current || !modelRef.current) return;

    try {
      let detectionResult;

      switch (type) {
        case 'face':
          detectionResult = await modelRef.current.estimateFaces(videoRef.current);
          break;
        case 'pose':
          detectionResult = await modelRef.current.estimatePoses(videoRef.current);
          break;
        case 'image':
          detectionResult = await modelRef.current.detect(videoRef.current);
          break;
      }

      setResult({ type, data: detectionResult });
    } catch (error) {
      console.error('Error during detection:', error);
    }

    requestAnimationFrame(detect);
  }, [isTracking, type]);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    isTracking,
    result,
    videoRef,
    startTracking,
    stopTracking,
  };
}