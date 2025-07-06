import { Annotation } from './annotations';

interface ExportOptions {
  includeAnnotations: boolean;
  includeAnalysis: boolean;
  format: 'mp4' | 'webm';
  quality: 'high' | 'medium' | 'low';
}

interface ExportProgress {
  status: 'preparing' | 'processing' | 'finalizing' | 'completed' | 'error';
  progress: number;
  message: string;
}

export const exportVideo = async (
  videoId: string,
  options: ExportOptions,
  onProgress: (progress: ExportProgress) => void
): Promise<Blob> => {
  try {
    onProgress({
      status: 'preparing',
      progress: 0,
      message: 'Preparing video for export...',
    });

    // Fetch video and annotations
    const [videoResponse, annotationsResponse] = await Promise.all([
      fetch(`/api/videos/${videoId}`),
      fetch(`/api/videos/${videoId}/annotations`),
    ]);

    if (!videoResponse.ok || !annotationsResponse.ok) {
      throw new Error('Failed to fetch video data');
    }

    const video = await videoResponse.json();
    const annotations: Annotation[] = await annotationsResponse.json();

    onProgress({
      status: 'processing',
      progress: 20,
      message: 'Processing video...',
    });

    // Create a canvas for rendering annotations
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }

    // Create video element for processing
    const videoElement = document.createElement('video');
    videoElement.src = video.url;
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = resolve;
    });

    // Set canvas dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Create MediaRecorder for capturing the processed video
    const stream = canvas.captureStream();
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: `video/${options.format}`,
      videoBitsPerSecond: options.quality === 'high' ? 8000000 : options.quality === 'medium' ? 4000000 : 2000000,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      onProgress({
        status: 'completed',
        progress: 100,
        message: 'Export completed!',
      });
    };

    // Start recording
    mediaRecorder.start();

    // Process video frames
    const duration = videoElement.duration;
    const frameRate = 30;
    const totalFrames = Math.ceil(duration * frameRate);
    let currentFrame = 0;

    const processFrame = async () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      const currentTime = (currentFrame / frameRate);
      videoElement.currentTime = currentTime;

      await new Promise((resolve) => {
        videoElement.onseeked = resolve;
      });

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video frame
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Draw annotations if enabled
      if (options.includeAnnotations) {
        const currentAnnotations = annotations.filter(
          (a) => Math.abs(a.timestamp - currentTime) < 0.5
        );

        currentAnnotations.forEach((annotation) => {
          ctx.fillStyle = annotation.type === 'warning' ? 'rgba(255, 0, 0, 0.3)' :
            annotation.type === 'highlight' ? 'rgba(255, 255, 0, 0.3)' :
            'rgba(0, 0, 255, 0.3)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw annotation text
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(annotation.text, canvas.width / 2, canvas.height - 50);
        });
      }

      // Update progress
      currentFrame++;
      const progress = Math.min(90, 20 + (currentFrame / totalFrames) * 70);
      onProgress({
        status: 'processing',
        progress,
        message: `Processing frame ${currentFrame} of ${totalFrames}...`,
      });

      // Process next frame
      requestAnimationFrame(processFrame);
    };

    // Start processing
    processFrame();

    // Return the final video blob
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: `video/${options.format}` });
        resolve(blob);
      };
      mediaRecorder.onerror = (error) => {
        onProgress({
          status: 'error',
          progress: 0,
          message: 'Export failed: ' + (error instanceof Error ? error.message : String(error)),
        });
        reject(error);
      };
    });
  } catch (error) {
    onProgress({
      status: 'error',
      progress: 0,
      message: 'Export failed: ' + (error as Error).message,
    });
    throw error;
  }
};

export const downloadVideo = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 