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
import useQuizStore from '../store/QuizStore';

const HomeScreen = ({ route, navigation }) => {
  const { user } = useUserStore();
  const { setQuiz } = useQuizStore();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
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
    setSelectedQuiz(null);
    if (subject) {
      fetchUnattemptedQuizzes(subject);
    }
  };

  const beginTest = async () => {
    if (!selectedQuiz || !user) return;
    
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const url = `https://apdjq7fpontm374bg3p2w3gx3m0hcbwy.lambda-url.us-east-1.on.aws/quiz/get-by-name?quizName=${encodeURIComponent(selectedQuiz)}&email=${encodeURIComponent(user.email)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch quiz');
      
      const data = await response.json();
      setQuiz(data.quiz);
      navigation.navigate('Quiz');
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
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

      {quizzes.length > 0 && (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedQuiz}
            onValueChange={setSelectedQuiz}
            style={styles.picker}
          >
            <Picker.Item label="Select a quiz..." value={null} />
            {quizzes.map((quiz, index) => (
              <Picker.Item key={index} label={quiz} value={quiz} />
            ))}
          </Picker>
        </View>
      )}

      {selectedQuiz && (
        <TouchableOpacity 
          style={styles.beginButton}
          onPress={beginTest}
          disabled={loading}
        >
          <Text style={styles.beginButtonText}>
            {loading ? 'Loading...' : 'Begin Test'}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  beginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
