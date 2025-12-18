import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useQuizStore from '../store/QuizStore';
import ApiService from '../services/apiService';
import LaTeXRenderer from '../components/LaTeXRenderer';
import { designSystem, colors, spacing, borderRadius, shadows } from '../styles/designSystem';



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
  const [forceResults, setForceResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const scrollViewRef = React.useRef(null);

  // Force results if we have quiz data but showResults is false after finish
  React.useEffect(() => {
    console.log('showResults changed:', showResults);
  }, [showResults]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTimer();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updateTimer]);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (quiz && !showResults && !forceResults) {
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

  const allAnswers = React.useMemo(() => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) return [];
    const currentQuestion = quiz.questions[currentQuestionIndex];
    // Use allAnswers from API if available, otherwise fallback to old format
    if (currentQuestion.allAnswers && Array.isArray(currentQuestion.allAnswers)) {
      return currentQuestion.allAnswers;
    }
    
    // Fallback for old format
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
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  console.log('Results check:', { showResults, forceResults, hasQuiz: !!quiz });

  if (showResults || forceResults) {
    if (!quizResults) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Loading Results...</Text>
        </View>
      );
    }
    
    const { correctCount = 0, wrongCount = 0, skippedCount = 0, totalCount = 0, percentage = 0, results = [] } = quizResults;
    
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.title}>🎯 Quiz Results</Text>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: percentage >= 80 ? '#4CAF50' : percentage >= 60 ? '#FF9800' : '#f44336' }]}>
              <Text style={[styles.scorePercentage, { color: percentage >= 80 ? '#4CAF50' : percentage >= 60 ? '#FF9800' : '#f44336' }]}>{Math.round(percentage)}%</Text>
            </View>
            <Text style={styles.scoreText}>{correctCount}/{totalCount} Correct</Text>
          </View>
          {totalPages > 1 && <Text style={styles.pageInfo}>📄 Page {currentPage} of {totalPages}</Text>}
        </View>
        
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
              <View key={index} style={[styles.resultCard, isCorrect ? styles.correctCard : isSkipped ? styles.skippedCard : styles.incorrectCard]}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Q{result.qno}</Text>
                  <View style={[styles.statusBadge, isCorrect ? styles.correctBadge : isSkipped ? styles.skippedBadge : styles.incorrectBadge]}>
                    <Text style={styles.statusText}>{isCorrect ? '✓' : isSkipped ? '⏭' : '✗'}</Text>
                  </View>
                </View>
                <LaTeXRenderer text={result.question} style={styles.questionText} />
                
                <Text style={[
                  styles.resultLabel,
                  { color: isCorrect ? '#4CAF50' : isSkipped ? '#FF9800' : '#f44336' }
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
                
                <View style={styles.answerSection}>
                  <Text style={styles.explanationLabel}>Explanation:</Text>
                  <LaTeXRenderer text={result.explanation || 'No explanation available'} style={styles.explanation} />
                </View>
              </View>
            );
          })}
        </ScrollView>
        
        <SafeAreaView style={styles.resultsFooter} edges={['bottom']}>
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity 
                style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                onPress={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  // Scroll to top when changing pages
                  setTimeout(() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({ y: 0, animated: true });
                    }
                  }, 100);
                }}
                disabled={currentPage === 1}
              >
                <Text style={styles.paginationButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.paginationText}>Page {currentPage} of {totalPages}</Text>
              <TouchableOpacity 
                style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                onPress={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  // Scroll to top when changing pages
                  setTimeout(() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({ y: 0, animated: true });
                    }
                  }, 100);
                }}
                disabled={currentPage === totalPages}
              >
                <Text style={styles.paginationButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.homeButton, { backgroundColor: percentage >= 80 ? '#4CAF50' : '#1e40af' }]} 
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
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.questionsButton}
            onPress={() => {
              console.log('Questions button pressed, opening modal');
              setShowQuestionPanel(true);
            }}
          >
            <Text style={styles.questionsButtonText}>📋 Questions</Text>
          </TouchableOpacity>
          <Text style={styles.timer}>
            ⏰ {Math.floor((timeRemaining || 0) / 60)}:{((timeRemaining || 0) % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStats}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{quiz.questions.length} Questions
          </Text>
          <Text style={styles.progressText}>
            {userAnswers.filter(answer => answer && answer !== '').length} Answered
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>
      
      <LaTeXRenderer text={currentQuestion.question} style={styles.question} />
      
      <ScrollView 
        style={styles.answersContainer} 
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
      >
        {allAnswers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.answerButton,
              userAnswers[currentQuestionIndex] === answer && styles.selectedAnswer
            ]}
            onPress={() => selectAnswer(answer)}
          >
            <View style={styles.answerRow}>
              <View style={[
                styles.radioButton,
                userAnswers[currentQuestionIndex] === answer && styles.radioSelected
              ]} />
              <LaTeXRenderer text={answer} style={styles.answerText} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
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
          <View style={styles.questionPanel}>
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: '#f8fafc',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionPanel: {
    backgroundColor: '#fff',
    width: '90%',
    height: '70%',
    borderRadius: 12,
    padding: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  questionGrid: {
    flex: 1,
    minHeight: 200,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionButton: {
    width: 44,
    height: 44,
    backgroundColor: '#ccc',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  currentQuestion: {
    backgroundColor: '#2196F3',
  },
  answeredQuestion: {
    backgroundColor: '#4CAF50',
  },
  skippedQuestion: {
    backgroundColor: '#FF9800',
  },
  questionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  questionButtonTextActive: {
    color: '#fff',
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
  question: {
    fontSize: 18,
    marginBottom: spacing.xl,
    lineHeight: 26,
    color: colors.neutral[800],
    fontWeight: '600',
  },
  answersContainer: {
    flex: 1,
  },
  answerButton: {
    backgroundColor: colors.neutral[100],
    padding: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
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
    borderColor: colors.primary[500], // border-orange-400
    backgroundColor: colors.primary[50], // bg-orange-50 to red-50 gradient
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
  },
  navButton: {
    ...designSystem.buttonSecondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  disabledButton: {
    ...designSystem.buttonDisabled,
  },
  navButtonText: {
    ...designSystem.buttonText,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  resultsHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  score: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
    color: '#2196F3',
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
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  answerSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
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
    lineHeight: 20,
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
    lineHeight: 20,
  },
  explanationLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  explanation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 10,
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
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
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
  explanationLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  explanation: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  pageInfo: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scorePercentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctBadge: {
    backgroundColor: '#4CAF50',
  },
  incorrectBadge: {
    backgroundColor: '#f44336',
  },
  skippedBadge: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  correctCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  incorrectCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  skippedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
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
  homeButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  paginationButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paginationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  paginationText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default QuizScreen;