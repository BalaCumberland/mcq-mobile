# ExamSphere v1.8.4 Release Notes

## 🎯 UI Consistency Fix

### Fixed
- **Login Screen Logo Size**: Fixed login page icon and "ExamSphere" text size to match registration page
  - Logo icon now displays at 36px (consistent with signup screen)
  - App title text now displays at 32px with proper styling
  - Improved visual consistency across authentication screens

### Technical Details
- Added missing `logoContainer`, `logoIcon`, and `logoText` styles to LoginScreen
- Ensured consistent branding experience between login and registration flows

### Version Information
- **Version**: 1.8.4
- **Build**: 9
- **Release Date**: January 2025

### Files Changed
- `app/screens/LoginScreen.tsx` - Added consistent logo styling

---

**Previous Version**: 1.8.3
**Upgrade**: Automatic UI improvement, no user action required