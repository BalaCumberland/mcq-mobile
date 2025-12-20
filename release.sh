#!/bin/bash

# MCQ Mobile Release Script - v1.6.0

echo "🚀 MCQ Mobile Subject Results Release v1.6.0"
echo "=============================================="

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
cp android/app/build/outputs/apk/release/app-arm64-v8a-release.apk ./MCQMobile-v1.6.0-subject-results-release.apk

# Get APK size
APK_SIZE=$(du -h MCQMobile-v1.6.0-subject-results-release.apk | cut -f1)

echo ""
echo "✅ Subject Results release completed!"
echo "📱 APK: MCQMobile-v1.6.0-subject-results-release.apk"
echo "📏 Size: $APK_SIZE"
echo ""
echo "⚡ Optimizations:"
echo "• ARM64 only build"
echo "• ProGuard enabled"
echo "• Resource shrinking"
echo "• Build cache enabled"
echo "• Performance optimizations"
echo ""
echo "🆕 New Features v1.6.0:"
echo "• Subject-based results screen"
echo "• Paginated test results (8 per page)"
echo "• New window navigation for test reviews"
echo "• Fixed answer scroll reset between questions"
echo "• Enhanced navigation flow"
echo ""
echo "🎨 Previous Features:"
echo "• Visual score circles"
echo "• Status badges"
echo "• Colored result cards"
echo "• Enhanced UI/UX"
echo "• LaTeX & SMILES support"
echo ""
echo "📋 Ready for distribution!"