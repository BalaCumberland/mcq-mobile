import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuthToken } from '../services/firebaseAuth';
import API_BASE_URL from '../config/env';
import useUserStore from '../store/UserStore';
import demoData from '../data/demoData';
import useQuizStore from '../store/QuizStore';


const HomeScreen = ({ route, navigation }) => {
  const { user } = useUserStore();
  const { setQuiz, hasActiveQuiz, quiz: activeQuiz, timeRemaining, resetQuiz } = useQuizStore();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);

  const subjectOptions =
    user?.subjects?.map((subject) => ({
      label: subject,
      value: subject,
    })) || [];

  const fetchUnattemptedQuizzes = async (subject: string) => {
    setFetchingQuizzes(true);
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
      setFetchingQuizzes(false);
    }
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedQuiz(null);
    if (subject) {
      if (user?.payment_status === 'UNPAID') {
        setQuizzes(['Demo Quiz']);
      } else {
        fetchUnattemptedQuizzes(subject);
      }
    }
  };

  const beginTest = async () => {
    if (!selectedQuiz || !user) return;
    
    // Check if user payment status is UNPAID
    if (user.payment_status === 'UNPAID') {
      setQuiz(demoData);
      navigation.navigate('Quiz');
      return;
    }
    
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {user?.name && (
        <View style={styles.welcomeCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome back, {user.name}!</Text>
          <Text style={styles.welcomeSubtitle}>Ready for your next challenge?</Text>
        </View>
      )}

      {hasActiveQuiz() && timeRemaining && timeRemaining > 0 && (
        <View style={styles.resumeCard}>
          <Text style={styles.resumeTitle}>⏰ Resume Quiz</Text>
          <Text style={styles.resumeText}>Quiz: {activeQuiz?.quizName}</Text>
          <Text style={styles.resumeText}>Time left: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</Text>
          <View style={styles.resumeButtons}>
            <TouchableOpacity style={styles.resumeButton} onPress={() => navigation.navigate('Quiz')}>
              <Text style={styles.resumeButtonText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.startFreshButton} onPress={resetQuiz}>
              <Text style={styles.startFreshButtonText}>Start Fresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>🎓</Text>
          </View>
          <Text style={styles.title}>Select Quiz</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>📚 Subject Category</Text>
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
        </View>

        {selectedSubject && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>📝 Available Quizzes</Text>
            {fetchingQuizzes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#f97316" />
                <Text style={styles.loadingText}>Loading quizzes...</Text>
              </View>
            ) : quizzes.length > 0 ? (
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
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyTitle}>All Done!</Text>
                <Text style={styles.emptyText}>No quizzes available for this subject. Great job!</Text>
              </View>
            )}
          </View>
        )}

        {selectedQuiz && (
          <TouchableOpacity 
            style={[styles.beginButton, loading && styles.beginButtonDisabled]}
            onPress={beginTest}
            disabled={loading}
          >
            <View style={styles.beginButtonContent}>
              <Text style={styles.beginButtonEmoji}>🚀</Text>
              <Text style={styles.beginButtonText}>
                {loading ? 'Loading...' : 'Start Assessment'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: '6%',
    marginBottom: 16,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: '5%',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
  },
  picker: {
    height: 56,
    width: '100%',
    color: '#374151',
  },
  beginButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 16,
    alignItems: 'center',
    elevation: 2,
  },
  beginButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
  },
  beginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  beginButtonEmoji: {
    fontSize: 18,
  },
  resumeCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: '6%',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resumeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 12,
  },
  resumeText: {
    fontSize: 16,
    color: '#92400e',
    marginBottom: 6,
    fontWeight: '500',
  },
  resumeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  resumeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startFreshButton: {
    flex: 1,
    backgroundColor: '#64748b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  startFreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  loadingText: {
    marginLeft: 10,
    color: '#1e40af',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: '8%',
    backgroundColor: '#ecfdf5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#a7f3d0',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#065f46',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
});
