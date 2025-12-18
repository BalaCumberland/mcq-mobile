import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
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
      // Clear any persisted quiz state when entering Profile screen
      try {
        clearQuizState();
      } catch (error) {
        console.warn('Error clearing quiz state:', error);
      }
    }, [clearQuizState])
  );

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const data = await ApiService.getClassesPublic();
        setClasses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching classes:', error);
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
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.infoSection}>
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
            style={[styles.upgradeButton, loading && styles.buttonDisabled]}
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748b',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
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
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  upgradeButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
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
});

export default ProfileScreen;
