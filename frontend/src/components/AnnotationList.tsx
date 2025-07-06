import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Note as NoteIcon,
  Highlight as HighlightIcon,
  Flag as FlagIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Annotation } from './AnnotationEditor';

interface AnnotationListProps {
  annotations: Annotation[];
  onAnnotationClick: (annotation: Annotation) => void;
  onAnnotationEdit: (annotation: Annotation) => void;
  onAnnotationDelete: (id: string) => void;
  selectedAnnotationId?: string;
  filterType?: Annotation['type'];
  onFilterChange?: (type: Annotation['type'] | undefined) => void;
}

const AnnotationList: React.FC<AnnotationListProps> = ({
  annotations,
  onAnnotationClick,
  onAnnotationEdit,
  onAnnotationDelete,
  selectedAnnotationId,
  filterType,
  onFilterChange,
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

  const filteredAnnotations = filterType
    ? annotations.filter((a) => a.type === filterType)
    : annotations;

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Annotations
        </Typography>
        {onFilterChange && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="All">
              <IconButton
                size="small"
                color={!filterType ? 'primary' : 'default'}
                onClick={() => onFilterChange(undefined)}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notes">
              <IconButton
                size="small"
                color={filterType === 'note' ? 'primary' : 'default'}
                onClick={() => onFilterChange('note')}
              >
                <NoteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Highlights">
              <IconButton
                size="small"
                color={filterType === 'highlight' ? 'primary' : 'default'}
                onClick={() => onFilterChange('highlight')}
              >
                <HighlightIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Warnings">
              <IconButton
                size="small"
                color={filterType === 'warning' ? 'primary' : 'default'}
                onClick={() => onFilterChange('warning')}
              >
                <FlagIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredAnnotations.map((annotation) => (
          <ListItem
            key={annotation.id}
            button
            selected={annotation.id === selectedAnnotationId}
            onClick={() => onAnnotationClick(annotation)}
            sx={{
              borderLeft: 4,
              borderColor: getAnnotationColor(annotation.type),
              bgcolor: annotation.type === 'highlight' ? '#fffde7' : 'inherit',
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getAnnotationIcon(annotation.type)}
                  <Typography variant="body2" component="span">
                    {annotation.content}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(annotation.timestamp)}
                  </Typography>
                  {annotation.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ height: 20 }}
                    />
                  ))}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAnnotationEdit(annotation);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                edge="end"
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onAnnotationDelete(annotation.id!);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AnnotationList; 