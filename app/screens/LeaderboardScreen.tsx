import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { auth } from '../config/firebase';
import useUserStore from '../store/UserStore';

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUserStore();

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const url = 'https://ieetpwfoci.execute-api.us-east-1.amazonaws.com/prod/v2/leaderboard';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      Alert.alert('Error', 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const classData = leaderboardData?.leaderboard?.[user?.student_class] || [];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading Leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#ffffff']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <LinearGradient
            colors={['#fbbf24', '#f59e0b']}
            style={styles.headerIcon}
          >
            <Text style={styles.headerIconText}>🏆</Text>
          </LinearGradient>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Leaderboard</Text>
            <Text style={styles.subtitle}>Class: {user?.student_class}</Text>
          </View>
        </View>
        
        <LinearGradient
          colors={['#eff6ff', '#dbeafe']}
          style={styles.infoCard}
        >
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>How it works:</Text>
            <Text style={styles.infoText}>🔄 Rankings update every 24 hours • 🏆 Top 10 students shown • ⭐ Score = Performance × Participation</Text>
          </View>
        </LinearGradient>
      </LinearGradient>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {classData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No leaderboard data available yet</Text>
          </View>
        ) : (
          classData.map((student, index) => {
            const isCurrentUser = student.uid === auth.currentUser?.uid;
            
            return (
              <LinearGradient
                key={student.uid}
                colors={
                  student.rank === 1 ? ['#fef3c7', '#fde68a'] :
                  student.rank === 2 ? ['#f1f5f9', '#e2e8f0'] :
                  student.rank === 3 ? ['#fed7aa', '#fdba74'] :
                  isCurrentUser ? ['#dbeafe', '#bfdbfe'] :
                  ['#f9fafb', '#ffffff']
                }
                style={[
                  styles.studentCard,
                  isCurrentUser && styles.currentUserCard,
                  student.rank <= 3 && styles.topRankCard
                ]}
              >
                <View style={styles.rankContainer}>
                  {student.rank === 1 && <Text style={styles.medalEmoji}>🥇</Text>}
                  {student.rank === 2 && <Text style={styles.medalEmoji}>🥈</Text>}
                  {student.rank === 3 && <Text style={styles.medalEmoji}>🥉</Text>}
                  {student.rank > 3 && (
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{student.rank}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.studentInfo}>
                  <Text style={[styles.studentName, isCurrentUser && styles.currentUserText]}>
                    {student.name} {isCurrentUser && '(You)'}
                  </Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.statText}>📊 Score: {student.totalScore}</Text>
                    <Text style={styles.statText}>📝 Quizzes: {student.quizzesTaken}</Text>
                    <Text style={styles.statText}>⭐ Avg: {student.avgScore.toFixed(1)}</Text>
                  </View>
                </View>
                
                <View style={styles.scoreContainer}>
                  <Text style={styles.weightedScore}>{student.weightedScore.toFixed(0)}</Text>
                  <Text style={styles.pointsLabel}>points</Text>
                </View>
              </LinearGradient>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3b82f6',
    lineHeight: 18,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserCard: {
    borderColor: '#3b82f6',
  },
  topRankCard: {
    borderWidth: 2,
  },
  rankContainer: {
    marginRight: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalEmoji: {
    fontSize: 32,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  currentUserText: {
    color: '#3b82f6',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  weightedScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f59e0b',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default LeaderboardScreen;