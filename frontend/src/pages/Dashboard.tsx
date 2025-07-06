import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Collections as CollectionsIcon,
  Edit as EditIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoCard from '../components/VideoCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  procedureType: string;
  difficulty: string;
  uploadDate: string;
  views: number;
}

interface Activity {
  id: number;
  type: 'video' | 'annotation' | 'analysis';
  title: string;
  timestamp: string;
  details: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalAnnotations: 0,
    totalAnalysis: 0,
  });
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data.stats);
      setRecentVideos(data.recentVideos);
      setRecentActivity(data.recentActivity);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (id: number) => {
    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      setRecentVideos((prev) => prev.filter((video) => video.id !== id));
      setStats((prev) => ({ ...prev, totalVideos: prev.totalVideos - 1 }));
    } catch (err) {
      setError('Failed to delete video. Please try again.');
    }
  };

  const handleShareVideo = (id: number) => {
    // Implement share functionality
    console.log('Share video:', id);
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.full_name}!
        </Typography>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/upload')}
              sx={{ height: '100%', py: 2 }}
            >
              Upload Video
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CollectionsIcon />}
              onClick={() => navigate('/videos')}
              sx={{ height: '100%', py: 2 }}
            >
              View All Videos
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate('/annotations')}
              sx={{ height: '100%', py: 2 }}
            >
              Manage Annotations
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/analysis')}
              sx={{ height: '100%', py: 2 }}
            >
              View Analysis
            </Button>
          </Grid>
        </Grid>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <VideoIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">{stats.totalVideos}</Typography>
              <Typography color="text.secondary">Total Videos</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <TimelineIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4">{stats.totalAnnotations}</Typography>
              <Typography color="text.secondary">Annotations</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4">{stats.totalAnalysis}</Typography>
              <Typography color="text.secondary">AI Analysis</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Videos */}
        <Typography variant="h5" gutterBottom>
          Recent Videos
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {recentVideos.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
              <VideoCard
                {...video}
                onDelete={handleDeleteVideo}
                onShare={handleShareVideo}
              />
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Paper>
          <List>
            {recentActivity.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem>
                  <ListItemIcon>
                    {activity.type === 'video' && <VideoIcon />}
                    {activity.type === 'annotation' && <TimelineIcon />}
                    {activity.type === 'analysis' && <AssessmentIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.title}
                    secondary={
                      <>
                        {activity.details}
                        <br />
                        {new Date(activity.timestamp).toLocaleString()}
                      </>
                    }
                  />
                </ListItem>
                {index < recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </ErrorBoundary>
  );
};

export default Dashboard; 