import React, { createContext, useContext, useState } from 'react';
import api from '../lib/api';

export interface PracticeQuestionType {
  id: string;
  user_id: string;
  question_type: string;
  topic: string;
  difficulty_level: string;
  company?: string;
  programming_language: string;
  title: string;
  description: string;
  code_context?: string;
  options: string[];
  hints: string[];
  created_at: string;
}

export interface PracticeAttemptType {
  id: string;
  user_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  hints_used: number;
  evaluation: {
    is_correct: boolean;
    overall_score: number;
    logic_evaluation: string;
    time_complexity: string;
    space_complexity: string;
    readability: string;
    edge_cases: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    alternative_solution: string;
    interview_tips: string[];
  };
  question?: PracticeQuestionType;
  created_at: string;
}

export interface PracticeStatisticsType {
  user_id: string;
  attempts_count: number;
  correct_attempts_count: number;
  streak: number;
  last_practice_date?: string;
  weak_topics: string[];
  practice_time_seconds: number;
  updated_at: string;
}

interface PracticeContextType {
  loading: boolean;
  loadingStep: number; // 0: Idle, 1: Tailoring question/evaluating, etc.
  error: string | null;
  setError: (err: string | null) => void;
  
  // Active states
  activeQuestion: PracticeQuestionType | null;
  setActiveQuestion: (q: PracticeQuestionType | null) => void;
  activeAttempt: PracticeAttemptType | null;
  setActiveAttempt: (a: PracticeAttemptType | null) => void;
  
  // Stats & History
  statistics: PracticeStatisticsType | null;
  setStatistics: (s: PracticeStatisticsType | null) => void;
  attemptsHistory: PracticeAttemptType[];
  setAttemptsHistory: (history: PracticeAttemptType[]) => void;
  
  // Actions
  generateQuestion: (params: {
    topic: string;
    difficulty_level: string;
    programming_language: string;
    question_type: string;
    company?: string;
  }) => Promise<PracticeQuestionType | null>;
  
  submitAnswer: (params: {
    question_id: string;
    user_answer: string;
    hints_used: number;
    practice_time_seconds: number;
  }) => Promise<PracticeAttemptType | null>;
  
  fetchStatistics: () => Promise<void>;
  fetchAttemptsHistory: () => Promise<void>;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [activeQuestion, setActiveQuestion] = useState<PracticeQuestionType | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<PracticeAttemptType | null>(null);
  
  const [statistics, setStatistics] = useState<PracticeStatisticsType | null>(null);
  const [attemptsHistory, setAttemptsHistory] = useState<PracticeAttemptType[]>([]);

  const generateQuestion = async (params: {
    topic: string;
    difficulty_level: string;
    programming_language: string;
    question_type: string;
    company?: string;
  }) => {
    setLoading(true);
    setLoadingStep(1); // 1: Personalizing and drafting question details...
    setError(null);
    setActiveQuestion(null);
    setActiveAttempt(null);
    
    // Simulate progressive drafting steps
    const timer = setTimeout(() => setLoadingStep(2), 2000); // 2: Injecting past gaps and review items...
    
    try {
      const response = await api.post('/practice', params);
      setActiveQuestion(response.data);
      return response.data as PracticeQuestionType;
    } catch (err: any) {
      console.error("Practice question generation failed:", err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Could not generate a practice question. Please check backend connections.'
      );
      return null;
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const submitAnswer = async (params: {
    question_id: string;
    user_answer: string;
    hints_used: number;
    practice_time_seconds: number;
  }) => {
    setLoading(true);
    setLoadingStep(1); // 1: Running correctness and syntax checker...
    setError(null);
    setActiveAttempt(null);
    
    const timer1 = setTimeout(() => setLoadingStep(2), 1500); // 2: Analyzing logic, complexity, and readability...
    const timer2 = setTimeout(() => setLoadingStep(3), 3000); // 3: Compiling strengths, weaknesses, and interview tips...

    try {
      const response = await api.post('/practice/submit', params);
      setActiveAttempt(response.data);
      // Refresh statistics list and attempt list
      await Promise.all([fetchStatistics(), fetchAttemptsHistory()]);
      return response.data as PracticeAttemptType;
    } catch (err: any) {
      console.error("Submission evaluation failed:", err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Failed to evaluate attempt. Make sure your server is running.'
      );
      return null;
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/practice/statistics');
      setStatistics(response.data);
    } catch (err) {
      console.error("Failed to fetch practice statistics:", err);
    }
  };

  const fetchAttemptsHistory = async () => {
    try {
      const response = await api.get('/practice/attempts');
      setAttemptsHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch practice attempts:", err);
    }
  };

  return (
    <PracticeContext.Provider
      value={{
        loading,
        loadingStep,
        error,
        setError,
        activeQuestion,
        setActiveQuestion,
        activeAttempt,
        setActiveAttempt,
        statistics,
        setStatistics,
        attemptsHistory,
        setAttemptsHistory,
        generateQuestion,
        submitAnswer,
        fetchStatistics,
        fetchAttemptsHistory
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};
