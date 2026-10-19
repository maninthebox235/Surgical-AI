import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deleteVideo, shareVideo } from '../services/api';

interface VideoCardProps {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  procedureType: string;
  difficulty: string;
  uploadDate: string;
  views: number;
  onDelete?: (id: number) => void;
  onShare?: (id: number) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  procedureType,
  difficulty,
  uploadDate,
  views,
  onDelete,
  onShare,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    navigate(`/videos/${id}/edit`);
  };

  const handleDelete = async () => {
    handleMenuClose();
    try {
      await deleteVideo(id);
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const handleShare = async () => {
    handleMenuClose();
    try {
      const shareData = { 
        email: '', // This would come from a dialog
        message: `Check out this surgical video: ${title}` 
      };
      await shareVideo(id, shareData);
      if (onShare) {
        onShare(id);
      }
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const handleCardClick = () => {
    navigate(`/videos/${id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
          cursor: 'pointer',
        },
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={thumbnailUrl}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          <Typography variant="caption">{duration}</Typography>
        </Box>
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
          onClick={handleMenuOpen}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {description}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip
              label={procedureType}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={difficulty}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {new Date(uploadDate).toLocaleDateString()} • {views} views
          </Typography>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default VideoCard; 