import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import LaTeXRenderer from './LaTeXRenderer';

interface ExplanationViewProps {
  explanation: string;
  label?: string;
}

const ExplanationView: React.FC<ExplanationViewProps> = React.memo(({ 
  explanation, 
  label = "💡 Explanation:" 
}) => {
  return (
    <View style={styles.explanationSection}>
      <Text style={styles.explanationLabel}>{label}</Text>
      <ScrollView style={styles.explanationScrollView} nestedScrollEnabled={true}>
        <LaTeXRenderer text={explanation} style={styles.explanation} />
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  explanationSection: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
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
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  explanationScrollView: {
    maxHeight: 120,
  },
});

export default ExplanationView;