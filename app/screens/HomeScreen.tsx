import React, { useState, memo, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ApiService from '../services/apiService';
import useUserStore from '../store/UserStore';
import useQuizStore from '../store/QuizStore';

const HomeScreen = memo(({ navigation }) => {
  const { user } = useUserStore();
  const { setQuiz, clearQuizState } = useQuizStore();

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState<string[]>([]);
  const [curriculumData, setCurriculumData] = useState<any>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [fetchingCurriculum, setFetchingCurriculum] = useState(false);

  const [buttonScale] = useState(new Animated.Value(1));

  const isPaidUser = useMemo(() => {
    if (!user?.payment_status || !user?.sub_exp_date) return false;
    const isPaid = user.payment_status === 'PAID';
    const notExpired = new Date(user.sub_exp_date) > new Date();
    return isPaid && notExpired;
  }, [user?.payment_status, user?.sub_exp_date]);

  const getUserTierBadge = useCallback(() => {
    if (isPaidUser) {
      return { text: '👑 PREMIUM', color: '#f97316', bgColor: '#fff7ed' };
    }
    return { text: '🆓 FREE TRIAL', color: '#f59e0b', bgColor: '#fffbeb' };
  }, [isPaidUser]);

  const animateButton = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonScale]);

  const fetchCurriculum = useCallback(
    async (className: string, forceRefresh = false) => {
      if (!className) return;
      
      const cacheKey = `curriculum_${className}`;
      const now = Date.now();
      const CACHE_DURATION = 1 * 60 * 1000; // 1 minute
      
      // Try to load from cache first
      if (!forceRefresh) {
        try {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const cacheAge = now - timestamp;
            
            if (cacheAge < CACHE_DURATION && data?.subjects) {
              setCurriculumData(data);
              setSubjects(data.subjects || []);
              setLastFetchTime(timestamp);
              return;
            }
          }
        } catch (e) {
          // Cache corrupted, clear it
          try {
            await AsyncStorage.removeItem(cacheKey);
          } catch {}
        }
      }
      
      setFetchingCurriculum(true);
      try {
        const data = await ApiService.getCurriculum(className);
        if (data?.subjects) {
          setCurriculumData(data);
          setSubjects(data.subjects || []);
          setLastFetchTime(now);
          
          // Save to cache
          try {
            await AsyncStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
          } catch {
            // Cache save failed, continue without caching
          }
        }
      } catch (err) {
        // If cache exists and API fails, use stale cache
        try {
          const cached = await AsyncStorage.getItem(cacheKey);
          if (cached) {
            const { data } = JSON.parse(cached);
            if (data?.subjects) {
              setCurriculumData(data);
              setSubjects(data.subjects || []);
              return;
            }
          }
        } catch {}
        
        setCurriculumData(null);
        setSubjects([]);
      } finally {
        setFetchingCurriculum(false);
      }
    },
    []
  );

  const getTopicsForSubject = useCallback((subject: string) => {
    if (!curriculumData?.topics || !subject) return [];
    return curriculumData.topics[subject] || [];
  }, [curriculumData]);

  const getQuizzesForSubjectTopic = useCallback((subject: string, topic: string) => {
    if (!curriculumData?.quizzes || !subject || !topic) return [];
    const key = `${subject}_${topic}`;
    return curriculumData.quizzes[key] || [];
  }, [curriculumData]);

  // Clear curriculum data when user logs out or changes
  useEffect(() => {
    if (!user) {
      // User logged out - clear all curriculum data immediately
      const clearAllCurriculumData = async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          const curriculumKeys = keys.filter(key => key.startsWith('curriculum_'));
          if (curriculumKeys.length > 0) {
            await AsyncStorage.multiRemove(curriculumKeys);
          }
        } catch (e) {}
      };
      
      clearAllCurriculumData();
      setCurriculumData(null);
      setSubjects([]);
      setSelectedSubject('');
      setSelectedTopic('');
      setSelectedQuiz('');
      setTopics([]);
      setQuizzes([]);
      setLastFetchTime(0);
    }
  }, [user]);

  // Handle class change - clear cache for old class
  useEffect(() => {
    if (user?.student_class && curriculumData) {
      const currentCacheKey = `curriculum_${user.student_class}`;
      // If curriculum data doesn't match current class, clear it
      AsyncStorage.getItem(currentCacheKey).then(cached => {
        if (!cached) {
          setCurriculumData(null);
          setSubjects([]);
          setSelectedSubject('');
          setSelectedTopic('');
          setSelectedQuiz('');
          setTopics([]);
          setQuizzes([]);
        }
      }).catch(() => {});
    }
  }, [user?.student_class, curriculumData]);

  // Initial curriculum load
  useEffect(() => {
    if (user?.student_class) {
      fetchCurriculum(user.student_class);
    }
  }, [user?.student_class, fetchCurriculum]);

  useFocusEffect(
    useCallback(() => {
      // Clear any persisted quiz state when entering Home screen
      try {
        clearQuizState();
      } catch (error) {
      }
      
      // Refresh curriculum data if needed
      if (user?.student_class) {
        fetchCurriculum(user.student_class);
      }

      const backAction = () => {
        Alert.alert(
          'Exit App?',
          'Are you sure you want to exit the application?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
          ]
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove();
    }, [clearQuizState, fetchCurriculum, user?.student_class])
  );

  const freeUserLocked = useMemo(() => {
    if (isPaidUser || !selectedQuiz || !selectedTopic) return false;

    const topicIndex = topics.indexOf(selectedTopic);
    const quizIndex = quizzes.indexOf(selectedQuiz);
    const isFirstTopic = topicIndex === 0;
    const isFirstQuiz = quizIndex === 0;

    return !(isFirstTopic && isFirstQuiz);
  }, [isPaidUser, selectedQuiz, selectedTopic, topics, quizzes]);

  const beginTest = useCallback(async () => {
    if (!selectedQuiz || !user?.student_class) return;

    if (!selectedSubject || !selectedTopic) {
      Alert.alert('Missing Info', 'Please select subject and topic first.');
      return;
    }

    if (!isPaidUser && freeUserLocked) {
      Alert.alert(
        'Access Restricted',
        'Free users can only access the first quiz of the first topic.\nUpgrade to unlock all assessments.'
      );
      return;
    }

    try {
      setLoading(true);
      const data = await ApiService.getQuiz(
        user.student_class,
        selectedSubject,
        selectedTopic,
        selectedQuiz
      );

      if (!data?.quiz?.questions || data.quiz.questions.length === 0) {
        Alert.alert(
          'No Questions',
          'Quiz data is not available right now. Please try again later.'
        );
        return;
      }

      setQuiz(data.quiz);
      navigation.navigate('Quiz', {
        className: user.student_class,
        subjectName: selectedSubject,
        topic: selectedTopic,
        quizName: selectedQuiz,
      });
    } catch (error: any) {
      const message =
        error?.message ||
        'Failed to load quiz. Please check your connection and try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [
    selectedQuiz,
    selectedSubject,
    selectedTopic,
    user?.student_class,
    setQuiz,
    navigation,
    isPaidUser,
    freeUserLocked,
  ]);

  const handleBeginPress = () => {
    animateButton();
    beginTest();
  };

  const tierBadge = getUserTierBadge();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {user?.name && (
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.welcomeCard}
          >
            <LinearGradient
              colors={['#3b82f6', '#1e40af']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>

            <Text style={styles.welcomeTitle}>
              Welcome back, {user.name}!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Ready for your next challenge?
            </Text>

            <View style={styles.classBadge}>
              <Text style={styles.classBadgeText}>
                📚 Class: {user.student_class}
              </Text>
            </View>

            <View
              style={[styles.tierBadge, { backgroundColor: tierBadge.bgColor }]}
            >
              <Text style={[styles.tierBadgeText, { color: tierBadge.color }]}>
                {tierBadge.text}
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
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Select your quiz</Text>
              <Text style={styles.subtitleSmall}>
                Choose subject, topic, and quiz to begin.
              </Text>
            </View>
          </View>

          {/* Subject */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>📚 Subject</Text>
            {fetchingCurriculum ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#f97316" />
                <Text style={styles.loadingText}>Loading curriculum...</Text>
              </View>
            ) : (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedSubject}
                  onValueChange={(value) => {
                    setSelectedSubject(value);
                    setSelectedTopic('');
                    setSelectedQuiz('');
                    const newTopics = getTopicsForSubject(value);
                    setTopics(newTopics);
                    setQuizzes([]);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select subject..." value="" />
                  {subjects.map((subject, index) => (
                    <Picker.Item
                      key={subject + index}
                      label={subject}
                      value={subject}
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {/* Topic */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>📝 Topic</Text>
            <View
              style={[
                styles.pickerWrapper,
                !selectedSubject && styles.disabledPicker,
              ]}
            >
              <Picker
                selectedValue={selectedTopic}
                onValueChange={(value) => {
                  setSelectedTopic(value);
                  setSelectedQuiz('');
                  const newQuizzes = getQuizzesForSubjectTopic(selectedSubject, value);
                  setQuizzes(newQuizzes);
                }}
                style={styles.picker}
                enabled={!!selectedSubject}
              >
                <Picker.Item
                  label={
                    !selectedSubject
                      ? 'Select subject first'
                      : topics.length === 0
                      ? 'No topics available'
                      : 'Select topic...'
                  }
                  value=""
                />
                {topics.map((topic, index) => (
                  <Picker.Item
                    key={topic + index}
                    label={topic}
                    value={topic}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Quiz */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>🎯 Available Quizzes</Text>
            <View
              style={[
                styles.pickerWrapper,
                !selectedTopic && styles.disabledPicker,
              ]}
            >
              <Picker
                selectedValue={selectedQuiz}
                onValueChange={setSelectedQuiz}
                style={styles.picker}
                enabled={!!selectedTopic}
              >
                <Picker.Item
                  label={
                    !selectedTopic
                      ? 'Select topic first'
                      : quizzes.length === 0
                      ? 'No quizzes available'
                      : 'Select a quiz...'
                  }
                  value=""
                />
                {quizzes.map((quiz, index) => {
                  const isFirstQuiz = index === 0;
                  const topicIndex = topics.indexOf(selectedTopic);
                  const isFirstTopic = topicIndex === 0;
                  const isAccessible =
                    isPaidUser || (isFirstTopic && isFirstQuiz);
                  const lockSymbol = isPaidUser
                    ? ''
                    : isAccessible
                    ? '🆓 '
                    : '🔒 ';

                  return (
                    <Picker.Item
                      key={quiz + index}
                      label={`${lockSymbol}${quiz}`}
                      value={quiz}
                    />
                  );
                })}
              </Picker>
            </View>
          </View>

          {/* Begin Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.beginButton,
                (loading || !selectedQuiz || freeUserLocked) &&
                  styles.beginButtonDisabled,
              ]}
              onPress={handleBeginPress}
              disabled={loading || !selectedQuiz || freeUserLocked}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  loading || !selectedQuiz || freeUserLocked
                    ? ['#94a3b8', '#64748b']
                    : ['#3b82f6', '#1e40af']
                }
                style={styles.beginButtonGradient}
              >
                <View style={styles.beginButtonContent}>
                  <Text style={styles.beginButtonEmoji}>🚀</Text>
                  <Text style={styles.beginButtonText}>
                    {loading
                      ? 'Loading...'
                      : !selectedQuiz
                      ? 'Select Quiz First'
                      : freeUserLocked
                      ? '🔒 Upgrade Required'
                      : 'Start Assessment'}
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

  // Welcome card
  welcomeCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
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
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  classBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  classBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 4,
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Main card
  mainCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  subtitleSmall: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },

  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.3,
    borderColor: '#e5e7eb',
    borderRadius: 14,
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#0f172a',
  },
  disabledPicker: {
    opacity: 0.5,
    backgroundColor: '#f1f5f9',
  },

  // Begin button
  beginButton: {
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  beginButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  beginButtonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  beginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  beginButtonEmoji: {
    fontSize: 18,
  },
  beginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Loading states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
});
