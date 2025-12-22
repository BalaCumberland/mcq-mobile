import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import useUserStore from '../store/UserStore';
import useQuizStore from '../store/QuizStore';
import ApiService from '../services/apiService';

const ProfileScreen = ({ navigation }: any) => {
  const { user, setUser } = useUserStore();
  const { clearQuizState } = useQuizStore();
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState(user?.student_class || '');
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // Profile screen focused - no special actions needed
    }, [])
  );

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const data = await ApiService.getClassesPublic();
        setClasses(Array.isArray(data) ? data : []);
      } catch (error) {
        // Silent fail
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleUpdateClass = async () => {
    if (!selectedClass || selectedClass === user?.student_class) {
      Alert.alert('Info', 'Please select a different class to upgrade');
      return;
    }

    Alert.alert(
      'Confirm Class Upgrade',
      `⚠️ WARNING ⚠️\n\nUpgrading to ${selectedClass} will:\n❌ RESTRICT NEXT UPGRADE FOR 6 MONTHS\n\nContinue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await ApiService.upgradeClass(selectedClass);
              await useUserStore.getState().fetchUserByEmail(user?.email || '');
              Alert.alert(
                'Success',
                `✅ Upgraded to ${result.newClass || selectedClass}\n📅 Next upgrade available: ${result.nextEligibleDate ? new Date(result.nextEligibleDate).toLocaleDateString() : 'In 6 months'}`
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to upgrade class');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      removeClippedSubviews={true}
      maxToRenderPerBatch={2}
    >
      <LinearGradient
        colors={['#1e3a8a', '#1e40af']}
        style={styles.headerGradient}
      >
        <LinearGradient
          colors={['#3b82f6', '#1e40af']}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <LinearGradient
          colors={user?.payment_status === 'PAID' ? ['#10b981', '#059669'] : ['#f59e0b', '#d97706']}
          style={styles.statusBadge}
        >
          <Text style={styles.statusBadgeText}>
            {user?.payment_status === 'PAID' ? '👑 PREMIUM' : '🆓 FREE TRIAL'}
          </Text>
        </LinearGradient>
      </LinearGradient>

      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.card}
      >

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🆔 User ID:</Text>
            <Text style={[styles.infoValue, styles.userIdText]}>{user?.uid}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📚 Current Class:</Text>
            <Text style={styles.infoValue}>{user?.student_class}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Phone:</Text>
            <Text style={styles.infoValue}>{user?.phone_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💳 Status:</Text>
            <Text style={[styles.infoValue, user?.payment_status === 'PAID' ? styles.paid : styles.unpaid]}>
              {user?.payment_status === 'PAID' ? '✓ Paid' : '⚠ Unpaid'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Subscription Expires:</Text>
            <Text style={styles.infoValue}>
              {user?.sub_exp_date ? new Date(user.sub_exp_date).toLocaleDateString() : 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.upgradeSection}>
          <Text style={styles.sectionTitle}>🔄 Upgrade Class</Text>
          <Text style={styles.warningText}>⚠️ You can upgrade your class once every 6 months</Text>

          {loadingClasses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2196F3" />
              <Text style={styles.loadingText}>Loading classes...</Text>
            </View>
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedClass}
                onValueChange={setSelectedClass}
                style={styles.picker}
              >
                {classes.map((cls) => (
                  <Picker.Item key={cls} label={cls} value={cls} />
                ))}
              </Picker>
            </View>
          )}

          <TouchableOpacity
            style={[styles.upgradeButton, loading && styles.upgradeButtonDisabled]}
            onPress={handleUpdateClass}
            disabled={loading || selectedClass === user?.student_class}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.upgradeButtonText}>Upgrade Class</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 24,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 126, 234, 0.1)',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  email: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  paid: {
    color: '#059669',
  },
  unpaid: {
    color: '#ea580c',
  },
  upgradeSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  warningText: {
    fontSize: 12,
    color: '#ea580c',
    marginBottom: 16,
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  pickerWrapper: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  userIdText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});

export default ProfileScreen;
