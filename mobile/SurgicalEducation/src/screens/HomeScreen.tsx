import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, Surface, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/config';
import api from '../services/api';

interface Stats {
  totalVideos: number;
  averageScore: number;
  improvementRate: number;
  recentAnalyses: number;
}

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<Stats>({
    totalVideos: 0,
    averageScore: 0,
    improvementRate: 0,
    recentAnalyses: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In production, this would fetch real data from the API
      // For now, using mock data
      setStats({
        totalVideos: 12,
        averageScore: 85.5,
        improvementRate: 12.3,
        recentAnalyses: 3,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.greeting}>Welcome back, {user?.name || 'Student'}!</Title>
        <Paragraph style={styles.subtitle}>
          Track your surgical education progress
        </Paragraph>
      </View>

      <View style={styles.statsGrid}>
        <Surface style={styles.statCard}>
          <Avatar.Icon size={48} icon="video" style={styles.statIcon} />
          <Title style={styles.statValue}>{stats.totalVideos}</Title>
          <Paragraph style={styles.statLabel}>Total Videos</Paragraph>
        </Surface>

        <Surface style={styles.statCard}>
          <Avatar.Icon size={48} icon="star" style={styles.statIcon} />
          <Title style={styles.statValue}>{stats.averageScore}%</Title>
          <Paragraph style={styles.statLabel}>Average Score</Paragraph>
        </Surface>

        <Surface style={styles.statCard}>
          <Avatar.Icon size={48} icon="trending-up" style={styles.statIcon} />
          <Title style={styles.statValue}>+{stats.improvementRate}%</Title>
          <Paragraph style={styles.statLabel}>Improvement</Paragraph>
        </Surface>

        <Surface style={styles.statCard}>
          <Avatar.Icon size={48} icon="chart-line" style={styles.statIcon} />
          <Title style={styles.statValue}>{stats.recentAnalyses}</Title>
          <Paragraph style={styles.statLabel}>Recent Analyses</Paragraph>
        </Surface>
      </View>

      <Card style={styles.actionCard}>
        <Card.Title title="Quick Actions" />
        <Card.Content>
          <Button
            mode="contained"
            icon="camera"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Record' as never)}
          >
            Record New Procedure
          </Button>
          <Button
            mode="outlined"
            icon="play-circle"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Videos' as never)}
          >
            View Recent Videos
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.tipsCard}>
        <Card.Title title="Tips for Better Recordings" />
        <Card.Content>
          <Paragraph style={styles.tip}>
            • Ensure good lighting on the surgical field
          </Paragraph>
          <Paragraph style={styles.tip}>
            • Keep the camera steady using a tripod or mount
          </Paragraph>
          <Paragraph style={styles.tip}>
            • Record the entire procedure from start to finish
          </Paragraph>
          <Paragraph style={styles.tip}>
            • Include clear views of key technique moments
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  statIcon: {
    backgroundColor: COLORS.primary + '20',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionCard: {
    margin: 16,
    marginTop: 0,
  },
  actionButton: {
    marginVertical: 8,
  },
  tipsCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
  },
  tip: {
    fontSize: 14,
    color: COLORS.text,
    marginVertical: 4,
  },
});

export default HomeScreen;
