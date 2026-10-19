import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { createAnnotation, updateAnnotation } from '../services/api';

export interface Annotation {
  id?: string;
  video_id: number;
  timestamp: number;
  type: 'note' | 'highlight' | 'warning';
  content: string;
  tags: string[];
  color?: string;
}

interface AnnotationEditorProps {
  videoId: number;
  currentTime: number;
  onSave: (annotation: Annotation) => void;
  onCancel: () => void;
  existingAnnotation?: Annotation;
  onDelete?: (id: string) => void;
}

const AnnotationEditor: React.FC<AnnotationEditorProps> = ({
  videoId,
  currentTime,
  onSave,
  onCancel,
  existingAnnotation,
  onDelete,
}) => {
  const [annotation, setAnnotation] = useState<Annotation>(
    existingAnnotation || {
      video_id: videoId,
      timestamp: currentTime,
      type: 'note',
      content: '',
      tags: [],
    }
  );

  const [newTag, setNewTag] = useState('');

  const handleTypeChange = (type: Annotation['type']) => {
    setAnnotation((prev) => ({
      ...prev,
      type,
      color: type === 'highlight' ? '#ffeb3b' : type === 'warning' ? '#f44336' : undefined,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !annotation.tags.includes(newTag.trim())) {
      setAnnotation((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAnnotation((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (annotation.content.trim()) {
      try {
        if (existingAnnotation?.id) {
          // Update existing annotation
          await updateAnnotation(parseInt(existingAnnotation.id), annotation);
        } else {
          // Create new annotation
          await createAnnotation(annotation);
        }
        onSave(annotation);
      } catch (error) {
        console.error('Error saving annotation:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {existingAnnotation ? 'Edit Annotation' : 'New Annotation'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Current timestamp">
            <Chip
              icon={<TimerIcon />}
              label={formatTime(currentTime)}
              size="small"
            />
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Annotation Type</InputLabel>
            <Select
              value={annotation.type}
              label="Annotation Type"
              onChange={(e) => handleTypeChange(e.target.value as Annotation['type'])}
            >
              <MenuItem value="note">Note</MenuItem>
              <MenuItem value="highlight">Highlight</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Content"
            value={annotation.content}
            onChange={(e) =>
              setAnnotation((prev) => ({ ...prev, content: e.target.value }))
            }
            placeholder="Enter your annotation..."
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              label="Add Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {annotation.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                size="small"
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {existingAnnotation && onDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete(existingAnnotation.id!)}
              >
                Delete
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={!annotation.content.trim()}
            >
              Save
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AnnotationEditor; 