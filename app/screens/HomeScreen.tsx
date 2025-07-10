import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuthToken } from '../services/firebaseAuth';
import API_BASE_URL from '../config/env';
import useUserStore from '../store/UserStore';

const HomeScreen = ({ route }) => {
  const { user } = useUserStore();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const subjectOptions =
    user?.subjects?.map((subject) => ({
      label: subject,
      value: subject,
    })) || [];

  const fetchUnattemptedQuizzes = async (subject: string) => {
    setLoading(true);
    try {
      const token = await getAuthToken();

      const url = `https://apdjq7fpontm374bg3p2w3gx3m0hcbwy.lambda-url.us-east-1.on.aws/quiz/unattempted-quizzes?category=${encodeURIComponent(
        subject
      )}&email=${encodeURIComponent(user.email)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch quizzes:', errorText);
        throw new Error('Failed to fetch quizzes');
      }

      const data = await response.json();
      console.log('✅ Unattempted quizzes:', data);

      setQuizzes(data.unattempted_quizzes || []);
    } catch (err) {
      console.error('❌ Error fetching quizzes:', err.message);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    if (subject) {
      fetchUnattemptedQuizzes(subject);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Subject</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={handleSubjectChange}
          style={styles.picker}
        >
          <Picker.Item label="Select a subject..." value={null} />
          {subjectOptions.map((subject, index) => (
            <Picker.Item key={index} label={subject.label} value={subject.value} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <View style={styles.quizCard}>
              <Text style={styles.quizTitle}>{item}</Text>
              <TouchableOpacity 
                style={styles.beginButton}
                onPress={() => console.log('Begin test:', item)}
              >
                <Text style={styles.beginButtonText}>Begin Test</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            selectedSubject && (
              <Text style={styles.noQuizzes}>
                No unattempted quizzes for this subject.
              </Text>
            )
          }
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  quizCard: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: 16,
    color: '#333',
  },
  noQuizzes: {
    textAlign: 'center',
    marginTop: 24,
    color: '#777',
  },
  beginButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  beginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
