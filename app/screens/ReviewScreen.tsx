import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getAuthToken } from '../services/firebaseAuth';
import { LAMBDA_MCQ_GO_API_URL } from '../config/env';
import LoadingAnimation from '../components/LoadingAnimation';
import QuizResultsView from '../components/QuizResultsView';

const ReviewScreen = React.memo(({ route, navigation }) => {
  const { quizName, className, subjectName, topic } = route.params;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleGoHome = useCallback(() => {
    Alert.alert(
      'Leave Quiz Review?',
      'Are you sure you want to go back to home?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.navigate('Home') }
      ]
    );
  }, [navigation]);

  // Set header home button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleGoHome}
          style={{ backgroundColor: '#ffffff20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 16 }}
        >
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>🏠 Home</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleGoHome]);

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
    } finally {
      setLoading(false);
    }
  }, [quizName, className, subjectName, topic]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const totalPages = useMemo(() => {
    if (!results?.results) return 1;
    return Math.ceil(results.results.length / itemsPerPage);
  }, [results?.results?.length, itemsPerPage]);

  const handlePrevPage = useCallback(() => {
    if (results?.results && currentPage > 1) {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    }
  }, [results?.results, currentPage]);

  const handleNextPage = useCallback(() => {
    if (results?.results && currentPage < totalPages) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
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
    <QuizResultsView
      results={results}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      title="📋 Quiz Review"
      onPrevPage={handlePrevPage}
      onNextPage={handleNextPage}
    />
  );
});

export default ReviewScreen;

const styles = StyleSheet.create({
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
});