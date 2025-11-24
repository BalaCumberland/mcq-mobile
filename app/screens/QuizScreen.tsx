import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import useQuizStore from '../store/QuizStore';
import ApiService from '../services/apiService';

import LaTeXRenderer from '../components/LaTeXRenderer';

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

  console.log('QuizScreen render:', { 
    quiz: !!quiz, 
    showResults, 
    currentQuestionIndex, 
    userAnswersLength: userAnswers.length,
    questionsLength: quiz?.questions?.length,
    willShowResults: showResults
  });
  
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

  if (!quiz) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const allAnswers = React.useMemo(() => {
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
  }, [currentQuestion]);

  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  console.log('Results check:', { showResults, forceResults, hasQuiz: !!quiz });
  
  // Submit quiz when results are requested
  useEffect(() => {
    if ((showResults || forceResults) && !quizResults && quiz) {
      const submitAndGetResults = async () => {
        try {
          const answers = quiz.questions.map((question, index) => {
            const userAns = userAnswers[index];
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
            response = await ApiService.submitQuiz(className, subjectName, topic, quizName, studentId, answers);
          } catch (firstError) {
            if (firstError.message.includes('404')) {
              // Try with topic-based quiz name as fallback
              const topicName = topic.replace('UNIT-1-', '').replace('+', ' ');
              quizName = `${topicName}-Exercise - 1-55MIN`;
              response = await ApiService.submitQuiz(className, subjectName, topic, quizName, studentId, answers);
            } else {
              throw firstError;
            }
          }
          
          setQuizResults(response);
        } catch (error) {
          console.log('API unavailable, using fallback results');
          console.log('Error:', error);
          console.log('Sample quiz question:', JSON.stringify(quiz.questions[0], null, 2));
          // Create fallback results
          const fallbackResults = quiz.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const allAnswers = question.allAnswers || [];
            const correctAnswer = allAnswers[0] || 'Unknown';
            const isCorrect = userAnswer === correctAnswer;
            const isSkipped = !userAnswer || userAnswer === '';
            
            return {
              qno: index + 1,
              question: question.question,
              correctAnswer: [correctAnswer],
              studentAnswer: userAnswer ? [userAnswer] : [],
              status: isSkipped ? 'skipped' : isCorrect ? 'correct' : 'incorrect',
              explanation: question.explanation || `This question tests your understanding of ${quiz.subjectName || 'the subject'} concepts. Review the correct answer and related theory.`
            };
          });
          
          const correctCount = fallbackResults.filter(r => r.status === 'correct').length;
          const wrongCount = fallbackResults.filter(r => r.status === 'incorrect').length;
          const skippedCount = fallbackResults.filter(r => r.status === 'skipped').length;
          
          setQuizResults({
            correctCount,
            wrongCount,
            skippedCount,
            totalCount: quiz.questions.length,
            percentage: (correctCount / quiz.questions.length) * 100,
            results: fallbackResults
          });
        }
      };
      
      submitAndGetResults();
    }
  }, [showResults, forceResults, quiz, userAnswers, quizResults]);

  if (showResults || forceResults) {
    if (!quizResults) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Loading Results...</Text>
        </View>
      );
    }
    
    const { correctCount = 0, wrongCount = 0, skippedCount = 0, totalCount = 0, percentage = 0, results = [] } = quizResults;

    return (
      <View style={styles.container}>
        <View style={styles.resultsHeader}>
          <Text style={styles.title}>Quiz Results</Text>
          <Text style={styles.score}>Score: {correctCount}/{totalCount} ({Math.round(percentage)}%)</Text>
        </View>
        
        <ScrollView style={styles.scrollView}>
          {results.map((result, index) => {
            const isCorrect = result.status === 'correct';
            const isSkipped = result.status === 'skipped';
            const correctAnswers = Array.isArray(result.correctAnswer) ? result.correctAnswer : [result.correctAnswer];
            const userAnswer = result.studentAnswer?.[0] || 'Not answered';
            
            return (
              <View key={index} style={styles.resultCard}>
                <Text style={styles.questionNumber}>Question {result.qno}</Text>
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
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
        <View style={styles.headerRight}>
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
      
      <ScrollView style={styles.answersContainer} showsVerticalScrollIndicator={true}>
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
            
            <ScrollView style={styles.questionGrid} nestedScrollEnabled={true}>
              <View style={styles.gridContainer}>
                {Array.from({ length: quiz.questions.length }, (_, index) => {
                  const questionNum = index + 1;
                  const isAnswered = userAnswers[index] && userAnswers[index] !== '';
                  const isSkipped = userAnswers[index] === null || userAnswers[index] === '';
                  const isCurrent = index === currentQuestionIndex;
                  
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
                        console.log('BUTTON PRESSED:', questionNum);
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
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
    maxHeight: '80%',
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
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ccc',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    lineHeight: 24,
  },
  answersContainer: {
    flex: 1,
  },
  answerButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
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
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  answerText: {
    fontSize: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});

export default QuizScreen;