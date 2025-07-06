# Surgical Education Mobile App

AI-powered surgical education platform for iOS and Android devices.

## Features

- Record surgical procedures with in-app camera
- AI-powered analysis of surgical techniques
- Real-time feedback and scoring
- Collaborative annotations and expert feedback
- Offline video playback
- Secure authentication with institutional SSO

## Development Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS: Xcode 14+ (Mac only)
- Android: Android Studio

### Installation
```bash
cd mobile/SurgicalEducation
npm install
```

### Environment Setup
Create a `.env` file:
```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your-client-id
EXPO_PUBLIC_AUTH0_AUDIENCE=your-audience
```

### Running the App

#### iOS Simulator (Mac only)
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

#### Physical Device (Expo Go)
```bash
npm start
```
Scan the QR code with Expo Go app

## Building for App Stores

### Setup EAS
```bash
eas login
eas build:configure
```

### iOS App Store Build
1. Update `eas.json` with your Apple Developer credentials
2. Build:
   ```bash
   eas build --platform ios --profile production
   ```
3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

### Android Play Store Build
1. Generate upload key:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore upload-key.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Update `eas.json` with your Google Play credentials
3. Build:
   ```bash
   eas build --platform android --profile production
   ```
4. Submit to Play Store:
   ```bash
   eas submit --platform android
   ```

## App Store Requirements

### iOS
- Apple Developer Account ($99/year)
- App Store Connect setup
- Privacy policy URL
- App screenshots (6.5", 5.5" displays)
- App icon (1024x1024)

### Android
- Google Play Developer Account ($25 one-time)
- Play Console setup
- Privacy policy URL
- Feature graphic (1024x500)
- Screenshots (phone, tablet)
- App icon (512x512)

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Security & Compliance

- HIPAA compliant data handling
- End-to-end encryption for video uploads
- Secure token storage using Expo SecureStore
- No patient identifying information stored locally

## Support

For issues or questions, contact: support@surgicaleducation.com