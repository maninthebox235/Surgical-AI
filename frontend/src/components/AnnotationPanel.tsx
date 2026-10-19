import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Annotation } from '../types/annotation';

interface AnnotationPanelProps {
  annotations: Annotation[];
  onAnnotationAdd: (annotation: Annotation) => void;
  onAnnotationUpdate: (annotation: Annotation) => void;
  onAnnotationDelete: (id: string) => void;
  currentTime: number;
  onTimeSelect: (time: number) => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  annotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  currentTime,
  onTimeSelect,
}) => {
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnotationText, setNewAnnotationText] = useState('');
  const [newAnnotationType, setNewAnnotationType] = useState<Annotation['type']>('note');

  const handleAddAnnotation = () => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      timestamp: currentTime,
      text: newAnnotationText,
      type: newAnnotationType,
    };
    onAnnotationAdd(newAnnotation);
    setNewAnnotationText('');
    setNewAnnotationType('note');
    setIsDialogOpen(false);
  };

  const handleEditAnnotation = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setNewAnnotationText(annotation.text || annotation.content || '');
    setNewAnnotationType(annotation.type);
    setIsDialogOpen(true);
  };

  const handleUpdateAnnotation = () => {
    if (editingAnnotation) {
      onAnnotationUpdate({
        ...editingAnnotation,
        text: newAnnotationText,
        type: newAnnotationType,
      });
      setEditingAnnotation(null);
      setNewAnnotationText('');
      setNewAnnotationType('note');
      setIsDialogOpen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTypeColor = (type: Annotation['type']) => {
    switch (type) {
      case 'warning':
        return 'error';
      case 'highlight':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <StyledPaper elevation={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Annotations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Add Annotation
        </Button>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto' }}>
        {annotations.map((annotation) => (
          <ListItem
            key={annotation.id}
            sx={{
              borderLeft: 4,
              borderColor: `${getTypeColor(annotation.type)}.main`,
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
            }}
          >
            <ListItemText
              primary={annotation.text || annotation.content || ''}
              secondary={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={annotation.type}
                    size="small"
                    color={getTypeColor(annotation.type)}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(annotation.timestamp)}
                  </Typography>
                </Stack>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditAnnotation(annotation)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onAnnotationDelete(annotation.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>
          {editingAnnotation ? 'Edit Annotation' : 'Add Annotation'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Annotation Text"
            fullWidth
            multiline
            rows={3}
            value={newAnnotationText}
            onChange={(e) => setNewAnnotationText(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="Annotation Type"
            fullWidth
            value={newAnnotationType}
            onChange={(e) => setNewAnnotationType(e.target.value as Annotation['type'])}
          >
            <MenuItem value="note">Note</MenuItem>
            <MenuItem value="highlight">Highlight</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={editingAnnotation ? handleUpdateAnnotation : handleAddAnnotation}
            variant="contained"
          >
            {editingAnnotation ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};

export default AnnotationPanel; 