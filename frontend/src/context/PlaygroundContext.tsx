import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface PlaygroundContextType {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  loading: boolean;
  loadingStep: number;
  explanation: string | null;
  setExplanation: (explanation: string | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  handleExplain: () => Promise<void>;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export const PlaygroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [code, setCode] = useState(() => localStorage.getItem('codementor_draft_code') || '');
  const [language, setLanguage] = useState(() => localStorage.getItem('codementor_draft_lang') || '');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(() => localStorage.getItem('codementor_last_explanation'));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('codementor_draft_code', code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem('codementor_draft_lang', language);
  }, [language]);

  useEffect(() => {
    if (explanation) {
      localStorage.setItem('codementor_last_explanation', explanation);
    } else {
      localStorage.removeItem('codementor_last_explanation');
    }
  }, [explanation]);

  const startLoadingSteps = () => {
    setLoadingStep(1); // Connecting...
    const timer1 = setTimeout(() => setLoadingStep(2), 1500); // Analyzing...
    const timer2 = setTimeout(() => setLoadingStep(3), 3200); // Formatting...
    return [timer1, timer2];
  };

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please paste some code first.');
      return;
    }

    setLoading(true);
    setError(null);
    setExplanation(null);
    const timers = startLoadingSteps();

    try {
      const response = await api.post('/explain', {
        code_input: code,
        language: language || undefined,
      });
      setExplanation(response.data.ai_response);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Could not get explanation. Make sure the backend server is running and configured.'
      );
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <PlaygroundContext.Provider
      value={{
        code,
        setCode,
        language,
        setLanguage,
        loading,
        loadingStep,
        explanation,
        setExplanation,
        error,
        setError,
        handleExplain,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
};

export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (context === undefined) {
    throw new Error('usePlayground must be used within a PlaygroundProvider');
  }
  return context;
};
