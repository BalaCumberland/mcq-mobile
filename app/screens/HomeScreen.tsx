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
  SafeAreaView,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import ApiService from '../services/apiService';
import useUserStore from '../store/UserStore';
import demoData from '../data/demoData';
import useQuizStore from '../store/QuizStore';
import { designSystem, colors, spacing, borderRadius, shadows } from '../styles/designSystem';
import LinearGradient from 'react-native-linear-gradient';


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
  const [buttonScale] = useState(new Animated.Value(1));

  React.useEffect(() => {
    if (user?.student_class) {
      fetchSubjects(user.student_class);
    }
  }, [user, fetchSubjects]);

  // Check if user is paid and subscription is active
  const isPaidUser = user?.payment_status === "PAID" && user?.sub_exp_date && new Date(user.sub_exp_date) > new Date();
  
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleButtonPress = () => {
    animateButton();
    beginTest();
  };

  const getUserTierBadge = () => {
    if (isPaidUser) {
      return { text: '👑 PREMIUM', color: '#fbbf24', bgColor: '#fef3c7' };
    }
    return { text: '🆓 FREE TRIAL', color: '#f59e0b', bgColor: '#fef3c7' };
  };
  
  useFocusEffect(
    React.useCallback(() => {
      // Clear any persisted quiz state when entering Home screen
      try {
        clearQuizState();
      } catch (error) {
        console.warn('Error clearing quiz state:', error);
      }
      
      // Reset dropdown selections when coming back from results
      setSelectedSubject('');
      setSelectedTopic('');
      setSelectedQuiz('');
      setTopics([]);
      setQuizzes([]);
      
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
      return () => {
        backHandler.remove();
      };
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
    if (!selectedQuiz || !user?.student_class) return;
    
    // Check access for free users - only first quiz of first topic
    if (!isPaidUser) {
      const isFirstTopic = topics.indexOf(selectedTopic) === 0;
      const isFirstQuiz = quizzes.indexOf(selectedQuiz) === 0;
      
      if (!isFirstTopic || !isFirstQuiz) {
        Alert.alert('Access Denied', 'Free users can only access the first quiz of the first topic. Upgrade to access all content.');
        return;
      }
    }
    
    if (!selectedSubject || !selectedTopic) {
      Alert.alert('Error', 'Please select subject and topic first.');
      return;
    }
    
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
    } catch (error: any) {
      console.error('Error fetching quiz:', error);
      const errorMessage = error.message || 'Failed to load quiz. Please check your connection and try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedQuiz, user, selectedSubject, selectedTopic, setQuiz, navigation, isPaidUser, topics, quizzes]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {user?.name && (
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.welcomeCard}
        >
          <LinearGradient
            colors={['#3b82f6', '#1e40af']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.welcomeTitle}>Welcome back, {user.name}!</Text>
          <Text style={styles.welcomeSubtitle}>Ready for your next challenge?</Text>
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>📚 Class: {user.student_class}</Text>
          </View>
          
          <View style={[styles.tierBadge, { backgroundColor: getUserTierBadge().bgColor }]}>
            <Text style={[styles.tierBadgeText, { color: getUserTierBadge().color }]}>
              {getUserTierBadge().text}
            </Text>
          </View>
        </LinearGradient>
      )}



      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.mainCard}
      >
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            style={styles.cardIcon}
          >
            <Text style={styles.cardIconText}>🎯</Text>
          </LinearGradient>
          <Text style={styles.title}>Select Your Quiz</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>📚 Subject</Text>
          {fetchingSubjects ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingText}>Loading subjects...</Text>
            </View>
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedSubject}
                onValueChange={(value) => {
                  setSelectedSubject(value);
                  setSelectedTopic('');
                  setSelectedQuiz('');
                  setTopics([]);
                  setQuizzes([]);
                  if (value && user?.student_class) {
                    fetchTopics(user.student_class, value);
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select subject..." value="" />
                {subjects.map((subject, index) => (
                  <Picker.Item key={index} label={subject} value={subject} />
                ))}
              </Picker>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>📝 Topic</Text>
          {fetchingTopics ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingText}>Loading topics...</Text>
            </View>
          ) : (
            <View style={[styles.pickerWrapper, !selectedSubject && styles.disabledPicker]}>
              <Picker
                selectedValue={selectedTopic}
                onValueChange={(value) => {
                  setSelectedTopic(value);
                  setSelectedQuiz('');
                  setQuizzes([]);
                  if (value && user?.student_class && selectedSubject) {
                    fetchQuizzes(user.student_class, selectedSubject, value);
                  }
                }}
                style={styles.picker}
                enabled={!!selectedSubject}
              >
                <Picker.Item 
                  label={
                    !selectedSubject ? "Select subject first" :
                    selectedSubject && topics.length === 0 && !fetchingTopics ? "No topics available" :
                    "Select topic..."
                  } 
                  value="" 
                />
                {topics.map((topic, index) => (
                  <Picker.Item key={index} label={topic} value={topic} />
                ))}
              </Picker>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>🎯 Available Quizzes</Text>
          {fetchingQuizzes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#f97316" />
              <Text style={styles.loadingText}>Loading quizzes...</Text>
            </View>
          ) : (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedQuiz}
                onValueChange={setSelectedQuiz}
                style={styles.picker}
              >
                <Picker.Item 
                  label={
                    !selectedTopic ? "Select topic first" :
                    selectedTopic && quizzes.length === 0 && !fetchingQuizzes ? "No quizzes available" :
                    "Select a quiz..."
                  } 
                  value="" 
                />
                {quizzes.map((quiz, index) => {
                  const isFirstQuiz = index === 0;
                  const isFirstTopic = topics.indexOf(selectedTopic) === 0;
                  const isAccessible = isPaidUser || (isFirstTopic && isFirstQuiz);
                  const lockSymbol = isPaidUser ? '' : (isFirstTopic && isFirstQuiz) ? '🆓 ' : '🔒 ';
                  
                  return (
                    <Picker.Item 
                      key={index} 
                      label={`${lockSymbol}${quiz}`} 
                      value={quiz}
                    />
                  );
                })}
              </Picker>
            </View>
          )}
        </View>


        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            style={[styles.beginButton, (loading || !selectedQuiz || (!isPaidUser && selectedQuiz && !(topics.indexOf(selectedTopic) === 0 && quizzes.indexOf(selectedQuiz) === 0))) && styles.beginButtonDisabled]}
            onPress={handleButtonPress}
            disabled={loading || !selectedQuiz || (!isPaidUser && selectedQuiz && !(topics.indexOf(selectedTopic) === 0 && quizzes.indexOf(selectedQuiz) === 0))}
          >
            <LinearGradient
              colors={loading || !selectedQuiz || (!isPaidUser && selectedQuiz && !(topics.indexOf(selectedTopic) === 0 && quizzes.indexOf(selectedQuiz) === 0)) 
                ? ['#94a3b8', '#64748b'] 
                : ['#3b82f6', '#1e40af']}
              style={styles.beginButtonGradient}
            >
              <View style={styles.beginButtonContent}>
                <Text style={styles.beginButtonEmoji}>🚀</Text>
                <Text style={styles.beginButtonText}>
                  {loading ? 'Loading...' : 
                   !selectedQuiz ? 'Select Quiz First' : 
                   (!isPaidUser && selectedQuiz && !(topics.indexOf(selectedTopic) === 0 && quizzes.indexOf(selectedQuiz) === 0)) ? '🔒 Upgrade Required' :
                   'Start Assessment'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
});

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6b7280',
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
    marginBottom: 8,
  },
  classBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  mainCard: {
    borderRadius: 24,
    padding: 32,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    letterSpacing: -0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  pickerWrapper: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#0f172a',
  },
  beginButton: {
    borderRadius: 16,
    marginTop: 32,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  beginButtonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  beginButtonDisabled: {
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
    marginBottom: 16,
  },
  emptyActions: {
    alignItems: 'flex-start',
  },
  emptyActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  emptyActionItem: {
    fontSize: 13,
    color: '#166534',
    marginBottom: 4,
  },
  demoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  demoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  demoSubtext: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  disabledPicker: {
    opacity: 0.5,
    backgroundColor: '#f1f5f9',
  },
  beginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
});
