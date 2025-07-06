import React from 'react';
import { View, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Button, Title, Paragraph, Surface } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/config';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Surface style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Surface>
        
        <Title style={styles.title}>Surgical Education Platform</Title>
        <Paragraph style={styles.subtitle}>
          Enhance your surgical skills with AI-powered video analysis
        </Paragraph>

        <View style={styles.features}>
          <Paragraph style={styles.feature}>✓ Record surgical procedures</Paragraph>
          <Paragraph style={styles.feature}>✓ Get AI-powered feedback</Paragraph>
          <Paragraph style={styles.feature}>✓ Collaborate with experts</Paragraph>
          <Paragraph style={styles.feature}>✓ Track your progress</Paragraph>
        </View>

        <Button
          mode="contained"
          onPress={login}
          style={styles.loginButton}
          contentStyle={styles.loginButtonContent}
        >
          Sign In with Institution
        </Button>

        <Paragraph style={styles.disclaimer}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Paragraph>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  features: {
    marginBottom: 48,
  },
  feature: {
    fontSize: 16,
    marginVertical: 4,
    color: COLORS.text,
  },
  loginButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 16,
    paddingHorizontal: 20,
  },
});

export default LoginScreen;
