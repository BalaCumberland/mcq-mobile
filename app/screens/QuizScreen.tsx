import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import useQuizStore from '../store/QuizStore';

const QuizScreen = ({ navigation }) => {
  const { 
    quiz, 
    currentQuestionIndex, 
    userAnswers, 
    showResults,
    nextQuestion, 
    prevQuestion, 
    selectAnswer,
    finishQuiz
  } = useQuizStore();

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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Quiz Results</Text>
        <Text style={styles.score}>Score: {correctCount}/{quiz.questions.length}</Text>
        
        {quiz.questions.map((question, index) => {
          const isCorrect = userAnswers[index] === question.correctAnswer;
          return (
            <View key={index} style={styles.resultCard}>
              <Text style={styles.questionText}>{question.question}</Text>
              <Text style={[styles.resultLabel, { color: isCorrect ? 'green' : 'red' }]}>
                {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
              </Text>
              <Text style={styles.correctAnswer}>
                Correct Answer: {question.correctAnswer}
              </Text>
              {!isCorrect && (
                <Text style={styles.userAnswer}>
                  Your Answer: {userAnswers[index] || 'Not answered'}
                </Text>
              )}
            </View>
          );
        })}
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Question {currentQuestionIndex + 1} of {quiz.questions.length}
      </Text>
      
      <Text style={styles.question}>{currentQuestion.question}</Text>
      
      <View style={styles.answersContainer}>
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
              <Text style={styles.answerText}>{answer}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
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
            style={styles.navButton}
            onPress={nextQuestion}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  correctAnswer: {
    fontSize: 14,
    color: 'green',
    marginBottom: 5,
  },
  userAnswer: {
    fontSize: 14,
    color: 'red',
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
  scrollContent: {
    paddingBottom: 20,
  },
});

export default QuizScreen;