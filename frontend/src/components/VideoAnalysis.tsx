import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Slider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Delete,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import VideoPlayer from './VideoPlayer';
import AnnotationPanel from './AnnotationPanel';
import { getVideoAnalysis, getVideo } from '../services/api';
import {
  registerVideoPlayerShortcuts,
  registerNavigationShortcuts,
  registerAnnotationShortcuts,
  unregisterAllShortcuts,
} from '../services/keyboardShortcuts';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { Annotation } from '../types/annotation';
import { AnalysisStep } from '../types/analysis';
import { keyboardShortcuts } from '../services/keyboardShortcuts';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  status: string;
  created_at: string;
  user_id: string;
}

interface Analysis {
  video_id: string;
  steps: AnalysisStep[];
  overall_score: number;
  technique_analysis: {
    instrument_handling: number;
    tissue_manipulation: number;
    suturing_technique: number;
    overall_flow: number;
  };
  recommendations: string[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const VideoAnalysis: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentStep, setCurrentStep] = useState<AnalysisStep | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const comparisonVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [videoData, analysisData] = await Promise.all([
          getVideo(videoId!),
          getVideoAnalysis(videoId!),
        ]);
        setVideo(videoData);
        setAnalysis(analysisData);
      } catch (err) {
        setError('Failed to load video analysis');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  useEffect(() => {
    if (analysis) {
      const step = analysis.steps.find(
        (s) => currentTime >= s.start_time && currentTime <= s.end_time
      );
      setCurrentStep(step || null);
    }
  }, [currentTime, analysis]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      void videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void videoRef.current.requestFullscreen();
    }
  }, []);

  const handleSeekForward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration || videoRef.current.currentTime + 5,
        videoRef.current.currentTime + 5
      );
    }
  }, []);

  const handleSeekBackward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  }, []);

  const handleNextFrame = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime += 1 / 30;
    }
  }, []);

  const handlePreviousFrame = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 1 / 30);
    }
  }, []);

  const handleAnnotationAdd = useCallback((annotation: Annotation) => {
    setAnnotations((prev) => [...prev, annotation]);
  }, []);

  const handleAnnotationAddFromShortcut = useCallback(() => {
    if (!videoRef.current || !videoId) return;
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: 'note',
      text: '',
      timestamp: videoRef.current.currentTime,
      videoId,
      userId: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
    setShowAnnotationDialog(true);
  }, [videoId]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleAnnotationUpdate = (updatedAnnotation: Annotation) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === updatedAnnotation.id ? updatedAnnotation : a))
    );
  };

  const handleAnnotationDelete = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleDeleteAnnotationShortcut = useCallback(() => {
    if (selectedAnnotation) {
      handleAnnotationDelete(selectedAnnotation.id);
      setSelectedAnnotation(null);
    }
  }, [selectedAnnotation, handleAnnotationDelete]);

  const handleEditAnnotationShortcut = useCallback(() => {
    if (selectedAnnotation) {
      setShowAnnotationDialog(true);
    }
  }, [selectedAnnotation]);

  const handleNextStep = useCallback(() => {
    const currentIndex = analysis?.steps.findIndex((step) => step.start_time >= currentTime);
    if (
      currentIndex !== undefined &&
      analysis?.steps &&
      currentIndex < analysis.steps.length - 1
    ) {
      const nextStep = analysis.steps[currentIndex + 1];
      if (nextStep && videoRef.current) {
        videoRef.current.currentTime = nextStep.start_time;
      }
    }
  }, [analysis, currentTime]);

  const handlePrevStep = useCallback(() => {
    const currentIndex = analysis?.steps.findIndex((step) => step.start_time >= currentTime);
    if (currentIndex !== undefined && analysis?.steps && currentIndex > 0) {
      const prevStep = analysis.steps[currentIndex - 1];
      if (prevStep && videoRef.current) {
        videoRef.current.currentTime = prevStep.start_time;
      }
    }
  }, [analysis, currentTime]);

  const handleToggleComparison = useCallback(() => {
    setShowComparison((prev) => !prev);
  }, []);

  useEffect(() => {
    registerVideoPlayerShortcuts(
      handlePlayPause,
      handleSeekForward,
      handleSeekBackward,
      handleMute,
      handleFullscreen,
      handleNextFrame,
      handlePreviousFrame
    );
    registerNavigationShortcuts(handleNextStep, handlePrevStep, handleToggleComparison);
    registerAnnotationShortcuts(
      handleAnnotationAddFromShortcut,
      handleEditAnnotationShortcut,
      handleDeleteAnnotationShortcut
    );

    return () => {
      unregisterAllShortcuts();
    };
  }, [
    handleAnnotationAddFromShortcut,
    handlePlayPause,
    handleMute,
    handleFullscreen,
    handleSeekForward,
    handleSeekBackward,
    handleNextFrame,
    handlePreviousFrame,
    handleNextStep,
    handlePrevStep,
    handleToggleComparison,
    handleDeleteAnnotationShortcut,
    handleEditAnnotationShortcut,
  ]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !video || !analysis) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Video or analysis not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            {video.title}
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <VideoPlayer
            src={video.url}
            title={video.title}
            onTimeUpdate={handleTimeUpdate}
            onAnnotationAdd={handleAnnotationAdd}
            annotations={annotations}
            videoRef={videoRef}
          />
        </Grid>
        {showComparison && (
          <Grid item xs={12} md={6}>
            <VideoPlayer
              src={video.url}
              title="Expert Reference"
              isComparison={true}
              videoRef={comparisonVideoRef}
            />
          </Grid>
        )}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Current Step
              </Typography>
              {currentStep ? (
                <>
                  <Typography variant="subtitle1">
                    {currentStep.step_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Step {currentStep.step_number}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={currentStep.confidence * 100}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2">
                    {currentStep.feedback}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No step detected at current timestamp
                </Typography>
              )}
            </StyledPaper>

            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Technique Analysis
              </Typography>
              <Stack spacing={2}>
                {Object.entries(analysis.technique_analysis).map(([key, value]) => (
                  <Box key={key}>
                    <Typography variant="body2" gutterBottom>
                      {key
                        .split('_')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={value * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Stack>
            </StyledPaper>

            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <Stack spacing={1}>
                {analysis.recommendations.map((recommendation, index) => (
                  <Chip
                    key={index}
                    label={recommendation}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </StyledPaper>
          </Stack>
        </Grid>

        <Grid item xs={12} md={showComparison ? 6 : 8}>
          <AnnotationPanel
            annotations={annotations}
            onAnnotationAdd={handleAnnotationAdd}
            onAnnotationUpdate={handleAnnotationUpdate}
            onAnnotationDelete={handleAnnotationDelete}
            currentTime={currentTime}
            onTimeSelect={setCurrentTime}
          />
        </Grid>
      </Grid>
      <KeyboardShortcutsHelp
        open={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </Box>
  );
};

export default VideoAnalysis; 