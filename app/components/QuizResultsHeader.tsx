import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QuizResultsHeaderProps {
  title: string;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
}

const QuizResultsHeader: React.FC<QuizResultsHeaderProps> = ({
  title,
  percentage,
  correctCount,
  wrongCount,
  skippedCount
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.score}>{percentage}%</Text>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>✅ {correctCount} correct</Text>
        <Text style={styles.summaryText}>❌ {wrongCount} wrong</Text>
        <Text style={styles.summaryText}>⏭️ {skippedCount} skipped</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default QuizResultsHeader;