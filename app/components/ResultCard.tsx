import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LaTeXRenderer from './LaTeXRenderer';
import ExplanationView from './ExplanationView';

interface ResultCardProps {
  result: {
    qno: number;
    question: string;
    status: 'correct' | 'incorrect' | 'skipped';
    correctAnswer: string | string[];
    studentAnswer: string[];
    explanation: string;
  };
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const isCorrect = result.status === 'correct';
  const isSkipped = result.status === 'skipped';
  const correctAnswers = Array.isArray(result.correctAnswer) ? result.correctAnswer : [result.correctAnswer];
  const userAnswer = result.studentAnswer && result.studentAnswer.length > 0 
    ? result.studentAnswer[0] 
    : 'Not answered';

  return (
    <LinearGradient
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
      
      <ExplanationView explanation={result.explanation || 'No explanation available'} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 5,
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
    flexWrap: 'wrap',
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
    flexWrap: 'wrap',
  },
});

export default ResultCard;