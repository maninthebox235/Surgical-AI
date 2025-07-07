import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  LinearProgress,
  Paper,
  TextField,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  Avatar,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  VideoFile as VideoFileIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import SuccessAnimation from '../components/animations/SuccessAnimation';

const DropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: 'rgba(103, 126, 234, 0.05)',
  '&:hover': {
    background: 'rgba(103, 126, 234, 0.1)',
    transform: 'scale(1.02)',
  },
  '&.dragover': {
    background: 'rgba(103, 126, 234, 0.15)',
    borderColor: theme.palette.secondary.main,
    transform: 'scale(1.05)',
  },
}));

const FilePreview = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
}));

interface ProcedureType {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  color: string;
}

const procedureTypes: ProcedureType[] = [
  {
    id: 'suturing',
    name: 'Suturing',
    description: 'Basic and advanced suturing techniques',
    difficulty: 'Beginner',
    color: '#4caf50',
  },
  {
    id: 'laparoscopic',
    name: 'Laparoscopic',
    description: 'Minimally invasive procedures',
    difficulty: 'Advanced',
    color: '#f44336',
  },
  {
    id: 'open_surgery',
    name: 'Open Surgery',
    description: 'Traditional surgical approaches',
    difficulty: 'Intermediate',
    color: '#ff9800',
  },
  {
    id: 'microsurgery',
    name: 'Microsurgery',
    description: 'Precision surgical techniques',
    difficulty: 'Advanced',
    color: '#9c27b0',
  },
];

const EnhancedVideoUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Details, 3: Processing

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => 
      file.type === 'video/mp4' || file.type === 'video/quicktime'
    );
    
    if (videoFile) {
      setSelectedFile(videoFile);
      setStep(2);
      if (!title) {
        const filename = videoFile.name.replace(/\.[^/.]+$/, '');
        setTitle(filename);
      }
      setError(null);
    } else {
      setError('Please drop a valid MP4 or MOV video file');
    }
  }, [title]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'video/mp4' || file.type === 'video/quicktime') {
        setSelectedFile(file);
        setStep(2);
        setError(null);
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
    if (!selectedFile || !title.trim() || !selectedProcedure) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setStep(3);
    setError(null);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setShowSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError('Upload failed. Please try again.');
      setStep(2);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setStep(1);
    setUploadProgress(0);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <Container maxWidth="md">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ mt: 4 }}>
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Paper
              sx={{
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Upload Your Surgical Video
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Share your surgical procedure for AI-powered analysis and feedback
              </Typography>
            </Paper>
          </motion.div>

          {/* Progress Steps */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                {[
                  { step: 1, title: 'Upload Video', icon: CloudUploadIcon },
                  { step: 2, title: 'Add Details', icon: VideoFileIcon },
                  { step: 3, title: 'Processing', icon: TrendingUpIcon },
                ].map(({ step: stepNum, title: stepTitle, icon: Icon }) => (
                  <Grid item xs={4} key={stepNum}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        opacity: step >= stepNum ? 1 : 0.5,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <Avatar
                        sx={{
                          mx: 'auto',
                          mb: 1,
                          bgcolor: step >= stepNum ? 'primary.main' : 'grey.300',
                          color: step >= stepNum ? 'white' : 'grey.600',
                        }}
                      >
                        {step > stepNum ? <CheckCircleIcon /> : <Icon />}
                      </Avatar>
                      <Typography variant="caption" display="block">
                        {stepTitle}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="upload"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Paper elevation={3} sx={{ p: 4 }}>
                  <input
                    accept="video/mp4,video/quicktime"
                    style={{ display: 'none' }}
                    id="video-upload"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  
                  <DropZone
                    className={dragOver ? 'dragover' : ''}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                    </motion.div>
                    <Typography variant="h5" gutterBottom>
                      Drop your video here
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      or click to browse files
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Supported formats: MP4, MOV (Max size: 2GB)
                    </Typography>
                  </DropZone>
                </Paper>
              </motion.div>
            )}

            {step === 2 && selectedFile && (
              <motion.div
                key="details"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Paper elevation={3} sx={{ p: 4 }}>
                  {/* File Preview */}
                  <FilePreview>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PlayIcon sx={{ fontSize: 40, mr: 2 }} />
                          <Box>
                            <Typography variant="h6">
                              {selectedFile.name}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {formatFileSize(selectedFile.size)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton onClick={handleRemoveFile} sx={{ color: 'white' }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </FilePreview>

                  {/* Form Fields */}
                  <Box sx={{ mt: 3 }}>
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

                    {/* Procedure Type Selection */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                      Procedure Type
                    </Typography>
                    <Grid container spacing={2}>
                      {procedureTypes.map((procedure) => (
                        <Grid item xs={12} sm={6} key={procedure.id}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border: selectedProcedure === procedure.id ? 2 : 1,
                              borderColor: selectedProcedure === procedure.id ? 'primary.main' : 'grey.300',
                              '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                            onClick={() => setSelectedProcedure(procedure.id)}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="h6">
                                  {procedure.name}
                                </Typography>
                                <Chip
                                  label={procedure.difficulty}
                                  size="small"
                                  sx={{
                                    bgcolor: procedure.color,
                                    color: 'white',
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {procedure.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setStep(1)}
                      disabled={uploading}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleUpload}
                      disabled={uploading || !title.trim() || !selectedProcedure}
                      sx={{ flex: 1 }}
                    >
                      Upload & Analyze
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="processing"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                  </motion.div>
                  <Typography variant="h5" gutterBottom>
                    Processing Your Video
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Our AI is analyzing your surgical technique...
                  </Typography>
                  
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Upload Progress: {uploadProgress}%
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Success Animation */}
          <SuccessAnimation
            show={showSuccess}
            message="Video uploaded successfully!"
            subtitle="Analysis will be ready shortly"
            onComplete={() => setShowSuccess(false)}
            confetti={true}
          />
        </Box>
      </motion.div>
    </Container>
  );
};

export default EnhancedVideoUpload;