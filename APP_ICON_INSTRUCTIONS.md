# ExamSphere App Icon Instructions

## Icon Design Specifications:
- **Theme**: Education/Learning
- **Primary Element**: Graduation cap (🎓) or book icon
- **Colors**: Blue gradient (#1e40af to #3b82f6) with white text
- **Text**: "ES" or graduation cap symbol
- **Style**: Modern, clean, professional

## Required Icon Sizes:
- **mdpi**: 48x48px
- **hdpi**: 72x72px  
- **xhdpi**: 96x96px
- **xxhdpi**: 144x144px
- **xxxhdpi**: 192x192px

## Icon Locations to Replace:
```
android/app/src/main/res/mipmap-mdpi/ic_launcher.png (48x48)
android/app/src/main/res/mipmap-hdpi/ic_launcher.png (72x72)
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png (96x96)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png (144x144)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (192x192)

android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png (48x48)
android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png (72x72)
android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png (96x96)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png (144x144)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png (192x192)
```

## Design Suggestions:

### Option 1: Graduation Cap Icon
- Blue circular background (#1e40af)
- White graduation cap (🎓) in center
- Clean, minimalist design

### Option 2: "ES" Text Logo
- Blue gradient background
- White "ES" text (ExamSphere initials)
- Modern typography

### Option 3: Book + Graduation Cap
- Combine book and graduation cap elements
- Blue color scheme
- Professional academic look

## Tools to Create Icons:
1. **Canva** - Easy online tool with templates
2. **Figma** - Professional design tool
3. **Adobe Illustrator** - Vector graphics
4. **Icon generators** - Online Android icon generators

## Quick Steps:
1. Create a 512x512px master icon
2. Use Android Asset Studio (developer.android.com/studio/write/image-asset-studio) to generate all sizes
3. Replace the existing ic_launcher.png and ic_launcher_round.png files
4. Rebuild the app

The app name "ExamSphere" is already configured in strings.xml, so only the icon images need to be replaced.