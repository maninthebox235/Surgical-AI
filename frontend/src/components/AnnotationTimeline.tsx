import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Note as NoteIcon,
  Highlight as HighlightIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { Annotation } from './AnnotationEditor';

interface AnnotationTimelineProps {
  annotations: Annotation[];
  duration: number;
  currentTime: number;
  onAnnotationClick: (annotation: Annotation) => void;
  onAnnotationEdit: (annotation: Annotation) => void;
  onAnnotationDelete: (id: string) => void;
}

const AnnotationTimeline: React.FC<AnnotationTimelineProps> = ({
  annotations,
  duration,
  currentTime,
  onAnnotationClick,
  onAnnotationEdit,
  onAnnotationDelete,
}) => {
  const getAnnotationIcon = (type: Annotation['type']) => {
    switch (type) {
      case 'note':
        return <NoteIcon />;
      case 'highlight':
        return <HighlightIcon />;
      case 'warning':
        return <FlagIcon />;
      default:
        return <NoteIcon />;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnnotationColor = (type: Annotation['type']) => {
    switch (type) {
      case 'highlight':
        return '#ffeb3b';
      case 'warning':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Annotations
      </Typography>

      <Box sx={{ position: 'relative', mb: 2 }}>
        {/* Timeline Progress */}
        <LinearProgress
          variant="determinate"
          value={(currentTime / duration) * 100}
          sx={{ height: 4, borderRadius: 2 }}
        />

        {/* Annotation Markers */}
        <Box sx={{ position: 'relative', height: 24, mt: -14 }}>
          {annotations.map((annotation) => {
            const position = (annotation.timestamp / duration) * 100;
            return (
              <Tooltip
                key={annotation.id}
                title={`${formatTime(annotation.timestamp)} - ${annotation.content}`}
                placement="top"
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${position}%`,
                    transform: 'translateX(-50%)',
                    cursor: 'pointer',
                  }}
                  onClick={() => onAnnotationClick(annotation)}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getAnnotationColor(annotation.type),
                      border: '2px solid white',
                      boxShadow: 1,
                    }}
                  />
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* Annotations List */}
      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
        {annotations.map((annotation) => (
          <Paper
            key={annotation.id}
            sx={{
              p: 1,
              mb: 1,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              bgcolor: annotation.type === 'highlight' ? '#fffde7' : 'background.paper',
              borderLeft: 4,
              borderColor: getAnnotationColor(annotation.type),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
              {getAnnotationIcon(annotation.type)}
              <Typography variant="caption" color="text.secondary">
                {formatTime(annotation.timestamp)}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {annotation.content}
              </Typography>
              {annotation.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {annotation.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ height: 20 }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => onAnnotationEdit(annotation)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onAnnotationDelete(annotation.id!)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
};

export default AnnotationTimeline; 