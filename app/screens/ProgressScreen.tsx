import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import ApiService from '../services/apiService';
import useUserStore from '../store/UserStore';
import useQuizStore from '../store/QuizStore';
import { getAuthToken } from '../services/firebaseAuth';
import { LAMBDA_MCQ_GO_API_URL } from '../config/env';
import LoadingAnimation from '../components/LoadingAnimation';
import { auth } from '../config/firebase';

const ProgressScreen = ({ navigation }) => {
  const { user } = useUserStore();
  const { clearQuizState } = useQuizStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchAnalytics();
    }, [])
  );

  const fetchAnalytics = async () => {
    try {
      const data = await ApiService.getProgress();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation text="Loading Progress..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <LinearGradient
        colors={['#1e3a8a', '#1e40af']}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>📊 Your Progress</Text>
      </LinearGradient>
      
      <ScrollView style={styles.container}>
      
      {/* Subject Progress */}
      {analytics?.subjectSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Subject Progress</Text>
          {analytics.subjectSummary.map((subject, index) => (
            <View key={index} style={styles.subjectCard}>
              <Text style={styles.subjectName}>{subject.subjectName}</Text>
              <View style={styles.subjectStats}>
                <Text style={styles.statText}>Attempted: {subject.attempted}</Text>
                <Text style={styles.statText}>Remaining: {subject.unattempted}</Text>
                <Text style={styles.percentageText}>{subject.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Individual Test Results */}
      {analytics?.individualTests && Object.keys(analytics.individualTests).map(subject => (
        analytics.individualTests[subject].length > 0 && (
          <View key={subject} style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 {subject} Results</Text>
            {analytics.individualTests[subject].map((test, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.testCard}
                onPress={() => navigation.navigate('Review', {
                  quizName: test.quizName,
                  className: analytics.className,
                  subjectName: test.subjectName,
                  topic: test.topic
                })}
              >
                <Text style={styles.testName}>{test.topic}</Text>
                <View style={styles.testStats}>
                  <Text style={styles.testScore}>{test.percentage}%</Text>
                  <Text style={styles.testDetail}>✅ {test.correctCount}</Text>
                  <Text style={styles.testDetail}>❌ {test.wrongCount}</Text>
                  <Text style={styles.testDetail}>⏭️ {test.skippedCount}</Text>
                </View>
                <Text style={styles.testDate}>{new Date(test.attemptedAt).toLocaleDateString()}</Text>
                <Text style={styles.reviewHint}>👆 Tap to review answers</Text>
              </TouchableOpacity>
            ))}
          </View>
        )
      ))}

      {/* No Data Message */}
      {!analytics && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>No Progress Data</Text>
          <Text style={styles.emptyText}>Complete some quizzes to see your progress!</Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 0.48,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },

  section: {
    backgroundColor: '#ffffff',
    padding: 28,
    borderRadius: 24,
    marginBottom: 24,
    marginHorizontal: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  subjectCard: {
    backgroundColor: '#3b82f6',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    color: '#ffffff',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  testCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  testName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a202c',
    letterSpacing: -0.2,
  },
  testScore: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10b981',
    textShadowColor: 'rgba(16, 185, 129, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  testDetail: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  testDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
    fontWeight: '500',
  },
  reviewHint: {
    fontSize: 13,
    color: '#3b82f6',
    textAlign: 'center',
    fontWeight: '700',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 4,
  },

  emptyState: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default ProgressScreen;