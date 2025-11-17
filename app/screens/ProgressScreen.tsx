import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ApiService from '../services/apiService';
import useUserStore from '../store/UserStore';

const ProgressScreen = ({ navigation }) => {
  const { user } = useUserStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Mock analytics data - replace with actual API call
      const mockData = {
        totalQuizzes: 15,
        completedQuizzes: 12,
        averageScore: 78,
        totalQuestions: 180,
        correctAnswers: 140,
        subjectProgress: [
          { subject: 'Mathematics', completed: 8, total: 10, avgScore: 82 },
          { subject: 'Science', completed: 4, total: 5, avgScore: 75 },
        ],
        recentQuizzes: [
          { name: 'Algebra Quiz 1', score: 85, date: '2024-01-15' },
          { name: 'Physics Quiz 2', score: 72, date: '2024-01-14' },
        ]
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Student Progress</Text>
      
      {/* Overall Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{analytics.completedQuizzes}</Text>
          <Text style={styles.statLabel}>Quizzes Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{analytics.averageScore}%</Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Overall Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(analytics.completedQuizzes / analytics.totalQuizzes) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {analytics.completedQuizzes} of {analytics.totalQuizzes} quizzes completed
        </Text>
      </View>

      {/* Subject Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subject Progress</Text>
        {analytics.subjectProgress.map((subject, index) => (
          <View key={index} style={styles.subjectCard}>
            <Text style={styles.subjectName}>{subject.subject}</Text>
            <View style={styles.subjectStats}>
              <Text style={styles.subjectText}>
                {subject.completed}/{subject.total} completed
              </Text>
              <Text style={styles.subjectScore}>{subject.avgScore}% avg</Text>
            </View>
            <View style={styles.subjectProgressBar}>
              <View 
                style={[
                  styles.subjectProgressFill, 
                  { width: `${(subject.completed / subject.total) * 100}%` }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Recent Quizzes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Quizzes</Text>
        {analytics.recentQuizzes.map((quiz, index) => (
          <View key={index} style={styles.quizCard}>
            <View style={styles.quizInfo}>
              <Text style={styles.quizName}>{quiz.name}</Text>
              <Text style={styles.quizDate}>{quiz.date}</Text>
            </View>
            <Text style={[
              styles.quizScore,
              { color: quiz.score >= 80 ? '#4CAF50' : quiz.score >= 60 ? '#FF9800' : '#f44336' }
            ]}>
              {quiz.score}%
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
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
  progressSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  subjectCard: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 14,
    color: '#666',
  },
  subjectScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  subjectProgressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  subjectProgressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  quizCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  quizInfo: {
    flex: 1,
  },
  quizName: {
    fontSize: 16,
    fontWeight: '500',
  },
  quizDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quizScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProgressScreen;