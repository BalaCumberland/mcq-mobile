#!/bin/bash

# MCQ Mobile App Release Script
# Version: 1.8.3

echo "🚀 Starting MCQ Mobile App Release Process..."
echo "Version: 1.8.3"
echo "=================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Build release APK
echo "📦 Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📱 APK Location: android/app/build/outputs/apk/release/"
    
    # List generated APKs
    echo "📋 Generated APKs:"
    ls -la app/build/outputs/apk/release/*.apk
    
    echo ""
    echo "🎉 Release v1.8.3 completed successfully!"
    echo "📂 Find your APK files in: android/app/build/outputs/apk/release/"
else
    echo "❌ Build failed!"
    exit 1
fi