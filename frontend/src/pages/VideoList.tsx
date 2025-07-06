import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
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
  tags: string[];
  uploadDate: string;
  views: number;
}

const procedureTypes = [
  'All',
  'Laparoscopic Cholecystectomy',
  'Appendectomy',
  'Hernia Repair',
  'Gastric Bypass',
  'Colon Resection',
  'Other',
];

const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'duration', label: 'Duration' },
];

const VideoList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, selectedProcedure, selectedDifficulty, sortBy, page]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search: searchQuery,
        procedure: selectedProcedure !== 'All' ? selectedProcedure : '',
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : '',
        sort: sortBy,
        page: page.toString(),
      });

      const response = await fetch(`/api/videos?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleProcedureChange = (event: SelectChangeEvent) => {
    setSelectedProcedure(event.target.value);
    setPage(1);
  };

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setSelectedDifficulty(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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

      setVideos((prev) => prev.filter((video) => video.id !== id));
    } catch (err) {
      setError('Failed to delete video. Please try again.');
    }
  };

  const handleShareVideo = (id: number) => {
    // Implement share functionality
    console.log('Share video:', id);
  };

  if (loading && !videos.length) {
    return <LoadingSpinner message="Loading videos..." />;
  }

  return (
    <ErrorBoundary>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Surgical Videos</Typography>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={() => navigate('/upload')}
          >
            Upload Video
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters and Search */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search videos..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Procedure Type</InputLabel>
              <Select
                value={selectedProcedure}
                label="Procedure Type"
                onChange={handleProcedureChange}
              >
                {procedureTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={selectedDifficulty}
                label="Difficulty"
                onChange={handleDifficultyChange}
              >
                {difficultyLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Video Grid */}
        <Grid container spacing={3}>
          {videos.map((video) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <VideoCard
                {...video}
                onDelete={handleDeleteVideo}
                onShare={handleShareVideo}
              />
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
};

export default VideoList; 