import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VideoLibrary as VideoIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { getProfile, updateProfile } from '../services/api';

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  institution: string;
  specialty: string;
  bio: string;
  joinDate: string;
  stats: {
    totalVideos: number;
    totalAnnotations: number;
    totalAnalysis: number;
  };
  recentActivity: Activity[];
}

interface Activity {
  id: number;
  type: 'video' | 'annotation' | 'analysis';
  title: string;
  timestamp: string;
  details: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      // Mock additional profile data for now since backend only has basic user fields
      const profileData = {
        ...data,
        institution: data.institution || '',
        specialty: data.specialty || '',
        bio: data.bio || '',
        joinDate: data.created_at || new Date().toISOString(),
        stats: {
          totalVideos: 0,
          totalAnnotations: 0,
          totalAnalysis: 0,
        },
        recentActivity: [],
      };
      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile || {});
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedProfile = await updateProfile(editedProfile);
      setProfile({ ...profile, ...updatedProfile });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Profile not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: 'primary.main',
              }}
            >
              {profile.fullName.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4">{profile.fullName}</Typography>
                {!isEditing && (
                  <IconButton onClick={handleEdit} color="primary">
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile.role} • Joined {new Date(profile.joinDate).toLocaleDateString()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip icon={<SchoolIcon />} label={profile.institution} />
                <Chip icon={<WorkIcon />} label={profile.specialty} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Profile Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="Profile" />
              <Tab label="Activity" />
              <Tab label="Statistics" />
            </Tabs>

            {activeTab === 0 && (
              <Box>
                {isEditing ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={editedProfile.fullName}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Institution"
                        name="institution"
                        value={editedProfile.institution}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Specialty"
                        name="specialty"
                        value={editedProfile.specialty}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Bio"
                        name="bio"
                        value={editedProfile.bio}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSave}
                          disabled={loading}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      About
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {profile.bio || 'No bio provided.'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary={profile.email}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SchoolIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Institution"
                          secondary={profile.institution}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <WorkIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Specialty"
                          secondary={profile.specialty}
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <List>
                {profile.recentActivity.map((activity) => (
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
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}

            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      Total Videos
                    </Typography>
                    <Typography variant="h3">
                      {profile.stats.totalVideos}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      Total Annotations
                    </Typography>
                    <Typography variant="h3">
                      {profile.stats.totalAnnotations}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      AI Analysis
                    </Typography>
                    <Typography variant="h3">
                      {profile.stats.totalAnalysis}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <VideoIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Videos Uploaded"
                  secondary={profile.stats.totalVideos}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Annotations Created"
                  secondary={profile.stats.totalAnnotations}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="AI Analysis"
                  secondary={profile.stats.totalAnalysis}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Profile; 