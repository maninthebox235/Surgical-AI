import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  LinearProgress,
  Stack,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface SurgicalStep {
  step_number: number;
  step_name: string;
  start_time: number;
  end_time: number;
  confidence: number;
  feedback: string;
}

interface SurgicalTimelineProps {
  steps: SurgicalStep[];
  currentTime: number;
  duration: number;
  onStepClick: (time: number) => void;
  onPlayPause: () => void;
  isPlaying: boolean;
}

const TimelineContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const TimelineBar = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 4,
  backgroundColor: theme.palette.grey[200],
  borderRadius: 2,
  margin: theme.spacing(2, 0),
}));

interface TimelineMarkerProps {
  position: number;
  isActive?: boolean;
  onClick?: () => void;
}

const TimelineMarker: React.FC<TimelineMarkerProps> = ({ position, isActive, onClick }) => (
  <Box
    sx={{
      position: 'absolute',
      left: `${position}%`,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: isActive ? 'primary.main' : 'grey.400',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'primary.main',
      },
    }}
    onClick={onClick}
  />
);

interface CurrentTimeMarkerProps {
  position: number;
}

const CurrentTimeMarker: React.FC<CurrentTimeMarkerProps> = ({ position }) => (
  <Box
    sx={{
      position: 'absolute',
      left: `${position}%`,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: 'error.main',
      zIndex: 1,
    }}
  />
);

const SurgicalTimeline: React.FC<SurgicalTimelineProps> = ({
  steps,
  currentTime,
  duration,
  onStepClick,
  onPlayPause,
  isPlaying,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentStep = () => {
    return steps.find(
      (step) => currentTime >= step.start_time && currentTime <= step.end_time
    );
  };

  const handleStepClick = (step: SurgicalStep) => {
    onStepClick(step.start_time);
  };

  const handleNextStep = () => {
    const currentStep = getCurrentStep();
    if (currentStep) {
      const currentIndex = steps.findIndex((s) => s.step_number === currentStep.step_number);
      if (currentIndex < steps.length - 1) {
        onStepClick(steps[currentIndex + 1].start_time);
      }
    }
  };

  const handlePreviousStep = () => {
    const currentStep = getCurrentStep();
    if (currentStep) {
      const currentIndex = steps.findIndex((s) => s.step_number === currentStep.step_number);
      if (currentIndex > 0) {
        onStepClick(steps[currentIndex - 1].start_time);
      }
    }
  };

  return (
    <TimelineContainer elevation={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TimelineIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Surgical Steps Timeline</Typography>
        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
          <Tooltip title="Previous Step">
            <IconButton onClick={handlePreviousStep} size="small">
              <SkipPreviousIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
            <IconButton onClick={onPlayPause} size="small">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Next Step">
            <IconButton onClick={handleNextStep} size="small">
              <SkipNextIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <TimelineBar>
        {steps.map((step) => (
          <TimelineMarker
            key={step.step_number}
            position={(step.start_time / duration) * 100}
            isActive={currentTime >= step.start_time && currentTime <= step.end_time}
            onClick={() => handleStepClick(step)}
          />
        ))}
        <CurrentTimeMarker position={(currentTime / duration) * 100} />
      </TimelineBar>

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {steps.map((step) => {
          const isActive = currentTime >= step.start_time && currentTime <= step.end_time;
          return (
            <ListItem
              key={step.step_number}
              button
              onClick={() => handleStepClick(step)}
              selected={isActive}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon>
                <Typography variant="h6" color={isActive ? 'primary' : 'text.secondary'}>
                  {step.step_number}
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={step.step_name}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(step.start_time)} - {formatTime(step.end_time)}
                    </Typography>
                    <Chip
                      label={`${(step.confidence * 100).toFixed(0)}%`}
                      size="small"
                      color={step.confidence >= 0.7 ? 'success' : step.confidence >= 0.5 ? 'warning' : 'error'}
                    />
                  </Stack>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </TimelineContainer>
  );
};

export default SurgicalTimeline; 