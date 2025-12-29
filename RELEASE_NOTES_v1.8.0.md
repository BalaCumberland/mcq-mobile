# Release Notes v1.8.0 - Question Image Rendering Fix

## 🎯 Overview
Fixed image rendering in question descriptions to match the functionality already working in answer options and explanations.

## 🐛 Bug Fixes

### Question Image Rendering
- **Fixed**: Images in question descriptions now render properly
- **Issue**: Question descriptions were not displaying images while answer options and explanations were working correctly
- **Solution**: Enhanced LaTeXRenderer component to better handle image URLs mixed with text content

## 🔧 Technical Changes

### LaTeXRenderer Component Updates
- Added `IMAGE_URL_REGEX` for comprehensive image URL detection
- Improved text splitting logic to handle image URLs mixed with regular text
- Enhanced support for HTTP/HTTPS URLs with query parameters
- Maintains backward compatibility with existing LaTeX and SMILES rendering

### Supported Image Formats
- JPG/JPEG
- PNG
- GIF
- BMP
- WEBP

## 📱 User Experience
- Question descriptions now consistently display images alongside text
- Maintains existing functionality for answer options and explanations
- No changes to user interface or interaction patterns

## 🧪 Testing
- Verified image rendering in question descriptions
- Confirmed continued functionality in answer options
- Tested with various image URL formats and mixed content

## 📦 Build Information
- Version: 1.8.0
- Build Date: January 2025
- Platform: React Native 0.80.1

---

**Note**: This is a bug fix release focused on improving content rendering consistency across all quiz components.