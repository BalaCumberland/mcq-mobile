import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getAuthToken } from '../services/firebaseAuth';
import { LAMBDA_MCQ_GO_API_URL } from '../config/env';

export default function ReviewScreen({ route }) {
  const { quizName, className, subjectName, topic } = route.params;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = await getAuthToken();
      const params = new URLSearchParams({
        quizName,
        className,
        subjectName,
        topic
      });
      
      const response = await fetch(`${LAMBDA_MCQ_GO_API_URL}/quiz/result?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading Results...</Text>
      </View>
    );
  }

  if (!results) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Quiz Review</Text>
        <Text style={styles.score}>{results.percentage}%</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>✅ {results.correctCount} correct</Text>
          <Text style={styles.summaryText}>❌ {results.wrongCount} wrong</Text>
          <Text style={styles.summaryText}>⏭️ {results.skippedCount} skipped</Text>
        </View>
      </View>

      {results.results.map((result, index) => (
        <View key={index} style={[
          styles.questionCard,
          result.status === 'correct' && styles.correctCard,
          result.status === 'wrong' && styles.wrongCard,
          result.status === 'skipped' && styles.skippedCard
        ]}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Q{result.qno}</Text>
            <Text style={[
              styles.statusBadge,
              result.status === 'correct' && styles.correctBadge,
              result.status === 'wrong' && styles.wrongBadge,
              result.status === 'skipped' && styles.skippedBadge
            ]}>
              {result.status === 'correct' ? '✅' : result.status === 'wrong' ? '❌' : '⏭️'}
            </Text>
          </View>
          
          <Text style={styles.question}>{result.question}</Text>
          
          {result.studentAnswer && (
            <View style={styles.answerSection}>
              <Text style={styles.answerLabel}>Your Answer:</Text>
              <Text style={styles.studentAnswer}>{result.studentAnswer[0]}</Text>
            </View>
          )}
          
          <View style={styles.answerSection}>
            <Text style={styles.answerLabel}>Correct Answer:</Text>
            <Text style={styles.correctAnswer}>{result.correctAnswer[0]}</Text>
          </View>
          
          {result.explanation && (
            <View style={styles.explanationSection}>
              <Text style={styles.explanationLabel}>💡 Explanation:</Text>
              <Text style={styles.explanation}>{result.explanation}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
  },
  summary: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  correctCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  wrongCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  skippedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statusBadge: {
    fontSize: 16,
  },
  question: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
    lineHeight: 22,
  },
  answerSection: {
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  studentAnswer: {
    fontSize: 14,
    color: '#f44336',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
  },
  correctAnswer: {
    fontSize: 14,
    color: '#4CAF50',
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 4,
  },
  explanationSection: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  explanation: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});