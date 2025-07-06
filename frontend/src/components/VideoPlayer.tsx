import React, { useRef, useState, useEffect, RefObject, useCallback } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Tooltip,
  Paper,
  Stack,
  Button,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Speed as SpeedIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as FullscreenIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Annotation } from '../types/annotation';

export interface VideoPlayerProps {
  src: string;
  title: string;
  onTimeUpdate?: (time: number) => void;
  onAnnotationAdd?: (annotation: Annotation) => void;
  annotations?: Annotation[];
  isComparison?: boolean;
  videoRef: RefObject<HTMLVideoElement>;
}

const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '56.25%', // 16:9 aspect ratio
  backgroundColor: '#000',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const StyledVideo = styled('video')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ControlsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const AnnotationMarker = styled(Box)<{ type: Annotation['type'] }>(({ theme, type }) => ({
  position: 'absolute',
  bottom: '20%',
  width: 2,
  height: '20%',
  backgroundColor: type === 'warning' ? theme.palette.error.main :
    type === 'highlight' ? theme.palette.warning.main :
    theme.palette.info.main,
  cursor: 'pointer',
  '&:hover': {
    width: 4,
  },
}));

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  onTimeUpdate,
  onAnnotationAdd,
  annotations = [],
  isComparison = false,
  videoRef: externalVideoRef,
  ...props
}) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [handleTimeUpdate, handleLoadedMetadata]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    if (videoRef.current && typeof value === 'number') {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (_: Event, value: number | number[]) => {
    if (videoRef.current && typeof value === 'number') {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlaybackRateChange = () => {
    const rates = [0.5, 1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
      setPlaybackRate(nextRate);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAddAnnotation = () => {
    if (onAnnotationAdd && videoRef.current) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        timestamp: videoRef.current.currentTime,
        text: 'New annotation',
        type: 'note',
      };
      onAnnotationAdd(newAnnotation);
    }
  };

  return (
    <VideoContainer
      ref={videoRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <StyledVideo
        ref={videoRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {annotations.map((annotation) => (
        <AnnotationMarker
          key={annotation.id}
          type={annotation.type}
          style={{
            left: `${(annotation.timestamp / duration) * 100}%`,
          }}
        />
      ))}

      {showControls && (
        <ControlsContainer>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handlePlayPause} color="inherit">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <Typography variant="body2" color="white" sx={{ minWidth: 60 }}>
              {formatTime(currentTime)}
            </Typography>
            <Slider
              value={currentTime}
              onChange={handleSeek}
              max={duration}
              sx={{
                color: 'white',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />
            <Typography variant="body2" color="white" sx={{ minWidth: 60 }}>
              {formatTime(duration)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handleMuteToggle} color="inherit">
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              max={1}
              step={0.1}
              sx={{
                color: 'white',
                width: 100,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />
            <Tooltip title={`Playback Speed: ${playbackRate}x`}>
              <IconButton onClick={handlePlaybackRateChange} color="inherit">
                <SpeedIcon />
              </IconButton>
            </Tooltip>
            {onAnnotationAdd && (
              <Tooltip title="Add Annotation">
                <IconButton onClick={handleAddAnnotation} color="inherit">
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={handleFullscreen} color="inherit">
              <FullscreenIcon />
            </IconButton>
          </Stack>
        </ControlsContainer>
      )}
    </VideoContainer>
  );
};

export default VideoPlayer; 