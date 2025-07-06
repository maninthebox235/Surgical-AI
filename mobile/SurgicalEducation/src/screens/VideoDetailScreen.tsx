import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Chip, Button, ActivityIndicator, List, FAB } from 'react-native-paper';
import { Video, ResizeMode } from 'expo-av';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Analysis, Annotation, Video as VideoType } from '../types';
import { COLORS } from '../constants/config';
import api from '../services/api';

type VideoDetailRouteProp = RouteProp<RootStackParamList, 'VideoDetail'>;

const VideoDetailScreen: React.FC = () => {
  const route = useRoute<VideoDetailRouteProp>();
  const { videoId } = route.params;
  
  const [video, setVideo] = useState<VideoType | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const videoRef = React.useRef<Video>(null);

  useEffect(() => {
    loadVideoData();
  }, [videoId]);

  const loadVideoData = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockVideo: VideoType = {
        id: videoId,
        title: 'Laparoscopic Cholecystectomy',
        description: 'Standard gallbladder removal procedure performed on a 45-year-old patient',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 3600,
        uploaderId: 'user1',
        uploadedAt: new Date().toISOString(),
        procedureType: 'Cholecystectomy',
        patientAge: 45,
        status: 'analyzed',
        tags: ['laparoscopic', 'gallbladder', 'minimally-invasive'],
      };

      const mockAnalysis: Analysis = {
        id: 'analysis1',
        videoId: videoId,
        techniques: [
          {
            name: 'Trocar Placement',
            timestamp: 120,
            duration: 60,
            confidence: 0.92,
            correct: true,
            feedback: 'Excellent trocar placement technique',
          },
          {
            name: 'Dissection',
            timestamp: 300,
            duration: 180,
            confidence: 0.85,
            correct: true,
            feedback: 'Good dissection with proper tissue handling',
          },
          {
            name: 'Clipping',
            timestamp: 600,
            duration: 90,
            confidence: 0.78,
            correct: false,
            feedback: 'Consider better angle for clip application',
          },
        ],
        overallScore: 85,
        feedback: 'Strong performance overall with room for improvement in clipping technique',
        strengths: ['Excellent port placement', 'Good tissue handling', 'Efficient procedure time'],
        improvements: ['Clip application angle', 'Consider additional safety checks'],
        createdAt: new Date().toISOString(),
        processingTime: 45,
      };

      setVideo(mockVideo);
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error loading video data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const seekToTimestamp = async (seconds: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(seconds * 1000);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: video?.url || '' }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
        />

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>{video?.title}</Title>
            <Paragraph style={styles.description}>{video?.description}</Paragraph>
            <View style={styles.metadata}>
              <Chip style={styles.chip}>{video?.procedureType}</Chip>
              {video?.patientAge && (
                <Chip style={styles.chip}>Age: {video.patientAge}</Chip>
              )}
            </View>
            <View style={styles.tags}>
              {video?.tags?.map((tag, index) => (
                <Chip key={index} style={styles.tag}>
                  {tag}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {analysis && (
          <Card style={styles.analysisCard}>
            <Card.Title title="AI Analysis Results" />
            <Card.Content>
              <View style={styles.scoreContainer}>
                <Title style={styles.scoreLabel}>Overall Score</Title>
                <Title style={[styles.score, { color: analysis.overallScore >= 80 ? COLORS.success : COLORS.warning }]}>
                  {analysis.overallScore}%
                </Title>
              </View>

              <Paragraph style={styles.feedback}>{analysis.feedback}</Paragraph>

              <View style={styles.section}>
                <Title style={styles.sectionTitle}>Strengths</Title>
                {analysis.strengths.map((strength, index) => (
                  <Paragraph key={index} style={styles.listItem}>
                    • {strength}
                  </Paragraph>
                ))}
              </View>

              <View style={styles.section}>
                <Title style={styles.sectionTitle}>Areas for Improvement</Title>
                {analysis.improvements.map((improvement, index) => (
                  <Paragraph key={index} style={styles.listItem}>
                    • {improvement}
                  </Paragraph>
                ))}
              </View>

              <List.Section>
                <List.Subheader>Technique Analysis</List.Subheader>
                {analysis.techniques.map((technique, index) => (
                  <List.Item
                    key={index}
                    title={technique.name}
                    description={`${formatTimestamp(technique.timestamp)} - ${technique.feedback}`}
                    left={props => (
                      <List.Icon
                        {...props}
                        icon={technique.correct ? 'check-circle' : 'alert-circle'}
                        color={technique.correct ? COLORS.success : COLORS.warning}
                      />
                    )}
                    right={() => (
                      <Chip style={{ backgroundColor: COLORS.primary + '20' }}>
                        {Math.round(technique.confidence * 100)}%
                      </Chip>
                    )}
                    onPress={() => seekToTimestamp(technique.timestamp)}
                  />
                ))}
              </List.Section>

              <Button
                mode="contained"
                icon="download"
                style={styles.exportButton}
                onPress={() => {}}
              >
                Export Analysis Report
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        icon="comment-plus"
        style={styles.fab}
        onPress={() => setShowAnnotations(true)}
        label="Add Annotation"
      />
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width,
    height: width * 9 / 16,
    backgroundColor: 'black',
  },
  infoCard: {
    margin: 16,
    elevation: 2,
  },
  description: {
    marginTop: 8,
    color: COLORS.textSecondary,
  },
  metadata: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.primary + '20',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
    marginTop: 4,
  },
  analysisCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 18,
  },
  score: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  feedback: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    marginVertical: 4,
    paddingLeft: 8,
  },
  exportButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default VideoDetailScreen;