import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const SubjectResultsScreen = ({ route, navigation }) => {
  const { subjectName, tests, className } = route.params;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LinearGradient
        colors={['#1e3a8a', '#1e40af']}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>🏆 {subjectName}</Text>
        <Text style={styles.subtitle}>Test Results</Text>
      </LinearGradient>
      
      <ScrollView style={styles.container}>
        {tests && tests.length > 0 ? (
          tests.map((test, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.testCard}
              onPress={() => navigation.navigate('Review', {
                quizName: test.quizName,
                className: className,
                subjectName: test.subjectName,
                topic: test.topic
              })}
            >
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{test.topic}</Text>
                <TouchableOpacity 
                  style={styles.reviewButton}
                  onPress={() => navigation.navigate('Review', {
                    quizName: test.quizName,
                    className: className,
                    subjectName: test.subjectName,
                    topic: test.topic
                  })}
                >
                  <Text style={styles.reviewButtonText}>Review</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.testStats}>
                <Text style={styles.testScore}>{test.percentage}%</Text>
                <Text style={styles.testDetail}>✅ {test.correctCount}</Text>
                <Text style={styles.testDetail}>❌ {test.wrongCount}</Text>
                <Text style={styles.testDetail}>⏭️ {test.skippedCount}</Text>
              </View>
              <Text style={styles.testDate}>{new Date(test.attemptedAt).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>No test results yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#ffffff',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  testCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  reviewButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  testStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testScore: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10b981',
  },
  testDetail: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  testDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default SubjectResultsScreen;