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
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  score: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 16,
  },
  summary: {
    flexDirection: 'row',
    gap: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  correctCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  wrongCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  skippedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ea580c',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  statusBadge: {
    fontSize: 18,
  },
  question: {
    fontSize: 16,
    marginBottom: 16,
    color: '#0f172a',
    lineHeight: 24,
    fontWeight: '400',
  },
  answerSection: {
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  studentAnswer: {
    fontSize: 14,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  correctAnswer: {
    fontSize: 14,
    color: '#059669',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  explanationSection: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  explanation: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});