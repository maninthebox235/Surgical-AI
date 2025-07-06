import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { Button, IconButton, Title, Surface, Portal, Dialog, TextInput } from 'react-native-paper';
import { COLORS, VIDEO_UPLOAD_SIZE_LIMIT } from '../constants/config';
import api from '../services/api';

const RecordScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [procedureType, setProcedureType] = useState('');
  const cameraRef = useRef<CameraView>(null);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      // Camera permission is handled by useCameraPermissions hook
    })();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setRecordingDuration(0);
      const video = await cameraRef.current?.recordAsync({
        maxDuration: 3600, // 1 hour max
      });
      if (video) {
        setRecordedVideoUri(video.uri);
        setShowUploadDialog(true);
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Recording Error', 'Failed to record video. Please try again.');
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    // Note: CameraView doesn't support pause/resume like the old Camera
    // This would need to be implemented differently or removed
    setIsPaused(true);
  };

  const resumeRecording = () => {
    // Note: CameraView doesn't support pause/resume like the old Camera
    setIsPaused(false);
  };

  const uploadVideo = async () => {
    if (!recordedVideoUri || !videoTitle || !procedureType) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('video', {
        uri: recordedVideoUri,
        type: 'video/mp4',
        name: `${videoTitle.replace(/\s+/g, '_')}.mp4`,
      } as any);
      formData.append('title', videoTitle);
      formData.append('description', videoDescription);
      formData.append('procedureType', procedureType);
      formData.append('duration', recordingDuration.toString());

      await api.uploadVideo(formData);
      
      Alert.alert('Success', 'Video uploaded successfully! AI analysis will begin shortly.');
      setShowUploadDialog(false);
      resetForm();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Error', 'Failed to upload video. Please try again.');
    }
  };

  const resetForm = () => {
    setVideoTitle('');
    setVideoDescription('');
    setProcedureType('');
    setRecordedVideoUri(null);
    setRecordingDuration(0);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Title style={styles.permissionText}>
          Camera and microphone permissions are required to record videos.
        </Title>
        <Button mode="contained" onPress={requestPermission}>
          Grant Permissions
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.overlay}>
          {isRecording && (
            <Surface style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Title style={styles.recordingTime}>{formatTime(recordingDuration)}</Title>
            </Surface>
          )}
        </View>
      </CameraView>

      <View style={styles.controls}>
        {!isRecording ? (
          <IconButton
            icon="record-circle"
            size={72}
            iconColor="red"
            onPress={startRecording}
          />
        ) : (
          <View style={styles.recordingControls}>
            {isPaused ? (
              <IconButton
                icon="play"
                size={48}
                iconColor={COLORS.primary}
                onPress={resumeRecording}
              />
            ) : (
              <IconButton
                icon="pause"
                size={48}
                iconColor={COLORS.primary}
                onPress={pauseRecording}
              />
            )}
            <IconButton
              icon="stop"
              size={72}
              iconColor="red"
              onPress={stopRecording}
            />
          </View>
        )}
      </View>

      <Portal>
        <Dialog visible={showUploadDialog} onDismiss={() => setShowUploadDialog(false)}>
          <Dialog.Title>Upload Video</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Video Title *"
              value={videoTitle}
              onChangeText={setVideoTitle}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Procedure Type *"
              value={procedureType}
              onChangeText={setProcedureType}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={videoDescription}
              onChangeText={setVideoDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button onPress={uploadVideo}>Upload</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 8,
  },
  recordingTime: {
    color: 'white',
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 16,
  },
});

export default RecordScreen;