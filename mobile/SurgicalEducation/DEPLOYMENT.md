# Surgical Education App - Deployment Guide

## Overview
This guide covers the complete deployment process for the Surgical Education mobile app to both Apple App Store and Google Play Store.

## Prerequisites

### Required Accounts
- **Apple Developer Account** ($99/year) - Required for iOS deployment
- **Google Play Developer Account** ($25 one-time) - Required for Android deployment
- **Expo Account** (free) - Required for build service

### Required Tools
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

## Setup Process

### 1. Environment Configuration
Create `.env` file from template:
```bash
cp .env.example .env
```

Fill in your configuration:
- `EXPO_PUBLIC_API_URL`: Your backend API URL
- `EXPO_PUBLIC_AUTH0_DOMAIN`: Your Auth0 domain
- `EXPO_PUBLIC_AUTH0_CLIENT_ID`: Your Auth0 client ID
- `EXPO_PUBLIC_AUTH0_AUDIENCE`: Your Auth0 API audience

### 2. EAS Setup
```bash
# Login to Expo
eas login

# Configure EAS builds
eas build:configure

# Update app.json with your project ID
# Get project ID from: https://expo.dev
```

### 3. iOS Setup

#### Apple Developer Account Setup
1. Create/login to Apple Developer Account
2. Create App ID in Developer Portal
3. Create App Store Connect app
4. Generate certificates and provisioning profiles

#### Update iOS Configuration
In `eas.json`, update:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

### 4. Android Setup

#### Google Play Console Setup
1. Create/login to Google Play Console
2. Create new app
3. Generate upload key for app signing

#### Generate Android Upload Key
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore upload-key.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

#### Update Android Configuration
In `eas.json`, update:
```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path-to-service-account-key.json",
        "track": "production"
      }
    }
  }
}
```

## Building the App

### Quick Build (Recommended)
```bash
./build.sh
```

### Manual Build Commands

#### iOS Build
```bash
eas build --platform ios --profile production
```

#### Android Build
```bash
eas build --platform android --profile production
```

#### Both Platforms
```bash
eas build --platform all --profile production
```

## App Store Submission

### iOS App Store
1. Build completes automatically
2. Review build in App Store Connect
3. Submit for review:
   ```bash
   eas submit --platform ios
   ```

### Google Play Store
1. Build completes automatically
2. Upload APK/AAB to Play Console
3. Submit for review:
   ```bash
   eas submit --platform android
   ```

## Required App Store Assets

### iOS
- App icon: 1024x1024 PNG
- Screenshots: 6.5" and 5.5" displays
- Privacy policy URL
- App description
- Keywords
- Support URL

### Android
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: Phone and tablet
- Privacy policy URL
- App description
- Content rating

## Pre-Submission Checklist

### Technical Requirements
- [ ] App builds successfully
- [ ] All features work on physical devices
- [ ] Camera and microphone permissions work
- [ ] Authentication flow works
- [ ] Video recording/playback works
- [ ] API integration works
- [ ] Offline functionality works
- [ ] No crashes or critical bugs

### App Store Requirements
- [ ] App icon created and added
- [ ] Screenshots captured
- [ ] App description written
- [ ] Privacy policy created and hosted
- [ ] Terms of service created
- [ ] Support contact information provided
- [ ] Age rating determined
- [ ] Keywords/categories selected

### Compliance
- [ ] HIPAA compliance verified
- [ ] Privacy policy covers all data collection
- [ ] Terms of service covers medical use
- [ ] Age restrictions properly set
- [ ] Content warnings added if needed

## Common Issues & Solutions

### Build Failures
- **Missing dependencies**: Run `npm install` and try again
- **Platform incompatibility**: Check Expo SDK version compatibility
- **Certificate issues**: Regenerate certificates in Apple Developer Portal

### Submission Rejections
- **Privacy policy**: Ensure policy covers all app functionality
- **Medical content**: Include appropriate disclaimers
- **Performance**: Test on multiple devices and fix crashes

## Monitoring & Updates

### Analytics
- Set up crash reporting (Sentry, Bugsnag)
- Monitor app performance
- Track user engagement

### Updates
- Use Expo OTA updates for minor fixes
- Plan regular app store updates
- Monitor user feedback and reviews

## Support

For deployment issues:
- Check Expo documentation: https://docs.expo.dev
- Review platform-specific guidelines
- Contact support@surgicaleducation.com

## Security Notes

- Never commit sensitive keys to version control
- Use environment variables for all secrets
- Regularly rotate API keys and certificates
- Monitor for security vulnerabilities in dependencies