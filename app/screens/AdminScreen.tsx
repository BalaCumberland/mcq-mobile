import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../services/apiService';
import useUserStore from '../store/UserStore';
import API_BASE_URL, { LAMBDA_MCQ_GO_API_URL, CLASS_OPTIONS } from '../config/env';

const AdminScreen = () => {
  const { user } = useUserStore();
  const [studentEmail, setStudentEmail] = useState('');
  const [studentResponse, setStudentResponse] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentClass, setStudentClass] = useState('CLS6');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const getStudent = async () => {
    if (!studentEmail.trim()) {
      Alert.alert('Error', 'Please enter an email!');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/get-by-email?email=${encodeURIComponent(studentEmail)}`, {
        headers: { 'Authorization': `Bearer ${await import('../services/firebaseAuth').then(m => m.getAuthToken())}` }
      });
      const data = await response.json();
      setStudentResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setStudentResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateField = async (field, value) => {
    if (!studentEmail.trim()) {
      Alert.alert('Error', 'Please enter an email before updating.');
      return;
    }

    const payload = {
      email: studentEmail.trim().toLowerCase(),
      updatedBy: user.email,
      [field]: value
    };

    try {
      const response = await fetch(`${LAMBDA_MCQ_GO_API_URL}/students/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await import('../services/firebaseAuth').then(m => m.getAuthToken())}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        Alert.alert('Update Failed', data.error || data.message || `Failed to update ${field}`);
        return;
      }
      
      Alert.alert('✅ Success', data.message || `${field} updated successfully!`);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('❌ Network Error', `Failed to update ${field}. Please check your connection.`);
    }
  };

  const handleAmountUpdate = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 999) {
      Alert.alert('Error', 'Amount must be at least 999');
      return;
    }
    
    Alert.alert(
      'Warning',
      'This action is not reversible! Are you sure you want to update the amount?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: () => updateField('amount', parsedAmount) }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎓 Admin Panel</Text>
        <Text style={styles.subtitle}>Student Management</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Student Management</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>📧 Student Email:</Text>
          <TextInput
            style={styles.input}
            value={studentEmail}
            onChangeText={setStudentEmail}
            placeholder="Enter student email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={getStudent} disabled={loading}>
          <Text style={styles.buttonText}>🔍 Get Student Info</Text>
        </TouchableOpacity>
        
        {studentResponse ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{studentResponse}</Text>
          </View>
        ) : null}

        <View style={styles.updateSection}>
          <View style={styles.updateRow}>
            <TextInput
              style={[styles.input, styles.updateInput]}
              value={name}
              onChangeText={setName}
              placeholder="Enter new name"
            />
            <TouchableOpacity style={styles.updateButton} onPress={() => updateField('name', name)}>
              <Text style={styles.updateButtonText}>Update Name</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.updateRow}>
            <TextInput
              style={[styles.input, styles.updateInput]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="10-digit phone"
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TouchableOpacity style={styles.updateButton} onPress={() => updateField('phoneNumber', phoneNumber)}>
              <Text style={styles.updateButtonText}>Update Phone</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.updateRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={studentClass}
                onValueChange={setStudentClass}
                style={styles.picker}
              >
                {CLASS_OPTIONS.map((cls) => (
                  <Picker.Item key={cls} label={cls} value={cls} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity style={styles.updateButton} onPress={() => updateField('studentClass', studentClass)}>
              <Text style={styles.updateButtonText}>Update Class</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.updateRow}>
            <TextInput
              style={[styles.input, styles.updateInput]}
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount (min: 999)"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.updateButton} onPress={handleAmountUpdate}>
              <Text style={styles.updateButtonText}>Extend Sub</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  responseText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  updateSection: {
    marginTop: 16,
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  updateInput: {
    flex: 1,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 4,
    elevation: 1,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  picker: {
    height: 50,
    color: '#333',
  },
});

export default AdminScreen;