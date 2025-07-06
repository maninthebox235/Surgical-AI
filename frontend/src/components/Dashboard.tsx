import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  CardMedia,
} from '@mui/material';
import {
  ViewList as ListIcon,
  ViewModule as GridIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getVideos, exportVideoReport } from '../services/api';

interface Video {
  id: number;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  progress: number;
  thumbnail_url?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'name';
type FilterStatus = 'all' | 'pending' | 'processing' | 'completed' | 'failed';

const Dashboard: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await getVideos();
      setVideos(response);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Video['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  const handleViewAnalysis = (videoId: number) => {
    navigate(`/videos/${videoId}/analysis`);
  };

  const handleDownloadReport = async (videoId: number, title: string) => {
    try {
      const blob = await exportVideoReport(videoId.toString());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_analysis_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const filteredAndSortedVideos = videos
    .filter((video) => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            My Videos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/upload')}
            startIcon={<PlayIcon />}
          >
            Upload New Video
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search videos"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                size="small"
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Filter by status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                size="small"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                fullWidth
              >
                <ToggleButton value="grid">
                  <GridIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {filteredAndSortedVideos.map((video) => (
            <Grid
              item
              xs={12}
              sm={viewMode === 'grid' ? 6 : 12}
              md={viewMode === 'grid' ? 4 : 12}
              key={video.id}
            >
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: viewMode === 'list' ? 'row' : 'column',
                  height: '100%',
                }}
              >
                {video.thumbnail_url && (
                  <CardMedia
                    component="img"
                    sx={{
                      width: viewMode === 'list' ? 200 : '100%',
                      height: viewMode === 'list' ? 'auto' : 200,
                      objectFit: 'cover',
                    }}
                    image={video.thumbnail_url}
                    alt={video.title}
                  />
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {video.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                        color={getStatusColor(video.status)}
                        size="small"
                      />
                      <Chip
                        label={new Date(video.created_at).toLocaleDateString()}
                        variant="outlined"
                        size="small"
                      />
                    </Stack>
                    {video.status === 'processing' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <CircularProgress
                          variant="determinate"
                          value={video.progress}
                          size={20}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" component="span">
                          {video.progress}%
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    {video.status === 'completed' && (
                      <>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleViewAnalysis(video.id)}
                        >
                          View Analysis
                        </Button>
                        <Tooltip title="Download Report">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDownloadReport(video.id, video.title)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </CardActions>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredAndSortedVideos.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No videos found. Try adjusting your filters or upload a new video.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 