#!/bin/bash

# MCQ Mobile Release Script - Optimized Size
# LaTeX & SMILES Support Release v1.4.0

echo "🚀 MCQ Mobile Optimized Release v1.4.0"
echo "======================================="

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
cp android/app/build/outputs/apk/release/app-arm64-v8a-release.apk ./MCQMobile-v1.4.0-optimized-release.apk

# Get APK size
APK_SIZE=$(du -h MCQMobile-v1.4.0-optimized-release.apk | cut -f1)

echo ""
echo "✅ Optimized release completed!"
echo "📱 APK: MCQMobile-v1.4.0-optimized-release.apk"
echo "📏 Size: $APK_SIZE"
echo ""
echo "⚡ Optimizations:"
echo "• ARM64 only build"
echo "• ProGuard enabled"
echo "• Resource shrinking"
echo "• Build cache enabled"
echo ""
echo "🧪 Features:"
echo "• LaTeX formula rendering"
echo "• SMILES chemical structures"
echo "• Enhanced quiz content"
echo ""
echo "📋 Ready for distribution!"