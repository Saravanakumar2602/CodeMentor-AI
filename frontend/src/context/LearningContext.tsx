import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

export interface LearningPathType {
  id: string;
  user_id: string;
  code_input: string;
  language?: string;
  difficulty_level: string;
  estimated_learning_time: string;
  interview_readiness_score: number;
  mentor_advice: string;
  concepts_detected: string[];
  prerequisites: string[];
  knowledge_gaps: string[];
  recommended_next_topics: string[];
  practice_plan: string[];
  suggested_resources: string[];
  created_at: string;
}

interface LearningContextType {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  loading: boolean;
  loadingStep: number;
  learningResult: LearningPathType | null;
  setLearningResult: (result: LearningPathType | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  handleGenerateRoadmap: () => Promise<void>;
  learningList: LearningPathType[];
  setLearningList: React.Dispatch<React.SetStateAction<LearningPathType[]>>;
  fetchLearningList: () => Promise<void>;
  deleteRoadmap: (id: string) => Promise<void>;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [code, setCode] = useState(() => localStorage.getItem('codementor_learning_code') || '');
  const [language, setLanguage] = useState(() => localStorage.getItem('codementor_learning_lang') || '');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [learningResult, setLearningResult] = useState<LearningPathType | null>(() => {
    const saved = localStorage.getItem('codementor_last_learning');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [learningList, setLearningList] = useState<LearningPathType[]>([]);

  useEffect(() => {
    localStorage.setItem('codementor_learning_code', code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem('codementor_learning_lang', language);
  }, [language]);

  useEffect(() => {
    if (learningResult) {
      localStorage.setItem('codementor_last_learning', JSON.stringify(learningResult));
    } else {
      localStorage.removeItem('codementor_last_learning');
    }
  }, [learningResult]);

  const startLoadingSteps = () => {
    setLoadingStep(1); // Analyzing...
    const timer1 = setTimeout(() => setLoadingStep(2), 1500); // Identifying Gaps...
    const timer2 = setTimeout(() => setLoadingStep(3), 3200); // Formulating Roadmap...
    return [timer1, timer2];
  };

  const handleGenerateRoadmap = async () => {
    if (!code.trim()) {
      setError('Please paste some code first.');
      return;
    }

    setLoading(true);
    setError(null);
    setLearningResult(null);
    const timers = startLoadingSteps();

    try {
      const response = await api.post('/learning', {
        code_input: code,
        language: language || undefined,
      });
      setLearningResult(response.data);
      setLearningList((prev) => [response.data, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Could not generate learning path. Make sure the backend server is running and configured.'
      );
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const fetchLearningList = async () => {
    try {
      const response = await api.get('/learning');
      setLearningList(response.data);
    } catch (err) {
      console.error("Failed to load learning history list:", err);
    }
  };

  const deleteRoadmap = async (id: string) => {
    try {
      await api.delete(`/learning/${id}`);
      setLearningList((prev) => prev.filter((item) => item.id !== id));
      if (learningResult?.id === id) {
        setLearningResult(null);
      }
    } catch (err: any) {
      console.error("Failed to delete learning path log:", err);
      throw err;
    }
  };

  return (
    <LearningContext.Provider
      value={{
        code,
        setCode,
        language,
        setLanguage,
        loading,
        loadingStep,
        learningResult,
        setLearningResult,
        error,
        setError,
        handleGenerateRoadmap,
        learningList,
        setLearningList,
        fetchLearningList,
        deleteRoadmap,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
