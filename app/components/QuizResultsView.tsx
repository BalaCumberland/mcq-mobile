import React, { useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LaTeXRenderer from './LaTeXRenderer';
import ExplanationView from './ExplanationView';
import QuizResultsHeader from './QuizResultsHeader';
import LinearGradient from 'react-native-linear-gradient';

interface QuizResultsViewProps {
  results: any;
  currentPage: number;
  itemsPerPage: number;
  title: string;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoHome: () => void;
}

const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  results,
  currentPage,
  itemsPerPage,
  title,
  onPrevPage,
  onNextPage,
  onGoHome
}) => {
  const scrollViewRef = useRef(null);

  const paginatedResults = useMemo(() => {
    if (!results?.results) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return results.results.slice(startIndex, startIndex + itemsPerPage);
  }, [results?.results, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (!results?.results) return 1;
    return Math.ceil(results.results.length / itemsPerPage);
  }, [results?.results?.length, itemsPerPage]);

  const handlePrevPage = useCallback(() => {
    onPrevPage();
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }, 100);
  }, [onPrevPage]);

  const handleNextPage = useCallback(() => {
    onNextPage();
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }, 100);
  }, [onNextPage]);

  return (
    <View style={styles.resultsContainer}>
      <QuizResultsHeader
        title={title}
        percentage={results.percentage}
        correctCount={results.correctCount}
        wrongCount={results.wrongCount}
        skippedCount={results.skippedCount}
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
              key={`${result.qno}-${index}`}
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
              onPress={handlePrevPage}
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
              onPress={handleNextPage}
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
          onPress={onGoHome}
        >
          <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default QuizResultsView;