import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Fade,
  Slide,
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Whatshot as FireIcon,
  School as SchoolIcon,
  Star as StarIcon,
  LocalFireDepartment as StreakIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AchievementBadge, { Achievement } from '../components/engagement/AchievementBadge';
import ProgressRing from '../components/engagement/ProgressRing';
import SuccessAnimation from '../components/animations/SuccessAnimation';

interface UserStats {
  totalVideos: number;
  totalAnnotations: number;
  totalAnalysis: number;
  currentStreak: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  skillProgress: {
    suturing: number;
    incision: number;
    tissueHandling: number;
    instrumentUse: number;
  };
}

interface RecentVideo {
  id: number;
  title: string;
  score: number;
  uploadDate: string;
  procedureType: string;
  thumbnail: string;
}

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState<UserStats>({
    totalVideos: 12,
    totalAnnotations: 45,
    totalAnalysis: 8,
    currentStreak: 5,
    level: 3,
    xp: 750,
    nextLevelXp: 1000,
    skillProgress: {
      suturing: 75,
      incision: 60,
      tissueHandling: 85,
      instrumentUse: 70,
    },
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Upload',
      description: 'Upload your first surgical video',
      icon: 'school',
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      rarity: 'common',
      unlockedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Streak Master',
      description: 'Maintain a 5-day learning streak',
      icon: 'fire',
      progress: 5,
      maxProgress: 5,
      unlocked: true,
      rarity: 'rare',
      unlockedAt: new Date('2024-01-20'),
    },
    {
      id: '3',
      title: 'Perfect Score',
      description: 'Achieve a perfect technique score',
      icon: 'trophy',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      rarity: 'legendary',
    },
    {
      id: '4',
      title: 'Video Veteran',
      description: 'Upload 10 surgical videos',
      icon: 'star',
      progress: 12,
      maxProgress: 10,
      unlocked: true,
      rarity: 'epic',
      unlockedAt: new Date('2024-01-25'),
    },
  ]);

  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([
    {
      id: 1,
      title: 'Laparoscopic Cholecystectomy - Practice #3',
      score: 87,
      uploadDate: '2024-01-28',
      procedureType: 'Laparoscopic',
      thumbnail: '/api/placeholder/300/200',
    },
    {
      id: 2,
      title: 'Suturing Technique - Basic Running',
      score: 92,
      uploadDate: '2024-01-27',
      procedureType: 'Suturing',
      thumbnail: '/api/placeholder/300/200',
    },
    {
      id: 3,
      title: 'Appendectomy - Initial Attempt',
      score: 78,
      uploadDate: '2024-01-26',
      procedureType: 'Open Surgery',
      thumbnail: '/api/placeholder/300/200',
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Simulate achievement unlock
    const achievementTimer = setTimeout(() => {
      setSuccessMessage('New Achievement Unlocked: Video Veteran!');
      setShowSuccess(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(achievementTimer);
    };
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const levelProgress = (stats.xp / stats.nextLevelXp) * 100;

  const handleAchievementClick = (achievement: Achievement) => {
    console.log('Achievement clicked:', achievement);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        </motion.div>
        <Typography variant="h6" color="text.secondary">
          Preparing your learning experience...
        </Typography>
      </Box>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Paper
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      mr: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {user?.full_name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {getTimeBasedGreeting()}, {user?.full_name}!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Level {stats.level} Surgical Trainee • {stats.currentStreak} day streak 🔥
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Progress to Level {stats.level + 1}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={levelProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#ffd700',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                    {stats.xp} / {stats.nextLevelXp} XP
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <ProgressRing
                    value={levelProgress}
                    label="Level Progress"
                    size={120}
                    color="#ffd700"
                    animated={true}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/upload')}
                  sx={{
                    height: 80,
                    background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                  }}
                >
                  Upload Video
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VideoIcon />}
                  onClick={() => navigate('/videos')}
                  sx={{ height: 80, fontSize: '1.1rem' }}
                >
                  My Videos
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/analysis')}
                  sx={{ height: 80, fontSize: '1.1rem' }}
                >
                  View Analysis
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate('/library')}
                  sx={{ height: 80, fontSize: '1.1rem' }}
                >
                  Learning Library
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>

        {/* Stats and Achievements Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Skills Progress */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Skill Progress
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(stats.skillProgress).map(([skill, progress]) => (
                    <Grid item xs={6} key={skill}>
                      <Box sx={{ textAlign: 'center' }}>
                        <ProgressRing
                          value={progress}
                          label={skill.charAt(0).toUpperCase() + skill.slice(1).replace(/([A-Z])/g, ' $1')}
                          size={100}
                          animated={true}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          </Grid>

          {/* Achievements */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Recent Achievements
                </Typography>
                <Grid container spacing={2}>
                  {achievements.slice(0, 4).map((achievement) => (
                    <Grid item xs={6} sm={3} key={achievement.id}>
                      <AchievementBadge
                        achievement={achievement}
                        onClick={handleAchievementClick}
                        size="medium"
                      />
                    </Grid>
                  ))}
                </Grid>
                <Button
                  variant="text"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/achievements')}
                >
                  View All Achievements
                </Button>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Recent Videos */}
        <motion.div variants={itemVariants}>
          <Typography variant="h5" gutterBottom>
            Recent Videos
          </Typography>
          <Grid container spacing={3}>
            {recentVideos.map((video, index) => (
              <Grid item xs={12} sm={6} md={4} key={video.id}>
                <Slide direction="up" in={true} timeout={500 + index * 100}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => navigate(`/videos/${video.id}`)}
                  >
                    <Box
                      sx={{
                        height: 160,
                        background: `linear-gradient(45deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '3rem',
                      }}
                    >
                      <VideoIcon sx={{ fontSize: 60 }} />
                    </Box>
                    <CardContent>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {video.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Chip
                          label={video.procedureType}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={`${video.score}%`}
                          size="small"
                          color={video.score >= 90 ? 'success' : video.score >= 70 ? 'warning' : 'error'}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(video.uploadDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Success Animation */}
        <SuccessAnimation
          show={showSuccess}
          message={successMessage}
          onComplete={() => setShowSuccess(false)}
          confetti={true}
        />
      </Box>
    </motion.div>
  );
};

export default EnhancedDashboard;