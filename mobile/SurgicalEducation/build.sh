#!/bin/bash

# Surgical Education App Build Script

echo "🏥 Surgical Education App Build Script"
echo "====================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if logged in to EAS
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to EAS. Please run: eas login"
    exit 1
fi

# Function to build for iOS
build_ios() {
    echo "📱 Building for iOS..."
    eas build --platform ios --profile production --non-interactive
}

# Function to build for Android
build_android() {
    echo "🤖 Building for Android..."
    eas build --platform android --profile production --non-interactive
}

# Function to build for both platforms
build_all() {
    build_ios
    build_android
}

# Menu
echo ""
echo "Select build option:"
echo "1) iOS only"
echo "2) Android only"
echo "3) Both platforms"
echo "4) Development build (both platforms)"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        build_ios
        ;;
    2)
        build_android
        ;;
    3)
        build_all
        ;;
    4)
        echo "🔧 Building development versions..."
        eas build --platform all --profile development --non-interactive
        ;;
    5)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Build process initiated!"
echo "Check the EAS dashboard for build status: https://expo.dev"