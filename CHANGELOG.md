# MCQ Mobile App - Release Notes

## Version 1.7.0 (Latest)
**Release Date:** December 20, 2024

### 🆕 New Features
- **Enhanced Leaderboard System**
  - Updated API integration with simplified response structure
  - Added User ID display for each student entry
  - Implemented comprehensive eligibility rules disclaimer
  - Improved visual hierarchy with better styling

- **Profile Enhancements**
  - Added User ID display in profile section
  - Enhanced user information layout
  - Improved monospace font for better ID readability

### 🔧 API Updates
- **Leaderboard API v2**
  - Simplified response structure: `{class, leaderboard[]}`
  - Streamlined student data: `{uid, name, score, rank}`
  - Removed deprecated fields for better performance

### 📋 Leaderboard Eligibility Rules
- **Complete ALL Quizzes**: Must attempt every quiz in every enrolled subject
- **Score >35% Per Subject**: Each subject average must exceed 35%
- **At Least One Valid Subject**: Must have subjects with available quizzes

### 🎨 UI/UX Improvements
- Enhanced leaderboard card design with gradient backgrounds
- Improved medal display for top 3 positions
- Better visual feedback for current user highlighting
- Cleaner typography and spacing throughout the app

### 🐛 Bug Fixes
- Fixed version synchronization between package.json and build.gradle
- Improved error handling in leaderboard data fetching
- Enhanced TypeScript type safety for API responses

### 🔧 Technical Improvements
- Updated TypeScript interfaces for better type safety
- Optimized component rendering performance
- Improved code organization and maintainability

---

## Previous Versions

### Version 1.5.0
- Initial leaderboard implementation
- Basic profile functionality
- Core quiz features

### Version 1.0.0
- Initial app release
- Basic quiz functionality
- User authentication