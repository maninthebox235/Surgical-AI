import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Avatar, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Whatshot as FireIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const BadgeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const BadgeAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  marginBottom: theme.spacing(1),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: theme.shadows[3],
}));

const ProgressBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: -5,
  right: -5,
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  borderRadius: '50%',
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  border: `2px solid ${theme.palette.background.paper}`,
}));

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'fire' | 'school' | 'trending';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: (achievement: Achievement) => void;
}

const iconMap = {
  trophy: TrophyIcon,
  star: StarIcon,
  fire: FireIcon,
  school: SchoolIcon,
  trending: TrendingUpIcon,
};

const rarityColors = {
  common: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  rare: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  epic: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  legendary: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
};

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  showProgress = true,
  size = 'medium',
  onClick,
}) => {
  const IconComponent = iconMap[achievement.icon];
  const isUnlocked = achievement.unlocked;
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

  const sizeProps = {
    small: { width: 40, height: 40 },
    medium: { width: 60, height: 60 },
    large: { width: 80, height: 80 },
  };

  const handleClick = () => {
    if (onClick) {
      onClick(achievement);
    }
  };

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {achievement.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {achievement.description}
          </Typography>
          {showProgress && (
            <Typography variant="caption">
              Progress: {achievement.progress}/{achievement.maxProgress}
            </Typography>
          )}
          {achievement.unlockedAt && (
            <Typography variant="caption" display="block">
              Unlocked: {achievement.unlockedAt.toLocaleDateString()}
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <BadgeContainer onClick={handleClick}>
        <Box sx={{ position: 'relative' }}>
          <BadgeAvatar
            sx={{
              ...sizeProps[size],
              background: isUnlocked
                ? rarityColors[achievement.rarity]
                : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
              opacity: isUnlocked ? 1 : 0.5,
            }}
          >
            <IconComponent
              sx={{
                fontSize: size === 'small' ? 20 : size === 'medium' ? 30 : 40,
                color: isUnlocked ? 'white' : '#666',
              }}
            />
          </BadgeAvatar>
          
          {showProgress && !isUnlocked && (
            <ProgressBadge>
              {Math.round(progressPercentage)}%
            </ProgressBadge>
          )}
          
          {isUnlocked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
            >
              <ProgressBadge sx={{ backgroundColor: '#4caf50' }}>
                ✓
              </ProgressBadge>
            </motion.div>
          )}
        </Box>
        
        <Typography
          variant="caption"
          align="center"
          sx={{
            maxWidth: 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: isUnlocked ? 'text.primary' : 'text.secondary',
            fontWeight: isUnlocked ? 'bold' : 'normal',
          }}
        >
          {achievement.title}
        </Typography>
        </BadgeContainer>
      </motion.div>
    </Tooltip>
  );
};

export default AchievementBadge;