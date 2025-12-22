import React, { useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import LaTeXRenderer from './LaTeXRenderer';
import ExplanationView from './ExplanationView';
import QuizResultsHeader from './QuizResultsHeader';

interface QuizResultsViewProps {
  results: any;
  currentPage: number;
  itemsPerPage: number;
  title: string;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoHome: () => void;
}

// Centralized colors for consistency
const COLORS = {
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#0F172A',
  textSecondary: '#6B7280',
  green: '#16A34A',
  greenDark: '#15803D',
  red: '#DC2626',
  redDark: '#B91C1C',
  amber: '#F59E0B',
  amberDark: '#D97706',
  primary: '#1D4ED8',
  primaryDark: '#1E40AF',
};

const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  results,
  currentPage,
  itemsPerPage,
  title,
  onPrevPage,
  onNextPage,
  onGoHome,
}) => {
  const scrollViewRef = useRef<ScrollView | null>(null);

  const paginatedResults = useMemo(() => {
    if (!results?.results) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return results.results.slice(startIndex, startIndex + itemsPerPage);
  }, [results?.results, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (!results?.results) return 1;
    return Math.ceil(results.results.length / itemsPerPage);
  }, [results?.results?.length, itemsPerPage]);

  const scrollToTop = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, []);

  const handlePrevPage = useCallback(() => {
    onPrevPage();
    setTimeout(scrollToTop, 80);
  }, [onPrevPage, scrollToTop]);

  const handleNextPage = useCallback(() => {
    onNextPage();
    setTimeout(scrollToTop, 80);
  }, [onNextPage, scrollToTop]);

  return (
    <View style={styles.root}>
      <QuizResultsHeader
        title={title}
        percentage={results.percentage}
        correctCount={results.correctCount}
        wrongCount={results.wrongCount}
        skippedCount={results.skippedCount}
      />

      {totalPages > 1 && (
        <Text style={styles.pageInfo}>
          📄 Page <Text style={styles.pageInfoStrong}>{currentPage}</Text> of{' '}
          <Text style={styles.pageInfoStrong}>{totalPages}</Text>
        </Text>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.resultsScrollView}
        contentContainerStyle={styles.scrollContent}
        removeClippedSubviews
      >
        {paginatedResults.map((result: any, index: number) => {
          const isCorrect = result.status === 'correct';
          const isSkipped = result.status === 'skipped';
          const correctAnswers = Array.isArray(result.correctAnswer)
            ? result.correctAnswer
            : [result.correctAnswer];

          const userAnswer =
            result.studentAnswer && result.studentAnswer.length > 0
              ? result.studentAnswer[0]
              : 'Not answered';

          const statusColors = isCorrect
            ? [COLORS.green, COLORS.greenDark]
            : isSkipped
            ? [COLORS.amber, COLORS.amberDark]
            : [COLORS.red, COLORS.redDark];

          const statusLabel = isCorrect
            ? 'Correct'
            : isSkipped
            ? 'Skipped'
            : 'Incorrect';

          const statusIcon = isCorrect ? '✓' : isSkipped ? '⏭' : '✗';

          return (
            <LinearGradient
              key={`${result.qno}-${index}`}
              colors={['#FFFFFF', '#F9FAFB']}
              style={[
                styles.resultCard,
                isCorrect
                  ? styles.correctCard
                  : isSkipped
                  ? styles.skippedCard
                  : styles.incorrectCard,
              ]}
            >
              {/* Question header row */}
              <View style={styles.questionHeader}>
                <View style={styles.qLabelWrapper}>
                  <Text style={styles.qLabel}>QUESTION</Text>
                  <Text style={styles.questionNumber}>Q{result.qno}</Text>
                </View>

                <LinearGradient colors={statusColors} style={styles.statusBadge}>
                  <Text style={styles.statusBadgeIcon}>{statusIcon}</Text>
                  <Text style={styles.statusBadgeText}>{statusLabel}</Text>
                </LinearGradient>
              </View>

              {/* Question text */}
              <LaTeXRenderer
                text={result.question}
                style={styles.questionText}
              />

              {/* Result summary line */}
              <View style={styles.resultSummaryRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isCorrect
                        ? COLORS.green
                        : isSkipped
                        ? COLORS.amber
                        : COLORS.red,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.resultLabel,
                    {
                      color: isCorrect
                        ? COLORS.green
                        : isSkipped
                        ? COLORS.amberDark
                        : COLORS.redDark,
                    },
                  ]}
                >
                  {isCorrect
                    ? 'You answered this correctly'
                    : isSkipped
                    ? 'You skipped this question'
                    : 'Your answer was incorrect'}
                </Text>
              </View>

              {/* Correct answer */}
              <View style={styles.answerSection}>
                <Text style={styles.answerSectionLabel}>Correct answer</Text>
                {correctAnswers.map((answer: string, idx: number) => (
                  <LaTeXRenderer
                    key={`correct-${result.qno}-${idx}`}
                    text={answer}
                    style={styles.correctAnswer}
                  />
                ))}
              </View>

              {/* User answer */}
              {!isCorrect && (
                <View style={styles.answerSection}>
                  <Text style={styles.answerSectionLabelSecondary}>
                    Your answer
                  </Text>
                  <LaTeXRenderer
                    text={isSkipped ? 'Skipped' : userAnswer}
                    style={styles.userAnswer}
                  />
                </View>
              )}

              {/* Explanation */}
              <View style={styles.explanationWrapper}>
                <ExplanationView
                  explanation={result.explanation || 'No explanation available.'}
                  // keep this only if your ExplanationView accepts questionId
                  // questionId={result.qno}
                />
              </View>
            </LinearGradient>
          );
        })}
      </ScrollView>

      {/* Footer with pagination + home */}
      <SafeAreaView style={styles.footer} edges={['bottom']}>
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.paginationButtonDisabled,
              ]}
              onPress={handlePrevPage}
              disabled={currentPage === 1}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  currentPage === 1 && styles.paginationButtonTextDisabled,
                ]}
              >
                ← Previous
              </Text>
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageIndicatorText}>
                Page {currentPage} of {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.paginationButtonDisabled,
              ]}
              onPress={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  currentPage === totalPages &&
                    styles.paginationButtonTextDisabled,
                ]}
              >
                Next →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.homeButton} onPress={onGoHome}>
          <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageInfo: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    marginBottom: 8,
  },
  pageInfoStrong: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  resultsScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Cards
  resultCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  correctCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  incorrectCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.red,
  },
  skippedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.amber,
  },

  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  qLabelWrapper: {
    gap: 2,
  },
  qLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  questionNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    marginRight: 4,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  questionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 8,
    fontWeight: '600',
  },

  resultSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  answerSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  answerSectionLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  answerSectionLabelSecondary: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  correctAnswer: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  userAnswer: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  explanationWrapper: {
    marginTop: 12,
  },

  footer: {
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paginationButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    minWidth: 92,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  paginationButtonTextDisabled: {
    color: '#9CA3AF',
  },
  pageIndicator: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  pageIndicatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },

  homeButton: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default QuizResultsView;
