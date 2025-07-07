import React, { useState } from 'react';
import { Box, Button, Container, Typography, LinearProgress, Paper, TextField, Alert, Card, CardContent, IconButton, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, VideoFile, CheckCircle, School, TrendingUp } from '@mui/icons-material';
import { createVideo, uploadVideoFile, processVideo } from '../services/api';
import SuccessAnimation from '../components/animations/SuccessAnimation';

const VideoUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'video/mp4' || file.type === 'video/quicktime') {
        setSelectedFile(file);
        setError(null);
        // Auto-populate title from filename if empty
        if (!title) {
          const filename = file.name.replace(/\.[^/.]+$/, '');
          setTitle(filename);
        }
      } else {
        setError('Please select an MP4 or MOV file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Create video entry and get upload URL
      const videoResponse = await createVideo(title.trim(), description.trim());
      const { upload_url, video_id } = videoResponse;

      // Step 2: Upload file to S3
      await uploadVideoFile(upload_url, selectedFile, setUploadProgress);

      // Step 3: Start video processing
      await processVideo(video_id);

      setSuccess(true);
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setUploadProgress(0);

      // Navigate to dashboard after successful upload
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    setError(null);
    setSuccess(false);
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Upload Surgical Video
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Upload your surgical procedure video for AI analysis. Supported formats: MP4, MOV
          </Typography>

          <Box sx={{ my: 3 }}>
            <TextField
              fullWidth
              label="Video Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              disabled={uploading}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={3}
              disabled={uploading}
            />
          </Box>

          <Box sx={{ my: 3 }}>
            <input
              accept="video/mp4,video/quicktime"
              style={{ display: 'none' }}
              id="video-upload"
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <label htmlFor="video-upload">
              <Button
                variant="outlined"
                component="span"
                disabled={uploading}
                sx={{ mr: 2 }}
              >
                Select Video File
              </Button>
            </label>
            {selectedFile && title.trim() && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={uploading}
                sx={{ mr: 2 }}
              >
                Upload & Process
              </Button>
            )}
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
          </Box>

          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          )}

          {uploading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Uploading: {uploadProgress}%
              </Typography>
            </Box>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Video uploaded successfully! Processing started. Redirecting to dashboard...
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VideoUpload;