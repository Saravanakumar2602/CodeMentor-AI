import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

export interface CodeReviewType {
  id: string;
  user_id: string;
  code_input: string;
  overall_score: number;
  readability_score: number;
  performance_score: number;
  maintainability_score: number;
  security_score: number;
  summary: string;
  suggestions: string[];
  refactored_code: string | null;
  interview_tips: string[];
  language?: string;
  created_at: string;
}

interface ReviewContextType {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  loading: boolean;
  loadingStep: number;
  reviewResult: CodeReviewType | null;
  setReviewResult: (result: CodeReviewType | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  handleReview: () => Promise<void>;
  reviewList: CodeReviewType[];
  setReviewList: React.Dispatch<React.SetStateAction<CodeReviewType[]>>;
  fetchReviewList: () => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [code, setCode] = useState(() => localStorage.getItem('codementor_review_code') || '');
  const [language, setLanguage] = useState(() => localStorage.getItem('codementor_review_lang') || '');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [reviewResult, setReviewResult] = useState<CodeReviewType | null>(() => {
    const saved = localStorage.getItem('codementor_last_review');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [reviewList, setReviewList] = useState<CodeReviewType[]>([]);

  useEffect(() => {
    localStorage.setItem('codementor_review_code', code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem('codementor_review_lang', language);
  }, [language]);

  useEffect(() => {
    if (reviewResult) {
      localStorage.setItem('codementor_last_review', JSON.stringify(reviewResult));
    } else {
      localStorage.removeItem('codementor_last_review');
    }
  }, [reviewResult]);

  const startLoadingSteps = () => {
    setLoadingStep(1); // Connecting...
    const timer1 = setTimeout(() => setLoadingStep(2), 1500); // Reviewing...
    const timer2 = setTimeout(() => setLoadingStep(3), 3200); // Grading...
    return [timer1, timer2];
  };

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Please paste some code first.');
      return;
    }

    setLoading(true);
    setError(null);
    setReviewResult(null);
    const timers = startLoadingSteps();

    try {
      const response = await api.post('/review', {
        code_input: code,
        language: language || undefined,
      });
      setReviewResult(response.data);
      // Append to the list
      setReviewList((prev) => [response.data, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Could not complete code review. Make sure the backend server is running and configured.'
      );
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const fetchReviewList = async () => {
    try {
      const response = await api.get('/review');
      setReviewList(response.data);
    } catch (err) {
      console.error("Failed to load review history list:", err);
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await api.delete(`/review/${id}`);
      setReviewList((prev) => prev.filter((item) => item.id !== id));
      if (reviewResult?.id === id) {
        setReviewResult(null);
      }
    } catch (err: any) {
      console.error("Failed to delete code review log:", err);
      throw err;
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        code,
        setCode,
        language,
        setLanguage,
        loading,
        loadingStep,
        reviewResult,
        setReviewResult,
        error,
        setError,
        handleReview,
        reviewList,
        setReviewList,
        fetchReviewList,
        deleteReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};
