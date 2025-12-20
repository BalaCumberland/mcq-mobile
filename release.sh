#!/bin/bash

# MCQ Mobile Release Script - v1.7.0

echo "🚀 MCQ Mobile Leaderboard Release v1.7.0"
echo "========================================"

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
cp android/app/build/outputs/apk/release/app-arm64-v8a-release.apk ./MCQMobile-v1.7.0-leaderboard-release.apk

# Get APK size
APK_SIZE=$(du -h MCQMobile-v1.7.0-leaderboard-release.apk | cut -f1)

echo ""
echo "✅ Leaderboard release completed!"
echo "📱 APK: MCQMobile-v1.7.0-leaderboard-release.apk"
echo "📏 Size: $APK_SIZE"
echo ""
echo "🏆 New Features v1.7.0:"
echo "• Leaderboard screen with class rankings"
echo "• Medal system for top 3 positions (🥇🥈🥉)"
echo "• Real-time score tracking and weighted scoring"
echo "• Production API integration"
echo "• Informational card with ranking mechanics"
echo "• Hamburger menu integration"
echo ""
echo "⚡ Optimizations:"
echo "• ARM64 only build"
echo "• ProGuard enabled"
echo "• Resource shrinking"
echo "• Build cache enabled"
echo "• Performance optimizations"
echo ""
echo "📋 Ready for distribution!"