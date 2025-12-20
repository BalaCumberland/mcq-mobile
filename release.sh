#!/bin/bash

# MCQ Mobile Release Script - v1.6.4

echo "🚀 MCQ Mobile Safe Area Fix Release v1.6.4"
echo "=========================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Build optimized release APK
echo "📦 Building optimized release APK..."
./gradlew assembleRelease --build-cache

# Copy smallest APK to root
echo "📋 Copying optimized APK..."
cd ..
cp android/app/build/outputs/apk/release/app-arm64-v8a-release.apk ./MCQMobile-v1.6.4-safe-area-release.apk

# Get APK size
APK_SIZE=$(du -h MCQMobile-v1.6.4-safe-area-release.apk | cut -f1)

echo ""
echo "✅ Safe area fix release completed!"
echo "📱 APK: MCQMobile-v1.6.4-safe-area-release.apk"
echo "📏 Size: $APK_SIZE"
echo ""
echo "🐛 Bug Fixes v1.6.4:"
echo "• Added SafeAreaView to questions panel modal"
echo "• Consistent safe area handling across all screens"
echo "• Proper spacing on devices with notches/home indicators"
echo ""
echo "⚡ Optimizations:"
echo "• ARM64 only build"
echo "• ProGuard enabled"
echo "• Resource shrinking"
echo "• Build cache enabled"
echo "• Performance optimizations"
echo ""
echo "📋 Ready for distribution!"