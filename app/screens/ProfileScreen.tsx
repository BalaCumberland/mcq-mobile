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
      `⚠️ WARNING ⚠️\n\nUpgrading to ${selectedClass} will:\n❌ DELETE ALL YOUR QUIZ ATTEMPTS\n❌ COUNT TOWARDS YOUR 2 SWITCHES/YEAR LIMIT\n\nContinue?`,
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
                `✅ Upgraded to ${result.newClass}\nSwitches remaining: ${result.switchesRemaining}/2\nNext eligible: ${new Date(result.nextEligibleDate).toLocaleDateString()}`
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
          <Text style={styles.warningText}>⚠️ You can upgrade your class maximum 2 times per year</Text>
          
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
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  paid: {
    color: '#4CAF50',
  },
  unpaid: {
    color: '#FF9800',
  },
  upgradeSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    marginBottom: 16,
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 8,
  },
  pickerWrapper: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    marginBottom: 16,
  },
  picker: {
    height: 56,
  },
  upgradeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
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
    color: '#2196F3',
    fontSize: 14,
  },
});

export default ProfileScreen;
