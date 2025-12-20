#!/bin/bash

# MCQ Mobile Release Script - v1.6.3

echo "🚀 MCQ Mobile Dynamic Layout Release v1.6.3"
echo "==========================================="

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
cp android/app/build/outputs/apk/release/app-arm64-v8a-release.apk ./MCQMobile-v1.6.3-dynamic-layout-release.apk

# Get APK size
APK_SIZE=$(du -h MCQMobile-v1.6.3-dynamic-layout-release.apk | cut -f1)

echo ""
echo "✅ Dynamic layout release completed!"
echo "📱 APK: MCQMobile-v1.6.3-dynamic-layout-release.apk"
echo "📏 Size: $APK_SIZE"
echo ""
echo "🎯 New Features v1.6.3:"
echo "• Dynamic question content sizing"
echo "• Options follow question content naturally"
echo "• Single unified scroll container"
echo "• Removed fixed height constraints"
echo "• Improved content flow and readability"
echo ""
echo "⚡ Optimizations:"
echo "• ARM64 only build"
echo "• ProGuard enabled"
echo "• Resource shrinking"
echo "• Build cache enabled"
echo "• Performance optimizations"
echo ""
echo "📋 Ready for distribution!"