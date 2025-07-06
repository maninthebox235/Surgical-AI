import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip, ActivityIndicator, Searchbar, FAB } from 'react-native-paper';
import { Video } from '../types';
import { COLORS } from '../constants/config';
import api from '../services/api';

const VideosScreen: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockVideos: Video[] = [
        {
          id: '1',
          title: 'Laparoscopic Cholecystectomy',
          description: 'Standard gallbladder removal procedure',
          url: 'https://example.com/video1.mp4',
          duration: 3600,
          uploaderId: 'user1',
          uploadedAt: new Date().toISOString(),
          procedureType: 'Cholecystectomy',
          status: 'analyzed',
          tags: ['laparoscopic', 'gallbladder'],
        },
        {
          id: '2',
          title: 'Appendectomy Procedure',
          description: 'Emergency appendix removal',
          url: 'https://example.com/video2.mp4',
          duration: 2700,
          uploaderId: 'user1',
          uploadedAt: new Date().toISOString(),
          procedureType: 'Appendectomy',
          status: 'processing',
          tags: ['emergency', 'appendix'],
        },
      ];
      setVideos(mockVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed':
        return COLORS.success;
      case 'processing':
        return COLORS.warning;
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <Card
      style={styles.videoCard}
      onPress={() => console.log('Video pressed:', item.id)}
    >
      <Card.Cover source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/400x200' }} />
      <Card.Content style={styles.cardContent}>
        <Title style={styles.videoTitle}>{item.title}</Title>
        <Paragraph style={styles.videoDescription}>{item.description}</Paragraph>
        <View style={styles.metadata}>
          <Chip style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            {item.status}
          </Chip>
          <Paragraph style={styles.duration}>{formatDuration(item.duration)}</Paragraph>
        </View>
        <View style={styles.tags}>
          {item.tags?.map((tag, index) => (
            <Chip key={index} style={styles.tag}>
              {tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search videos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={videos.filter(v => 
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.procedureType.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 80,
  },
  videoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    paddingTop: 12,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  statusChip: {
    height: 24,
  },
  duration: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
    marginTop: 4,
    height: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default VideosScreen;
