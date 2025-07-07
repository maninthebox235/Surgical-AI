import React, { useState } from 'react';
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
  LinearProgress,
  Avatar,
  Fade,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    '& .play-overlay': {
      opacity: 1,
    },
    '& .thumbnail': {
      transform: 'scale(1.1)',
    },
  },
}));

const PlayOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 2,
}));

const ScoreChip = styled(Chip)<{ score: number }>(({ theme, score }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  zIndex: 3,
  backgroundColor: score >= 90 ? '#4caf50' : score >= 70 ? '#ff9800' : '#f44336',
  color: 'white',
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: 'white',
  },
}));

const ThumbnailContainer = styled(Box)({
  position: 'relative',
  height: 200,
  overflow: 'hidden',
});

interface EnhancedVideoCardProps {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  procedureType: string;
  difficulty: string;
  uploadDate: string;
  views: number;
  score?: number;
  skillProgress?: {
    suturing?: number;
    technique?: number;
    safety?: number;
  };
  onDelete?: (id: number) => void;
  onShare?: (id: number) => void;
}

const EnhancedVideoCard: React.FC<EnhancedVideoCardProps> = ({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  procedureType,
  difficulty,
  uploadDate,
  views,
  score = 75,
  skillProgress,
  onDelete,
  onShare,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

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
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleShare = async () => {
    handleMenuClose();
    if (onShare) {
      onShare(id);
    }
  };

  const handleCardClick = () => {
    navigate(`/videos/${id}`);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner':
        return '#4caf50';
      case 'intermediate':
        return '#ff9800';
      case 'advanced':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  return (
    <StyledCard
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ThumbnailContainer>
        <CardMedia
          component="img"
          className="thumbnail"
          height="200"
          image={thumbnailUrl || `/api/placeholder/400/200?text=${encodeURIComponent(title)}`}
          alt={title}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
        />
        
        <PlayOverlay className="play-overlay">
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              color: 'primary.main',
              width: 64,
              height: 64,
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 32 }} />
          </Avatar>
        </PlayOverlay>

        <ScoreChip
          score={score}
          icon={<StarIcon />}
          label={`${score}%`}
          size="small"
        />

        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem',
          }}
        >
          {duration}
        </Box>

        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
          onClick={handleMenuOpen}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      </ThumbnailContainer>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
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
            lineHeight: 1.3,
            mb: 1,
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
            flex: 1,
          }}
        >
          {description}
        </Typography>

        {/* Skill Progress */}
        {skillProgress && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Skills Assessment
            </Typography>
            {Object.entries(skillProgress).map(([skill, progress]) => (
              <Box key={skill} sx={{ mb: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                    {skill}
                  </Typography>
                  <Typography variant="caption">{progress}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      backgroundColor: progress >= 80 ? '#4caf50' : progress >= 60 ? '#ff9800' : '#f44336',
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label={procedureType}
              size="small"
              variant="outlined"
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                fontSize: '0.75rem',
              }}
            />
            <Chip
              label={difficulty}
              size="small"
              sx={{
                backgroundColor: getDifficultyColor(difficulty),
                color: 'white',
                fontSize: '0.75rem',
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {new Date(uploadDate).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {views} views
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share Video</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete Video</ListItemText>
        </MenuItem>
      </Menu>
    </StyledCard>
  );
};

export default EnhancedVideoCard;