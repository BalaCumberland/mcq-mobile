import { StyleSheet } from 'react-native';

// Web UI Matching Color Palette
export const colors = {
  primary: {
    50: '#fef7ee',
    100: '#fdedd3',
    200: '#fbd7a5',
    500: '#f59e0b', // orange-500
    600: '#d97706', // orange-600
    700: '#b45309',
  },
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#3b82f6', // blue-500
    600: '#2563eb', // blue-600
    700: '#1d4ed8',
    800: '#1e40af',
  },
  purple: {
    500: '#8b5cf6', // purple-500
    600: '#7c3aed', // purple-600
    700: '#6d28d9',
  },
  pink: {
    500: '#ec4899', // pink-500
    600: '#db2777', // pink-600
  },
  neutral: {
    50: '#f8fafc',   // gray-50
    100: '#f1f5f9',  // gray-100
    200: '#e2e8f0',  // gray-200
    300: '#cbd5e1',  // gray-300
    400: '#94a3b8',  // gray-400
    500: '#64748b',  // gray-500
    600: '#475569',  // gray-600
    700: '#334155',  // gray-700
    800: '#1e293b',  // gray-800
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e', // green-500
    600: '#16a34a', // green-600
    700: '#15803d',
  },
  error: {
    50: '#fef2f2',
    200: '#fecaca',
    500: '#ef4444', // red-500
    600: '#dc2626', // red-600
    700: '#b91c1c',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    500: '#f59e0b', // yellow-500
    600: '#d97706', // yellow-600
    700: '#b45309',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
};

export const designSystem = StyleSheet.create({
  // Cards - matching web UI
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  cardElevated: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: spacing['2xl'],
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  
  // Buttons - exact web UI styling
  buttonPrimary: {
    backgroundColor: colors.primary[500], // orange gradient start
    borderRadius: 16, // rounded-2xl
    paddingVertical: 16,
    paddingHorizontal: spacing['2xl'],
    minHeight: 52,
    ...shadows.lg,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary[500], // blue gradient start
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: spacing['2xl'],
    minHeight: 52,
    ...shadows.lg,
  },
  buttonSuccess: {
    backgroundColor: colors.success[500], // green gradient start
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: spacing['2xl'],
    minHeight: 52,
    ...shadows.lg,
  },
  buttonPurple: {
    backgroundColor: colors.purple[500], // purple gradient start
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: spacing['2xl'],
    minHeight: 52,
    ...shadows.lg,
  },
  buttonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Form Elements - exact web UI styling
  formInput: {
    backgroundColor: colors.neutral[50], // bg-gray-50
    borderWidth: 2,
    borderColor: colors.neutral[200], // border-gray-200
    borderRadius: 12, // rounded-xl
    paddingHorizontal: 16, // px-4
    paddingVertical: 12, // py-3
    fontSize: 16,
    color: colors.neutral[700], // text-gray-700
    minHeight: 48,
  },
  formInputFocused: {
    borderColor: colors.primary[500], // focus:border-orange-500
  },
  formInputError: {
    borderColor: colors.error[500], // border-red-500
  },
  formLabel: {
    fontSize: 14, // text-sm
    fontWeight: '600', // font-semibold
    color: colors.neutral[700], // text-gray-700
    marginBottom: spacing.sm,
  },
  
  // Typography - matching web UI
  headingLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neutral[800],
    lineHeight: 40,
  },
  headingMedium: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[800],
    lineHeight: 32,
  },
  bodyMedium: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  
  // Container - exact web UI background
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // gradient-secondary equivalent
    padding: spacing.lg,
  },
  
  // Web UI specific gradients (simulated with solid colors)
  gradientPrimary: {
    backgroundColor: colors.primary[500], // orange-500 to red-500 gradient
  },
  gradientSecondary: {
    backgroundColor: colors.secondary[500], // blue-500 to blue-600 gradient
  },
  gradientPurple: {
    backgroundColor: colors.purple[500], // purple-500 to pink-500 gradient
  },
  
  // Loading - matching web UI
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.neutral[600],
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Web UI specific styles
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: spacing['2xl'],
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  avatar: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  avatarLarge: {
    width: 64,
    height: 64,
  },
  
  badge: {
    backgroundColor: colors.secondary[100], // bg-blue-100
    paddingHorizontal: 12, // px-3
    paddingVertical: 4, // py-1
    borderRadius: 999, // rounded-full
    alignSelf: 'flex-start',
  },
  
  badgeText: {
    color: colors.secondary[800], // text-blue-800
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  
  // Alert styles matching web UI
  alertSuccess: {
    backgroundColor: colors.success[50], // bg-green-50
    borderWidth: 2,
    borderColor: colors.success[200], // border-green-200
    borderRadius: 12, // rounded-xl
    padding: 16,
  },
  alertError: {
    backgroundColor: colors.error[50], // bg-red-50
    borderWidth: 2,
    borderColor: colors.error[200], // border-red-200
    borderRadius: 12,
    padding: 16,
  },
  alertWarning: {
    backgroundColor: colors.warning[50], // bg-yellow-50
    borderWidth: 2,
    borderColor: colors.warning[200], // border-yellow-200
    borderRadius: 12,
    padding: 16,
  },
  alertInfo: {
    backgroundColor: colors.secondary[50], // bg-blue-50
    borderWidth: 2,
    borderColor: colors.secondary[200], // border-blue-200
    borderRadius: 12,
    padding: 16,
  },
});