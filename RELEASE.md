# MCQ Mobile - Release Guide

## 📱 Release APK Generation

This document explains how to create release APKs for the MCQ Mobile application.

### Quick Release

To create a release APK quickly, run:

```bash
npm run release
```

This will:
- Clean previous builds
- Build a release APK
- Copy it to the root directory with version naming
- Show APK information

### Manual Release

If you prefer to build manually:

```bash
# Clean build
cd android
./gradlew clean

# Build release APK
./gradlew assembleRelease

# APK will be located at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Release Checklist

Before creating a release:

1. ✅ Update version in `package.json`
2. ✅ Test the app thoroughly
3. ✅ Update `android/app/build.gradle` versionCode if needed
4. ✅ Ensure all dependencies are up to date
5. ✅ Test on different devices/screen sizes
6. ✅ Verify Firebase configuration
7. ✅ Check app permissions

### APK Information

- **Current Version**: 1.0.2
- **Target SDK**: 35
- **Min SDK**: 24
- **Architecture**: armeabi-v7a, arm64-v8a, x86, x86_64

### Installation

To install the APK on a device:

```bash
adb install MCQMobile-v1.0.2-release.apk
```

### Troubleshooting

**Build fails with CMake errors:**
- Ensure `newArchEnabled=false` in `android/gradle.properties`
- Clean build: `cd android && ./gradlew clean`

**APK size too large:**
- Enable ProGuard in release builds
- Remove unused resources
- Use APK splitting for different architectures

**App crashes on startup:**
- Check Firebase configuration
- Verify all native dependencies are properly linked
- Test on different Android versions

### Notes

- The release APK is signed with the debug keystore for development
- For production releases, use a proper release keystore
- Always test the release APK before distribution