import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import useQuizStore from '../store/QuizStore';
import ApiService from '../services/apiService';
import LaTeXRenderer from '../components/LaTeXRenderer';
import LoadingAnimation from '../components/LoadingAnimation';
import ScreenWrapper from '../components/ScreenWrapper';
import QuizResultsView from '../components/QuizResultsView';
import {
  designSystem,
  colors,
  spacing,
  borderRadius,
  shadows,
} from '../styles/designSystem';

const ITEMS_PER_PAGE = 5;

const QuizScreen = ({ navigation, route }) => {
  const {
    quiz,
    currentQuestionIndex,
    userAnswers,
    showResults,
    timeRemaining,
    nextQuestion,
    prevQuestion,
    selectAnswer,
    finishQuiz,
    updateTimer,
    setPage,
  } = useQuizStore();

  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [forceResults, setForceResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const mainScrollRef = useRef<ScrollView | null>(null);

  // ----- Header: show questions button + timer in params -----
  React.useLayoutEffect(() => {
    navigation.setParams({
      timeRemaining: timeRemaining || 0,
    });
  }, [navigation, timeRemaining]);

  React.useLayoutEffect(() => {
    if (showResults || forceResults) {
      navigation.setParams({
        showingResults: true,
      });
      navigation.setOptions({
        headerRight: undefined,
        headerTitle: undefined,
      });
    } else {
      navigation.setParams({
        showingResults: false,
      });
      const timeRemaining = route?.params?.timeRemaining || 0;
      navigation.setOptions({
        headerTitle: () => (
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
            ⏰ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </Text>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setShowQuestionPanel(true)}
            style={{ backgroundColor: '#ffffff20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 16 }}
          >
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>📋 Questions</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, showResults, forceResults, timeRemaining, route?.params?.timeRemaining]);

  // Reset scroll when question changes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [currentQuestionIndex]);

  // Timer handling
  useEffect(() => {
    if (showResults || forceResults) return;

    const interval = setInterval(() => {
      updateTimer();
      if (timeRemaining <= 0) {
        setForceResults(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [updateTimer, showResults, forceResults, timeRemaining]);

  // Android back handling
  useFocusEffect(
    useCallback(() => {
      if (showResults || forceResults) {
        return;
      }

      const backAction = () => {
        if (quiz) {
          Alert.alert(
            'Exit quiz?',
            'Are you sure you want to exit? Your progress will be lost.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Exit',
                onPress: () => {
                  const { resetQuiz } = useQuizStore.getState();
                  resetQuiz();
                  navigation.navigate('Home');
                },
              },
            ]
          );
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove();
    }, [quiz, showResults, forceResults, navigation])
  );

  // Shuffle + collect options for current question
  const allAnswers = useMemo(() => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return [];
    const currentQuestion = quiz.questions[currentQuestionIndex];

    if (Array.isArray(currentQuestion.allAnswers)) {
      return currentQuestion.allAnswers;
    }

    const incorrect = currentQuestion.incorrectAnswers || '';
    return [
      currentQuestion.correctAnswer,
      ...(typeof incorrect === 'string' ? incorrect.split(' ~~ ') : []),
    ]
      .filter(Boolean)
      .sort(() => Math.random() - 0.5);
  }, [quiz, currentQuestionIndex]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    const total = quizResults?.results?.length || 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [quizResults?.results?.length]);

  const handleGoHome = useCallback(() => {
    Alert.alert(
      'Leave quiz results?',
      'Are you sure you want to go back to home?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            const { resetQuiz } = useQuizStore.getState();
            resetQuiz();
            navigation.navigate('Home');
          },
        },
      ]
    );
  }, [navigation]);

  // Submit quiz & fetch results when results are triggered
  useEffect(() => {
    if ((showResults || forceResults) && !quizResults && quiz) {
      const submitAndGetResults = async () => {
        try {
          const answers = quiz.questions.map((question, index) => {
            const userAns = userAnswers[index];
            return {
              questionId: `q${index + 1}`,
              selectedAnswer: userAns || '',
            };
          });

          const className =
            route?.params?.className || quiz.className || 'CLS12-MPC';
          const subjectName =
            route?.params?.subjectName || quiz.subjectName || 'MATHS2A';
          const topic =
            route?.params?.topic || quiz.topic || 'UNIT-1-Complex Numbers';
          let quizName =
            route?.params?.quizName || quiz.quizName || quiz.title;

          const studentId = 'student123'; // TODO: from auth store

          let response;
          try {
            response = await ApiService.submitQuiz(
              className,
              subjectName,
              topic,
              quizName,
              studentId,
              answers,
              quiz
            );
            setQuizResults(response);
            return;
          } catch (firstError: any) {
            if (String(firstError?.message || '').includes('404')) {
              // fallback quizName
              const topicName = topic
                .replace('UNIT-1-', '')
                .replace('+', ' ');
              quizName = `${topicName}-Exercise - 1-55MIN`;
              response = await ApiService.submitQuiz(
                className,
                subjectName,
                topic,
                quizName,
                studentId,
                answers,
                quiz
              );
              setQuizResults(response);
              return;
            }
            throw firstError;
          }
        } catch (error: any) {
          const fallbackResults = {
            correctCount: 0,
            wrongCount: 0,
            skippedCount: quiz.questions.length,
            totalCount: quiz.questions.length,
            percentage: 0,
            results: quiz.questions.map((question, index) => ({
              qno: index + 1,
              question: question.question,
              status: 'skipped',
              correctAnswer: [question.correctAnswer],
              studentAnswer: [userAnswers[index] || 'Not answered'],
              explanation: 'Results could not be loaded from server.',
            })),
          };
          setQuizResults(fallbackResults);
        }
      };

      submitAndGetResults();
    }
  }, [showResults, forceResults, quiz, userAnswers, quizResults, route?.params]);

  if (!quiz) {
    return <LoadingAnimation />;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  // ---- Results mode ----
  if (showResults || forceResults) {
    if (!quizResults) {
      return <LoadingAnimation text="Loading results..." />;
    }

    return (
      <ScreenWrapper navigation={navigation}>
        <QuizResultsView
          results={quizResults}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          title="🎯 Quiz Results"
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
      </ScreenWrapper>
    );
  }

  // ---- Active quiz mode ----
  const answeredCount = userAnswers.filter(a => a && a !== '').length;
  const progressPercent =
    quiz.questions.length === 0
      ? 0
      : ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
        {/* timer could be shown here if you like */}
      </View>

      {/* Progress section */}
      <LinearGradient
        colors={['#F9FAFB', '#FFFFFF']}
        style={styles.progressContainer}
      >
        <View style={styles.progressStats}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{quiz.questions.length} Questions
          </Text>
          <Text style={styles.progressText}>{answeredCount} Answered</Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </LinearGradient>

      {/* Main content */}
      <ScrollView
        ref={mainScrollRef}
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={styles.questionSection}>
          <View style={styles.questionContainer}>
                    <LaTeXRenderer
                      text={currentQuestion.question}
                      style={styles.question}
                      fontSize={16}
                    />
          </View>
        </View>

        {/* Answers */}
        <View style={styles.answersSection}>
          <View style={styles.answersWrapper}>
            {allAnswers.map((answer, index) => {
              const isSelected = userAnswers[currentQuestionIndex] === answer;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.answerButton,
                    isSelected && styles.selectedAnswer,
                  ]}
                  onPress={() => selectAnswer(answer)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={
                      isSelected
                        ? ['#DBEAFE', '#BFDBFE']
                        : ['#F9FAFB', '#FFFFFF']
                    }
                    style={styles.answerGradient}
                  >
                    <View style={styles.answerRow}>
                      <View
                        style={[
                          styles.radioButton,
                          isSelected && styles.radioSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <LaTeXRenderer
                        text={answer}
                        style={styles.answerText}
                        fontSize={16}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.prevButton,
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            ← Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            isLastQuestion ? styles.finishButton : styles.nextButton,
          ]}
          onPress={() => {
            if (isLastQuestion) {
              setForceResults(true);
            } else {
              nextQuestion();
            }
          }}
        >
          <Text style={styles.navButtonText}>
            {isLastQuestion ? 'Finish ✓' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Question panel modal */}
      <Modal
        visible={showQuestionPanel}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuestionPanel(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.questionPanel} edges={['top', 'bottom']}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Questions</Text>
              <TouchableOpacity
                onPress={() => setShowQuestionPanel(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: '#059669' },
                  ]}
                />
                <Text style={styles.legendText}>Answered</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: '#F59E0B' },
                  ]}
                />
                <Text style={styles.legendText}>Skipped</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: '#D1D5DB' },
                  ]}
                />
                <Text style={styles.legendText}>Not visited</Text>
              </View>
            </View>

            {/* Question grid */}
            <ScrollView
              style={styles.questionGrid}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              <View style={styles.gridContainer}>
                {Array.from(
                  { length: quiz.questions.length },
                  (_, index) => {
                    const questionNum = index + 1;
                    const value = userAnswers[index];
                    const isAnswered = value && value !== '';
                    const isSkipped =
                      value === null || value === '' || value === undefined;
                    const isCurrent = index === currentQuestionIndex;

                    let buttonStyle = styles.questionButton;
                    if (isCurrent) {
                      buttonStyle = {
                        ...buttonStyle,
                        ...styles.currentQuestion,
                      };
                    } else if (isAnswered) {
                      buttonStyle = {
                        ...buttonStyle,
                        ...styles.answeredQuestion,
                      };
                    } else if (isSkipped) {
                      buttonStyle = {
                        ...buttonStyle,
                        ...styles.skippedQuestion,
                      };
                    }

                    return (
                      <TouchableOpacity
                        key={questionNum}
                        activeOpacity={0.8}
                        style={buttonStyle}
                        onPress={() => {
                          setPage(index);
                          setShowQuestionPanel(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.questionButtonText,
                            (isCurrent || isAnswered || isSkipped) &&
                              styles.questionButtonTextActive,
                          ]}
                        >
                          {questionNum}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...designSystem.headingMedium,
    fontWeight: '700',
  },

  // Progress
  progressContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingTop: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: 14,
    color: colors.neutral[800],
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },

  // Main content
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 20,
  },
  questionSection: {
    marginBottom: 20,
  },
  questionContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
  },
  question: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    fontWeight: '500',
    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
  },

  // Answers
  answersSection: {
    marginBottom: 20,
  },
  answersWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
  },
  answerButton: {
    backgroundColor: 'transparent',
    marginVertical: 4,
    borderRadius: 10,
  },
  answerGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  selectedAnswer: {
    shadowColor: '#3B82F6',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  answerText: {
    fontSize: 16,
    color: colors.neutral[800],
    fontWeight: '400',
    lineHeight: 24,
    fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
  },

  // Bottom navigation
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  prevButton: {
    backgroundColor: '#1D4ED8',
  },
  nextButton: {
    backgroundColor: '#1D4ED8',
  },
  finishButton: {
    backgroundColor: '#1E40AF',
  },
  navButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  questionPanel: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '75%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '600',
  },

  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  questionGrid: {
    flex: 1,
    minHeight: 200,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  questionButton: {
    width: 48,
    height: 48,
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  currentQuestion: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.25,
    elevation: 3,
  },
  answeredQuestion: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOpacity: 0.25,
    elevation: 3,
  },
  skippedQuestion: {
    backgroundColor: '#D97706',
    shadowColor: '#D97706',
    shadowOpacity: 0.25,
    elevation: 3,
  },
  questionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  questionButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default QuizScreen;
