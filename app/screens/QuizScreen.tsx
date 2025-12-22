import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, BackHandler, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useQuizStore from '../store/QuizStore';
import ApiService from '../services/apiService';
import LaTeXRenderer from '../components/LaTeXRenderer';
import ExplanationView from '../components/ExplanationView';
import LoadingAnimation from '../components/LoadingAnimation';
import ScreenWrapper from '../components/ScreenWrapper';
import QuizResultsHeader from '../components/QuizResultsHeader';
import { designSystem, colors, spacing, borderRadius, shadows } from '../styles/designSystem';
import LinearGradient from 'react-native-linear-gradient';



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
    skipQuestion,
    finishQuiz,
    updateTimer,
    setPage
  } = useQuizStore();
  
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [progressAnimation] = useState(new Animated.Value(0));
  const [scoreAnimation] = useState(new Animated.Value(0));
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [scrollHintAnimation] = useState(new Animated.Value(0));

  // Show scroll hint on first question
  useEffect(() => {
    if (currentQuestionIndex === 0) {
      const timer = setTimeout(() => {
        setShowScrollHint(true);
        Animated.loop(
          Animated.sequence([
            Animated.timing(scrollHintAnimation, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(scrollHintAnimation, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            })
          ]),
          { iterations: 3 }
        ).start(() => {
          setShowScrollHint(false);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex]);

  // Set up navigation header button and timer
  React.useLayoutEffect(() => {
    navigation.setParams({
      openQuestions: () => setShowQuestionPanel(true),
      timeRemaining: timeRemaining || 0
    });
  }, [navigation, timeRemaining]);
  
  React.useLayoutEffect(() => {
    if (showResults || forceResults) {
      navigation.setOptions({
        headerRight: undefined
      });
    }
  }, [navigation, showResults, forceResults]);
  const [forceResults, setForceResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const scrollViewRef = React.useRef(null);
  const answersScrollRef = React.useRef(null);
  const mainScrollRef = React.useRef(null);

  // Reset scroll position when question changes
  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [currentQuestionIndex]);

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

  useFocusEffect(
    React.useCallback(() => {
      // Only handle back button during active quiz, not during results
      if (showResults || forceResults) {
        return;
      }
      
      const backAction = () => {
        if (quiz) {
          Alert.alert(
            'Exit Quiz?',
            'Are you sure you want to exit? Your progress will be lost.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', onPress: () => {
                // Clear quiz state before navigating
                const { resetQuiz } = useQuizStore.getState();
                resetQuiz();
                navigation.navigate('Home');
              }}
            ]
          );
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [quiz, showResults, forceResults, navigation])
  );

  const allAnswers = useMemo(() => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return [];
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (currentQuestion.allAnswers && Array.isArray(currentQuestion.allAnswers)) {
      return currentQuestion.allAnswers;
    }
    const incorrect = currentQuestion.incorrectAnswers || '';
    return [
      currentQuestion.correctAnswer,
      ...(typeof incorrect === 'string' ? incorrect.split(' ~~ ') : [])
    ].filter(Boolean).sort(() => Math.random() - 0.5);
  }, [quiz, currentQuestionIndex]);

  // Submit quiz when results are requested
  useEffect(() => {
    if ((showResults || forceResults) && !quizResults && quiz) {
      const submitAndGetResults = async () => {
        try {
          console.log('UserAnswers array:', userAnswers);
          const answers = quiz.questions.map((question, index) => {
            const userAns = userAnswers[index];
            console.log(`Question ${index + 1}: userAnswer = "${userAns}"`);
            return {
              questionId: `q${index + 1}`,
              selectedAnswer: userAns || ''
            };
          });
          
          // Get the actual selected values from navigation params or quiz object
          const className = route?.params?.className || quiz.className || 'CLS12-MPC';
          const subjectName = route?.params?.subjectName || quiz.subjectName || 'MATHS2A';
          const topic = route?.params?.topic || quiz.topic || 'UNIT-1-Complex Numbers';
          const quizName = route?.params?.quizName || quiz.quizName || quiz.title;
          
          console.log('Quiz data for submit:', {
            className,
            subjectName, 
            topic,
            quizName,
            routeParams: route?.params
          });
          let response;
          
          const studentId = 'student123'; // TODO: Get from user store
          
          try {
            response = await ApiService.submitQuiz(className, subjectName, topic, quizName, studentId, answers, quiz);
            console.log('API Response:', JSON.stringify(response, null, 2));
            if (response.results && response.results.length > 0) {
              console.log('Sample result:', JSON.stringify(response.results[0], null, 2));
            }
            setQuizResults(response);
            return; // Exit early if API succeeds
          } catch (firstError) {
            console.log('First API call failed:', firstError);
            if (firstError.message.includes('404')) {
              // Try with topic-based quiz name as fallback
              const topicName = topic.replace('UNIT-1-', '').replace('+', ' ');
              quizName = `${topicName}-Exercise - 1-55MIN`;
              try {
                response = await ApiService.submitQuiz(className, subjectName, topic, quizName, studentId, answers, quiz);
                console.log('Fallback API Response:', response);
                setQuizResults(response);
                return; // Exit early if fallback API succeeds
              } catch (secondError) {
                console.log('Fallback API also failed:', secondError);
                throw secondError;
              }
            } else {
              throw firstError;
            }
          }
        } catch (error) {
          console.error('Quiz submission failed:', error);
          // Create fallback results if API fails
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
              explanation: 'Results could not be loaded from server'
            }))
          };
          setQuizResults(fallbackResults);
        }
      };
      
      submitAndGetResults();
    }
  }, [showResults, forceResults, quiz, userAnswers, quizResults]);

  console.log('QuizScreen render:', { 
    quiz: !!quiz, 
    showResults, 
    currentQuestionIndex, 
    userAnswersLength: userAnswers.length,
    questionsLength: quiz?.questions?.length,
    willShowResults: showResults
  });

  if (!quiz) {
    return <LoadingAnimation />;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  console.log('Results check:', { showResults, forceResults, hasQuiz: !!quiz });

  if (showResults || forceResults) {
    if (!quizResults) {
      return <LoadingAnimation text="Loading Results..." />;
    }
    
    const { correctCount = 0, wrongCount = 0, skippedCount = 0, totalCount = 0, percentage = 0, results = [] } = quizResults;
    
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

    return (
      <ScreenWrapper navigation={navigation}>
        <View style={styles.resultsContainer}>
        <QuizResultsHeader
          title="🎯 Quiz Results"
          percentage={percentage}
          correctCount={correctCount}
          wrongCount={wrongCount}
          skippedCount={skippedCount}
        />
        
        {totalPages > 1 && <Text style={styles.pageInfo}>📄 Page {currentPage} of {totalPages}</Text>}
        
        <ScrollView 
          ref={scrollViewRef} 
          style={styles.resultsScrollView} 
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
        >
          {paginatedResults.map((result, index) => {
            const isCorrect = result.status === 'correct';
            const isSkipped = result.status === 'skipped';
            const correctAnswers = Array.isArray(result.correctAnswer) ? result.correctAnswer : [result.correctAnswer];
            const userAnswer = result.studentAnswer && result.studentAnswer.length > 0 
              ? result.studentAnswer[0] 
              : 'Not answered';
            
            return (
              <LinearGradient
                key={index}
                colors={['#ffffff', '#f8fafc']}
                style={[styles.resultCard, isCorrect ? styles.correctCard : isSkipped ? styles.skippedCard : styles.incorrectCard]}
              >
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Q{result.qno}</Text>
                  <LinearGradient
                    colors={isCorrect ? ['#10b981', '#059669'] : isSkipped ? ['#f59e0b', '#d97706'] : ['#ef4444', '#dc2626']}
                    style={styles.statusBadge}
                  >
                    <Text style={styles.statusText}>{isCorrect ? '✓' : isSkipped ? '⏭' : '✗'}</Text>
                  </LinearGradient>
                </View>
                <LaTeXRenderer text={result.question} style={styles.questionText} />
                
                <Text style={[
                  styles.resultLabel,
                  { color: isCorrect ? '#10b981' : isSkipped ? '#f59e0b' : '#ef4444' }
                ]}>
                  {isCorrect ? '✓ CORRECT' : isSkipped ? '⏭ SKIPPED' : '✗ INCORRECT'}
                </Text>
                
                <View style={styles.answerSection}>
                  <Text style={styles.correctAnswerLabel}>Correct Answer:</Text>
                  {correctAnswers.map((answer, idx) => (
                    <LaTeXRenderer key={idx} text={answer} style={styles.correctAnswer} />
                  ))}
                </View>
                
                {!isCorrect && (
                  <View style={styles.answerSection}>
                    <Text style={styles.userAnswerLabel}>Your Answer:</Text>
                    <LaTeXRenderer 
                      text={isSkipped ? 'Skipped' : userAnswer} 
                      style={styles.userAnswer} 
                    />
                  </View>
                )}
                
                <ExplanationView 
                  explanation={result.explanation || 'No explanation available'} 
                  questionId={result.qno}
                />
              </LinearGradient>
            );
          })}
        </ScrollView>
        
        <SafeAreaView style={styles.resultsFooter} edges={['bottom']}>
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity 
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                onPress={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  setTimeout(() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({ y: 0, animated: true });
                    }
                  }, 100);
                }}
                disabled={currentPage === 1}
              >
                <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                  ← Previous
                </Text>
              </TouchableOpacity>
              
              <View style={styles.pageIndicator}>
                <Text style={styles.paginationText}>{currentPage} / {totalPages}</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                onPress={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  setTimeout(() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({ y: 0, animated: true });
                    }
                  }, 100);
                }}
                disabled={currentPage === totalPages}
              >
                <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                  Next →
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => {
              Alert.alert(
                'Leave Quiz Results?',
                'Are you sure you want to go back to home?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Yes', onPress: () => {
                    const { resetQuiz } = useQuizStore.getState();
                    resetQuiz();
                    navigation.navigate('Home');
                  }}
                ]
              );
            }}
          >
            <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
          </TouchableOpacity>
          </SafeAreaView>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
      </View>
      
      {/* Progress Bar */}
      <LinearGradient
        colors={['#f8fafc', '#ffffff']}
        style={styles.progressContainer}
      >
        <View style={styles.progressStats}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{quiz.questions.length} Questions
          </Text>
          <Text style={styles.progressText}>
            {userAnswers.filter(answer => answer && answer !== '').length} Answered
          </Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#3b82f6', '#1e40af']}
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
            ]}
          />
        </View>
      </LinearGradient>
      
      <ScrollView 
        ref={mainScrollRef}
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionSection}>
          <View style={styles.questionContainer}>
            <LaTeXRenderer text={currentQuestion.question} style={styles.question} />
          </View>
        </View>
        
        <View style={styles.answersSection}>
          <View style={styles.answersWrapper}>
            {allAnswers.map((answer, index) => {
              const isSelected = userAnswers[currentQuestionIndex] === answer;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.answerButton,
                    isSelected && styles.selectedAnswer
                  ]}
                  onPress={() => selectAnswer(answer)}
                >
                  <LinearGradient
                    colors={isSelected ? ['#dbeafe', '#bfdbfe'] : ['#f8fafc', '#ffffff']}
                    style={styles.answerGradient}
                  >
                    <View style={styles.answerRow}>
                      <View style={[
                        styles.radioButton,
                        isSelected && styles.radioSelected
                      ]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <LaTeXRenderer text={answer} style={styles.answerText} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
            ← Previous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, isLastQuestion ? styles.finishButton : styles.nextButton]}
          onPress={() => {
            if (isLastQuestion) {
              console.log('FINISH CLICKED - Forcing results');
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
      
      <Modal
        visible={showQuestionPanel}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQuestionPanel(false)}
      >
        {console.log('Modal rendering, visible:', showQuestionPanel)}
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.questionPanel} edges={['top', 'bottom']}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Questions</Text>
              <TouchableOpacity onPress={() => setShowQuestionPanel(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Answered</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>Skipped</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#ccc' }]} />
                <Text style={styles.legendText}>Not Visited</Text>
              </View>
            </View>
            
            <ScrollView 
              style={styles.questionGrid} 
              nestedScrollEnabled={true} 
              showsVerticalScrollIndicator={true}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
            >
              <View style={styles.gridContainer}>
                {console.log('Rendering question buttons, total questions:', quiz.questions.length)}
                {Array.from({ length: quiz.questions.length }, (_, index) => {
                  const questionNum = index + 1;
                  const isAnswered = userAnswers[index] && userAnswers[index] !== '';
                  const isSkipped = userAnswers[index] === null || userAnswers[index] === '';
                  const isCurrent = index === currentQuestionIndex;
                  
                  console.log(`Question ${questionNum}: answered=${isAnswered}, skipped=${isSkipped}, current=${isCurrent}`);
                  return (
                    <TouchableOpacity
                      key={questionNum}
                      activeOpacity={0.7}
                      style={[
                        styles.questionButton,
                        isCurrent && styles.currentQuestion,
                        isAnswered && !isCurrent && styles.answeredQuestion,
                        isSkipped && !isCurrent && !isAnswered && styles.skippedQuestion
                      ]}
                      onPress={() => {
                        console.log('BUTTON PRESSED:', questionNum, 'Going to index:', index);
                        setPage(index);
                        setShowQuestionPanel(false);
                      }}
                    >
                      <Text style={[
                        styles.questionButtonText,
                        (isCurrent || isAnswered || isSkipped) && styles.questionButtonTextActive
                      ]}>
                        {questionNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  questionsButton: {
    backgroundColor: colors.secondary[500], // blue-100 background with blue-700 text
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  questionsButtonText: {
    color: '#ffffff', // text-blue-700
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },

  progressContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
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
    backgroundColor: colors.primary[500], // orange-500 to red-500 gradient
    borderRadius: borderRadius.full,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    padding: 20,
  },
  questionPanel: {
    backgroundColor: '#ffffff',
    width: '100%',
    height: '75%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '600',
    padding: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
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
    gap: 12,
    justifyContent: 'flex-start',
  },
  questionButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentQuestion: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
  },
  answeredQuestion: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOpacity: 0.3,
  },
  skippedQuestion: {
    backgroundColor: '#d97706',
    shadowColor: '#d97706',
    shadowOpacity: 0.3,
  },
  questionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  questionButtonTextActive: {
    color: '#ffffff',
  },
  title: {
    ...designSystem.headingMedium,
    fontWeight: '700',
  },
  timer: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.error[500],
  },
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
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    padding: 16,
  },
  question: {
    fontSize: 18,
    lineHeight: 26,
    color: '#374151',
    fontWeight: '600',
  },
  answersSection: {
    marginBottom: 20,
  },
  answersWrapper: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
  },
  answerButton: {
    backgroundColor: 'transparent',
    padding: spacing.lg,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 0,
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
    borderColor: '#ccc',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  selectedAnswer: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.1,
  },
  answerText: {
    fontSize: 16,
    color: colors.neutral[800],
    fontWeight: '500',
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prevButton: {
    backgroundColor: '#64748b',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
  },
  finishButton: {
    backgroundColor: '#10b981',
  },
  navButtonDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#9ca3af',
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  pageInfo: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  answerSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  correctAnswerLabel: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  correctAnswer: {
    fontSize: 14,
    color: '#333',
  },
  userAnswerLabel: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userAnswer: {
    fontSize: 14,
    color: '#333',
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  correctCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  incorrectCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  skippedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  resultsScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  resultsFooter: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paginationButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  paginationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationButtonTextDisabled: {
    color: '#9ca3af',
  },
  pageIndicator: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paginationText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  answerGradient: {
    padding: spacing.lg,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },


});

export default QuizScreen;