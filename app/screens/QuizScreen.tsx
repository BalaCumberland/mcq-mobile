import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import useQuizStore from '../store/QuizStore';

import LaTeXRenderer from '../components/LaTeXRenderer';

const QuizScreen = ({ navigation }) => {
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
    updateTimer
  } = useQuizStore();

  useEffect(() => {
    const interval = setInterval(() => {
      updateTimer();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updateTimer]);

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const allAnswers = React.useMemo(() => [
    currentQuestion.correctAnswer,
    ...currentQuestion.incorrectAnswers.split(' ~~ ')
  ].sort(() => Math.random() - 0.5), [currentQuestion]);

  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  if (showResults) {
    const correctCount = userAnswers.reduce((count, answer, index) => {
      return answer === quiz.questions[index].correctAnswer ? count + 1 : count;
    }, 0);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quiz Results</Text>
        <Text style={styles.score}>Score: {correctCount}/{quiz.questions.length}</Text>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {quiz.questions.map((question, index) => {
          const isCorrect = userAnswers[index] === question.correctAnswer;
          return (
            <View key={index} style={styles.resultCard}>
              <LaTeXRenderer text={question.question} style={styles.questionText} />
              <Text style={[styles.resultLabel, { color: isCorrect ? 'green' : 'red' }]}>
                {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
              </Text>
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerLabel}>Correct Answer: </Text>
                <LaTeXRenderer text={question.correctAnswer} style={styles.correctAnswer} />
              </View>
              {!isCorrect && (
                <>
                  <View style={styles.userAnswerContainer}>
                    <Text style={styles.userAnswerLabel}>Your Answer: </Text>
                    <LaTeXRenderer text={userAnswers[index] || 'Not answered'} style={styles.userAnswer} />
                  </View>
                  <View style={styles.explanationContainer}>
                    <Text style={styles.explanationLabel}>Explanation: </Text>
                    <LaTeXRenderer text={question.explanation} style={styles.explanation} />
                  </View>
                </>
              )}
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
        <Text style={styles.timer}>
          ⏰ {Math.floor((timeRemaining || 0) / 60)}:{((timeRemaining || 0) % 60).toString().padStart(2, '0')}
        </Text>
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
        
        {isLastQuestion ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={finishQuiz}
          >
            <Text style={styles.navButtonText}>Show Results</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, !userAnswers[currentQuestionIndex] && styles.disabledButton]}
            onPress={nextQuestion}
            disabled={!userAnswers[currentQuestionIndex]}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
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
  score: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
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
  correctAnswerContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  correctAnswerLabel: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
  },
  correctAnswer: {
    fontSize: 14,
    color: 'green',
  },
  userAnswerContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  userAnswerLabel: {
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold',
  },
  userAnswer: {
    fontSize: 14,
    color: 'red',
  },
  explanationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  explanationLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  explanation: {
    fontSize: 14,
    color: '#666',
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
  scrollContent: {
    paddingBottom: 20,
  },
});

export default QuizScreen;