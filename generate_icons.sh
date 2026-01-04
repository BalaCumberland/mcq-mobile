#!/bin/bash

# ExamSphere Android Icon Generator Script
# This script converts the SVG icon to all required Android icon sizes

echo "🎓 ExamSphere Icon Generator"
echo "=============================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it first:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Create directories if they don't exist
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi

echo "📱 Generating Android app icons..."

# Generate regular icons
convert examphere_icon.svg -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert examphere_icon.svg -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert examphere_icon.svg -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert examphere_icon.svg -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert examphere_icon.svg -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Generate round icons (same as regular for this design)
convert examphere_icon.svg -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
convert examphere_icon.svg -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
convert examphere_icon.svg -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
convert examphere_icon.svg -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
convert examphere_icon.svg -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

echo "✅ Icons generated successfully!"
echo ""
echo "📋 Generated files:"
echo "   • mipmap-mdpi/ic_launcher.png (48x48)"
echo "   • mipmap-hdpi/ic_launcher.png (72x72)"
echo "   • mipmap-xhdpi/ic_launcher.png (96x96)"
echo "   • mipmap-xxhdpi/ic_launcher.png (144x144)"
echo "   • mipmap-xxxhdpi/ic_launcher.png (192x192)"
echo ""
echo "🚀 Next steps:"
echo "   1. Clean and rebuild your Android app"
echo "   2. The new ExamSphere icon will appear on your device!"
echo ""
echo "   Commands to rebuild:"
echo "   cd android && ./gradlew clean"
echo "   npx react-native run-android"