#!/bin/bash

# MCQ Mobile Release Script
# This script builds a release APK for the MCQ Mobile app

set -e

echo "🚀 Starting MCQ Mobile Release Build..."

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo "📦 Building version: $VERSION"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Build release APK
echo "🔨 Building release APK..."
./gradlew assembleRelease

# Copy APK to root with version name
echo "📱 Copying APK to root directory..."
cd ..
cp android/app/build/outputs/apk/release/app-release.apk "./MCQMobile-v${VERSION}-release.apk"

echo "✅ Release APK created successfully!"
echo "📍 Location: MCQMobile-v${VERSION}-release.apk"
echo "📊 APK Size: $(du -h MCQMobile-v${VERSION}-release.apk | cut -f1)"

# Show APK info
if command -v aapt &> /dev/null; then
    echo "📋 APK Info:"
    aapt dump badging "MCQMobile-v${VERSION}-release.apk" | grep -E "(package|application-label|sdkVersion|targetSdkVersion)"
fi

echo "🎉 Release build completed!"