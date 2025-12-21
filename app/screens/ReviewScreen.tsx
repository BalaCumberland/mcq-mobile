import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuthToken } from '../services/firebaseAuth';
import { LAMBDA_MCQ_GO_API_URL } from '../config/env';
import LaTeXRenderer from '../components/LaTeXRenderer';
import ExplanationView from '../components/ExplanationView';
import LoadingAnimation from '../components/LoadingAnimation';
import ResultCard from '../components/ResultCard';



const ReviewScreen = React.memo(({ route }) => {
  const { quizName, className, subjectName, topic } = route.params;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const scrollViewRef = useRef(null);

  const fetchResults = useCallback(async () => {
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
  }, [quizName, className, subjectName, topic]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const paginatedResults = useMemo(() => {
    if (!results?.results) return [];
    return results.results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [results?.results, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (!results?.results) return 1;
    return Math.ceil(results.results.length / itemsPerPage);
  }, [results?.results?.length, itemsPerPage]);

  const handlePrevPage = useCallback(() => {
    if (results?.results && currentPage > 1) {
      setCurrentPage(prev => Math.max(prev - 1, 1));
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [results?.results, currentPage]);

  const handleNextPage = useCallback(() => {
    if (results?.results) {
      if (currentPage < totalPages) {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    }
  }, [results?.results, currentPage, totalPages]);

  if (loading) {
    return <LoadingAnimation text="Loading Results..." />;
  }

  if (!results) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      ref={scrollViewRef} 
      style={styles.container}
      removeClippedSubviews={true}
      maxToRenderPerBatch={2}
      windowSize={3}
    >
      <View style={styles.header}>
        <Text style={styles.title}>📋 Quiz Review</Text>
        <Text style={styles.score}>{results.percentage}%</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>✅ {results.correctCount} correct</Text>
          <Text style={styles.summaryText}>❌ {results.wrongCount} wrong</Text>
          <Text style={styles.summaryText}>⏭️ {results.skippedCount} skipped</Text>
        </View>
      </View>

      <View style={styles.paginationInfo}>
        <Text style={styles.paginationInfoText}>
          Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, results.results.length)} of {results.results.length} questions
        </Text>
      </View>
      
      {paginatedResults.map((result, index) => (
        <ResultCard key={`${result.qno}-${index}`} result={result} />
      ))}
      
      {totalPages > 1 && (
        <SafeAreaView style={styles.paginationContainer} edges={['bottom']}>
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
            onPress={handlePrevPage}
            disabled={currentPage === 1 || !results?.results}
          >
            <Text style={styles.paginationButtonText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.paginationText}>Page {currentPage} of {totalPages}</Text>
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
            onPress={handleNextPage}
            disabled={!results?.results || currentPage === totalPages}
          >
            <Text style={styles.paginationButtonText}>Next</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </ScrollView>
  );
});

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
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
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
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
  paginationInfo: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  paginationInfoText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 16,
  },
  paginationButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  paginationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  paginationText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});