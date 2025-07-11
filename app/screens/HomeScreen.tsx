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
import useCompletedQuizStore from '../store/CompletedQuizStore';

const HomeScreen = ({ route, navigation }) => {
  const { user } = useUserStore();
  const { setQuiz, hasActiveQuiz, quiz: activeQuiz, timeRemaining, resetQuiz } = useQuizStore();
  const { isQuizCompleted, addCompletedQuiz } = useCompletedQuizStore();
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

      // Filter out completed quizzes
      const availableQuizzes = (data.unattempted_quizzes || []).filter(quiz => !isQuizCompleted(quiz));
      setQuizzes(availableQuizzes);
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
            <Text style={styles.cardIconText}>🎯</Text>
          </View>
          <Text style={styles.title}>Select Your Quiz</Text>
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
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  pickerWrapper: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  picker: {
    height: 56,
    width: '100%',
    color: '#374151',
  },
  beginButton: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 18,
  },
  beginButtonEmoji: {
    fontSize: 18,
  },
  resumeCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  resumeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  resumeText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 4,
  },
  resumeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startFreshButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
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
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
  },
});
