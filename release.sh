#!/bin/bash

# MCQ Mobile Release Script
# Professional UI Release v1.1.0

echo "🚀 MCQ Mobile Professional UI Release v1.1.0"
echo "=============================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Build release APK
echo "📦 Building release APK..."
./gradlew assembleRelease

# Copy APK to root with version name
echo "📋 Copying APK to root directory..."
cd ..
cp android/app/build/outputs/apk/release/app-release.apk ./MCQMobile-v1.1.0-professional-ui-release.apk

# Get APK size
APK_SIZE=$(du -h MCQMobile-v1.1.0-professional-ui-release.apk | cut -f1)

echo ""
echo "✅ Release build completed successfully!"
echo "📱 APK: MCQMobile-v1.1.0-professional-ui-release.apk"
echo "📏 Size: $APK_SIZE"
echo ""
echo "🎨 New Features in v1.1.0:"
echo "• Professional design system with web UI parity"
echo "• Enhanced user interface with modern styling"
echo "• Improved form elements and button designs"
echo "• Better color consistency and typography"
echo "• Professional card layouts and shadows"
echo ""
echo "📋 Ready for distribution!"