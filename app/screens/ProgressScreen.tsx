import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import ApiService from '../services/apiService';
import useUserStore from '../store/UserStore';
import { getAuthToken } from '../services/firebaseAuth';
import { LAMBDA_MCQ_GO_API_URL } from '../config/env';

const ProgressScreen = ({ navigation }) => {
  const { user } = useUserStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${LAMBDA_MCQ_GO_API_URL}/students/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading Progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Your Progress</Text>
      
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  subjectCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  testCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    elevation: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  testStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  testDetail: {
    fontSize: 12,
    color: '#666',
  },
  testDate: {
    fontSize: 11,
    color: '#999',
  },
  reviewHint: {
    fontSize: 10,
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },

  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ProgressScreen;