import React, { useState, memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../services/apiService';
import useUserStore from '../store/UserStore';
import demoData from '../data/demoData';
import useQuizStore from '../store/QuizStore';
import { designSystem, colors, spacing, borderRadius, shadows } from '../styles/designSystem';


const HomeScreen = memo(({ route, navigation }) => {
  const { user } = useUserStore();
  const { setQuiz, clearQuizState } = useQuizStore();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(false);
  const [fetchingTopics, setFetchingTopics] = useState(false);
  const [fetchingQuizzes, setFetchingQuizzes] = useState(false);

  React.useEffect(() => {
    if (!user || user.payment_status !== "PAID") {
      setQuizzes(["DEMO"]);
      setSelectedQuiz("DEMO");
      return;
    }
    
    if (user?.student_class) {
      fetchSubjects(user.student_class);
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      // Clear any persisted quiz state when entering Home screen
      try {
        clearQuizState();
      } catch (error) {
        console.warn('Error clearing quiz state:', error);
      }
      
      const backAction = () => {
        Alert.alert(
          'Exit App?',
          'Are you sure you want to exit the application?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() }
          ]
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [clearQuizState])
  );

  const fetchSubjects = useCallback(async (className: string) => {
    setFetchingSubjects(true);
    try {
      const data = await ApiService.getSubjects(className);
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setSubjects([]);
    } finally {
      setFetchingSubjects(false);
    }
  }, []);

  const fetchTopics = useCallback(async (className: string, subjectName: string) => {
    setFetchingTopics(true);
    try {
      const data = await ApiService.getTopics(className, subjectName);
      setTopics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setTopics([]);
    } finally {
      setFetchingTopics(false);
    }
  }, []);

  const fetchQuizzes = useCallback(async (className: string, subjectName: string, topic: string) => {
    setFetchingQuizzes(true);
    try {
      const data = await ApiService.getQuizzes(className, subjectName, topic);
      const quizzes = data.quizzes || data.unattempted_quizzes || [];
      const availableQuizzes = quizzes.map(quiz => typeof quiz === 'string' ? quiz : quiz.quizName);
      setQuizzes(availableQuizzes);
      if (availableQuizzes.length > 0) {
        setSelectedQuiz(availableQuizzes[0]);
      } else {
        setSelectedQuiz("");
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setQuizzes([]);
    } finally {
      setFetchingQuizzes(false);
    }
  }, []);

  const beginTest = useCallback(async () => {
    if (!selectedQuiz || !user?.student_class || !selectedSubject || !selectedTopic) return;
    
    try {
      setLoading(true);
      const data = await ApiService.getQuiz(user.student_class, selectedSubject, selectedTopic, selectedQuiz);
      
      if (!data || !data.quiz || !data.quiz.questions || data.quiz.questions.length === 0) {
        Alert.alert('Error', 'Quiz data is not available. Please try again later.');
        return;
      }
      
      setQuiz(data.quiz);
      navigation.navigate('Quiz', {
        className: user.student_class,
        subjectName: selectedSubject,
        topic: selectedTopic,
        quizName: selectedQuiz
      });
    } catch (error) {
      console.error('Error fetching quiz:', error);
      Alert.alert('Error', 'Failed to load quiz. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedQuiz, user, selectedSubject, selectedTopic, setQuiz, navigation]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {user?.name && (
        <View style={styles.welcomeCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome back, {user.name}!</Text>
          <Text style={styles.welcomeSubtitle}>Ready for your next challenge?</Text>
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>📚 Class: {user.student_class}</Text>
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

        {user && user.payment_status === "PAID" && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>📚 Subject</Text>
            {fetchingSubjects ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#f97316" />
                <Text style={styles.loadingText}>Loading subjects...</Text>
              </View>
            ) : (
              subjects.length > 0 ? (
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedSubject}
                    onValueChange={(value) => {
                      setSelectedSubject(value);
                      setSelectedTopic('');
                      setSelectedQuiz('');
                      if (value && user?.student_class) fetchTopics(user.student_class, value);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select subject..." value="" />
                    {subjects.map((subject, index) => (
                      <Picker.Item key={index} label={subject} value={subject} />
                    ))}
                  </Picker>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>📚</Text>
                  <Text style={styles.emptyTitle}>No Subjects Available</Text>
                  <Text style={styles.emptyText}>No subjects found for your class.</Text>
                </View>
              )
            )}
          </View>
        )}

        {selectedSubject && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>📝 Topic</Text>
            {fetchingTopics ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#f97316" />
                <Text style={styles.loadingText}>Loading topics...</Text>
              </View>
            ) : (
              topics.length > 0 ? (
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedTopic}
                    onValueChange={(value) => {
                      setSelectedTopic(value);
                      setSelectedQuiz('');
                      if (value && user?.student_class) fetchQuizzes(user.student_class, selectedSubject, value);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select topic..." value="" />
                    {topics.map((topic, index) => (
                      <Picker.Item key={index} label={topic} value={topic} />
                    ))}
                  </Picker>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>📝</Text>
                  <Text style={styles.emptyTitle}>No Topics Available</Text>
                  <Text style={styles.emptyText}>No topics found for this subject.</Text>
                </View>
              )
            )}
          </View>
        )}

        {selectedTopic && (
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
                  <Picker.Item label="Select a quiz..." value="" />
                  {quizzes.map((quiz, index) => (
                    <Picker.Item key={index} label={quiz} value={quiz} />
                  ))}
                </Picker>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🎉</Text>
                <Text style={styles.emptyTitle}>All Done!</Text>
                <Text style={styles.emptyText}>No quizzes available for this topic. Great job!</Text>
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
});

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  classBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  classBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#0f172a',
  },
  beginButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  beginButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  beginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  beginButtonEmoji: {
    fontSize: 18,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 20,
  },
});
