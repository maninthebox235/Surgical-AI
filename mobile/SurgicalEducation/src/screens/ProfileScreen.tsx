import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Title, Paragraph, List, Divider, Button, Card } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/config';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <Title style={styles.userName}>{user?.name || 'User'}</Title>
          <Paragraph style={styles.userEmail}>{user?.email}</Paragraph>
          <Paragraph style={styles.userRole}>
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
          </Paragraph>
        </View>
      </Card>

      <Card style={styles.settingsCard}>
        <List.Section>
          <List.Subheader>Account Settings</List.Subheader>
          <List.Item
            title="Edit Profile"
            description="Update your personal information"
            left={props => <List.Icon {...props} icon="account-edit" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Change Password"
            description="Update your password"
            left={props => <List.Icon {...props} icon="lock-reset" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Notifications"
            description="Manage notification preferences"
            left={props => <List.Icon {...props} icon="bell" />}
            onPress={() => {}}
          />
        </List.Section>
      </Card>

      <Card style={styles.settingsCard}>
        <List.Section>
          <List.Subheader>App Settings</List.Subheader>
          <List.Item
            title="Video Quality"
            description="Adjust recording quality settings"
            left={props => <List.Icon {...props} icon="video-outline" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Download Settings"
            description="Manage offline content"
            left={props => <List.Icon {...props} icon="download" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Privacy"
            description="View privacy policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => {}}
          />
        </List.Section>
      </Card>

      <Card style={styles.settingsCard}>
        <List.Section>
          <List.Subheader>Support</List.Subheader>
          <List.Item
            title="Help Center"
            description="Get help and support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Contact Support"
            description="Report issues or get assistance"
            left={props => <List.Icon {...props} icon="email" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="About"
            description="Version 1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => {}}
          />
        </List.Section>
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={logout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          buttonColor={COLORS.error}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  logoutContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    width: '100%',
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
});

export default ProfileScreen;