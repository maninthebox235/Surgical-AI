import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as FullscreenIcon,
  Add as AddIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import AnnotationEditor from '../components/AnnotationEditor';
import AnnotationList from '../components/AnnotationList';
import ConfirmDialog from '../components/ConfirmDialog';
import { Annotation } from '../components/AnnotationEditor';

interface VideoData {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  procedureType: string;
  difficulty: string;
  tags: string[];
  annotations: Annotation[];
  analysisResults?: {
    instruments: string[];
    steps: string[];
    skillAssessment: string;
    complications: string[];
  };
}

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [showAnnotationEditor, setShowAnnotationEditor] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<Annotation['type'] | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [annotationToDelete, setAnnotationToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/videos/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch video data');
        }

        const data = await response.json();
        setVideoData(data);
      } catch (err) {
        setError('Failed to load video. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
      handleSeek(newTime);
    }
  };

  const handleVolumeToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    if (videoRef.current) {
      videoRef.current.currentTime = annotation.timestamp;
      setSelectedAnnotationId(annotation.id || null);
    }
  };

  const handleAnnotationEdit = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setShowAnnotationEditor(true);
  };

  const handleAnnotationDelete = (annotationId: string) => {
    setAnnotationToDelete(annotationId);
    setShowDeleteDialog(true);
  };

  const handleSaveAnnotation = async (annotation: Annotation) => {
    try {
      const response = await fetch(`/api/videos/${id}/annotations`, {
        method: editingAnnotation ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...annotation,
          video_id: id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save annotation');
      }

      const savedAnnotation = await response.json();
      
      setVideoData((prev) => {
        if (!prev) return prev;
        
        if (editingAnnotation) {
          return {
            ...prev,
            annotations: prev.annotations.map((a) =>
              a.id === editingAnnotation.id ? savedAnnotation : a
            ),
          };
        } else {
          return {
            ...prev,
            annotations: [...prev.annotations, savedAnnotation],
          };
        }
      });

      setShowAnnotationEditor(false);
      setEditingAnnotation(null);
    } catch (err) {
      console.error('Failed to save annotation:', err);
    }
  };

  const handleDeleteAnnotation = async () => {
    if (!annotationToDelete) return;

    try {
      const response = await fetch(`/api/videos/${id}/annotations/${annotationToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete annotation');
      }

      setVideoData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          annotations: prev.annotations.filter((a) => a.id !== annotationToDelete),
        };
      });

      setShowDeleteDialog(false);
      setAnnotationToDelete(null);
    } catch (err) {
      console.error('Failed to delete annotation:', err);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading video..." />;
  }

  if (error || !videoData) {
    return (
      <ErrorBoundary>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error || 'Video not found'}</Alert>
          <Button onClick={() => navigate('/videos')} sx={{ mt: 2 }}>
            Back to Videos
          </Button>
        </Box>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3}>
          {/* Video Player Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ position: 'relative', bgcolor: 'black' }}>
              <video
                ref={videoRef}
                src={videoData.url}
                style={{ width: '100%', maxHeight: '70vh' }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <IconButton onClick={handlePlayPause} color="primary">
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
                <IconButton onClick={() => handleSkip(-10)} color="primary">
                  <SkipPreviousIcon />
                </IconButton>
                <IconButton onClick={() => handleSkip(10)} color="primary">
                  <SkipNextIcon />
                </IconButton>
                <Typography variant="body2" color="white" sx={{ mx: 1 }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton onClick={handleVolumeToggle} color="primary">
                  {isMuted ? <VolumeOffIcon /> : <VolumeIcon />}
                </IconButton>
                <IconButton onClick={handleFullscreen} color="primary">
                  <FullscreenIcon />
                </IconButton>
              </Box>
            </Paper>

            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h5" gutterBottom>
                {videoData.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {videoData.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={videoData.procedureType} />
                <Chip label={videoData.difficulty} />
                {videoData.tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="outlined" />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
              >
                <Tab icon={<TimelineIcon />} label="Annotations" />
                <Tab icon={<AssessmentIcon />} label="Analysis" />
              </Tabs>
            </Paper>

            {activeTab === 0 && (
              <Paper sx={{ p: 2 }}>
                <Box sx={{ position: 'relative', height: 600 }}>
                  <AnnotationList
                    annotations={videoData.annotations}
                    onAnnotationClick={handleAnnotationClick}
                    onAnnotationEdit={handleAnnotationEdit}
                    onAnnotationDelete={handleAnnotationDelete}
                    selectedAnnotationId={selectedAnnotationId ?? undefined}
                    filterType={filterType}
                    onFilterChange={setFilterType}
                  />

                  {/* Add Annotation FAB */}
                  <Fab
                    color="primary"
                    aria-label="add annotation"
                    sx={{ position: 'absolute', bottom: 16, right: 16 }}
                    onClick={() => setShowAnnotationEditor(true)}
                  >
                    <AddIcon />
                  </Fab>
                </Box>
              </Paper>
            )}

            {activeTab === 1 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  AI Analysis Results
                </Typography>
                
                {/* Instruments Detection */}
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Detected Instruments
                </Typography>
                <List dense>
                  {videoData.analysisResults?.instruments.map((instrument, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={instrument}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Surgical Steps */}
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Surgical Steps
                </Typography>
                <List dense>
                  {videoData.analysisResults?.steps.map((step, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={step}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Skill Assessment */}
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Skill Assessment
                </Typography>
                <Typography variant="body2" paragraph>
                  {videoData.analysisResults?.skillAssessment}
                </Typography>

                {/* Complications */}
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Complications Detected
                </Typography>
                <List dense>
                  {videoData.analysisResults?.complications.map((complication, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={complication}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Annotation Editor Dialog */}
        <Dialog
          open={showAnnotationEditor}
          onClose={() => {
            setShowAnnotationEditor(false);
            setEditingAnnotation(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingAnnotation ? 'Edit Annotation' : 'Add Annotation'}
          </DialogTitle>
          <DialogContent>
            <AnnotationEditor
              videoId={Number(id) || 0}
              currentTime={currentTime}
              onSave={handleSaveAnnotation}
              onCancel={() => {
                setShowAnnotationEditor(false);
                setEditingAnnotation(null);
              }}
              existingAnnotation={editingAnnotation ?? undefined}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showDeleteDialog}
          title="Delete Annotation"
          message="Are you sure you want to delete this annotation? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteAnnotation}
          onCancel={() => {
            setShowDeleteDialog(false);
            setAnnotationToDelete(null);
          }}
          severity="error"
        />
      </Box>
    </ErrorBoundary>
  );
};

export default VideoPlayer; 