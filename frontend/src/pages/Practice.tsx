import React, { useState, useEffect, useRef } from 'react';
import { usePractice } from '../context/PracticeContext';
import { 
  Award, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Target, 
  Sparkles,
  BookOpen,
  Zap,
  Code2,
  FileText,
  Play,
  RotateCcw,
  History
} from 'lucide-react';

const TOPICS = [
  'Arrays & Hashing',
  'Strings',
  'Two Pointers',
  'Sliding Window',
  'Recursion & Backtracking',
  'Dynamic Programming',
  'Trees & Graphs',
  'SQL Queries & Joins',
  'Object-Oriented Programming',
  'System Design Concepts',
  'Bit Manipulation',
  'Sorting & Searching'
];

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'sql', label: 'SQL' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' }
];

const DIFFICULTIES = ['Beginner', 'Easy', 'Medium', 'Hard', 'Interview'];

const QUESTION_TYPES = [
  { value: 'coding', label: 'Coding Question' },
  { value: 'mcq', label: 'Multiple Choice (MCQ)' },
  { value: 'output_prediction', label: 'Output Prediction' },
  { value: 'find_the_bug', label: 'Find the Bug' },
  { value: 'fill_in_the_blank', label: 'Fill in the Blank' }
];

const COMPANIES = [
  'Amazon', 'Microsoft', 'Google', 'ServiceNow', 'Zoho', 'Atlassian', 'Walmart', 'Adobe'
];

const PracticePage: React.FC = () => {
  const {
    loading,
    loadingStep,
    error,
    activeQuestion,
    setActiveQuestion,
    activeAttempt,
    setActiveAttempt,
    statistics,
    attemptsHistory,
    generateQuestion,
    submitAnswer,
    fetchStatistics,
    fetchAttemptsHistory
  } = usePractice();

  // Filter configuration states
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].value);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTIES[1]); // Easy default
  const [selectedType, setSelectedType] = useState(QUESTION_TYPES[0].value);
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  // Active workspace states
  const [userAnswer, setUserAnswer] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Tabs layout
  const [leftTab, setLeftTab] = useState<'description' | 'hints' | 'submissions'>('description');
  const [bottomTab, setBottomTab] = useState<'result' | 'strengths' | 'solution' | 'tips'>('result');

  // Textarea Ref for handling tab-indentation & line numbering sync
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync scroll between textarea and line numbers
  const handleTextareaScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keyboard support: Tab key indentation inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = e.currentTarget.value;
      const newVal = val.substring(0, start) + '    ' + val.substring(end);
      setUserAnswer(newVal);
      
      // Reset cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  // Load statistics and attempts on mount
  useEffect(() => {
    fetchStatistics();
    fetchAttemptsHistory();
  }, []);

  // Timer side-effect
  useEffect(() => {
    let timer: any;
    if (timerActive) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive]);

  // Set starter code when active question changes
  useEffect(() => {
    if (activeQuestion) {
      setUserAnswer(activeQuestion.code_context || '');
      setElapsedTime(0);
      setHintsRevealed(0);
      setTimerActive(true);
      setLeftTab('description');
    } else {
      setTimerActive(false);
    }
  }, [activeQuestion]);

  // If a submission completes, switch left/bottom tabs as appropriate
  useEffect(() => {
    if (activeAttempt) {
      setBottomTab('result');
    }
  }, [activeAttempt]);

  const handleStartChallenge = async () => {
    await generateQuestion({
      topic: selectedTopic,
      difficulty_level: selectedDifficulty,
      programming_language: selectedLanguage,
      question_type: selectedType,
      company: selectedCompany || undefined
    });
  };

  const handleSubmit = async () => {
    if (!activeQuestion) return;
    setTimerActive(false);
    await submitAnswer({
      question_id: activeQuestion.id,
      user_answer: userAnswer,
      hints_used: hintsRevealed,
      practice_time_seconds: elapsedTime
    });
  };

  const handleReset = () => {
    setActiveQuestion(null);
    setActiveAttempt(null);
    setUserAnswer('');
    setElapsedTime(0);
    setHintsRevealed(0);
  };

  // Helper to format practice duration
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Get dynamic step text for AI loader
  const getLoaderText = () => {
    if (activeAttempt) {
      switch (loadingStep) {
        case 1: return 'Analyzing code correctness...';
        case 2: return 'Evaluating Big-O time & space complexities...';
        case 3: return 'Formulating suggestions & alternative solutions...';
        default: return 'Grading solution...';
      }
    } else {
      switch (loadingStep) {
        case 1: return 'Retrieving profile and past reviewer notes...';
        case 2: return 'Drafting personalized questions...';
        default: return 'Generating challenge...';
      }
    }
  };

  // Generate line numbers column
  const lineCount = userAnswer.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 25) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[550px] overflow-hidden space-y-4">
      
      {/* Top dashboard metadata summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-slate-800 rounded-xl">
            <Code2 size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Practice Workspace
              <span className="px-2 py-0.5 text-[9px] uppercase font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
                LeetCode Edition
              </span>
            </h1>
            <p className="text-xs text-slate-400">Adaptive AI challenge tailored to your skill parameters.</p>
          </div>
        </div>

        {/* Global Streak/Accuracy Badges */}
        {statistics && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-850 rounded-lg text-xs font-semibold">
              <Flame size={14} className="text-orange-500 fill-orange-500/10" />
              <span className="text-slate-400">Streak:</span>
              <span className="text-slate-200 font-bold">{statistics.streak}d</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-850 rounded-lg text-xs font-semibold">
              <Target size={14} className="text-indigo-400" />
              <span className="text-slate-400">Accuracy:</span>
              <span className="text-slate-200 font-bold">
                {statistics.attempts_count > 0 
                  ? `${Math.round((statistics.correct_attempts_count / statistics.attempts_count) * 100)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/20 border border-red-800/50 rounded-xl flex items-start gap-2.5 shrink-0 animate-fadeIn">
          <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={16} />
          <div className="text-xs">
            <span className="font-bold text-red-200">Execution Error: </span>
            <span className="text-red-400 leading-relaxed">{error}</span>
          </div>
        </div>
      )}

      {/* LOADER OVERLAY */}
      {loading && (
        <div className="flex-1 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-8 space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <Sparkles size={20} className="absolute text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-100">{getLoaderText()}</h3>
            <p className="text-xs text-slate-500">Constructing compiler sandbox details...</p>
          </div>
        </div>
      )}

      {/* CONFIGURATION PANEL */}
      {!loading && !activeQuestion && !activeAttempt && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1">
          {/* Main Selectors */}
          <div className="lg:col-span-8 bg-slate-900/30 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Challenge Settings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Focus Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-indigo-500 transition duration-200"
                  >
                    {TOPICS.map((topic) => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-indigo-500 transition duration-200"
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-indigo-500 transition duration-200"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Practice Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-indigo-500 transition duration-200"
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Company (Optional)</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCompany('')}
                      className={`px-2.5 py-1.5 text-[10px] font-medium border rounded-lg transition duration-200 ${
                        selectedCompany === '' 
                          ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30 font-bold' 
                          : 'bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-700'
                      }`}
                    >
                      General
                    </button>
                    {COMPANIES.map((company) => (
                      <button
                        key={company}
                        type="button"
                        onClick={() => setSelectedCompany(company)}
                        className={`px-2.5 py-1.5 text-[10px] font-medium border rounded-lg transition duration-200 ${
                          selectedCompany === company 
                            ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30 font-bold' 
                            : 'bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-700'
                        }`}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartChallenge}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg border border-indigo-500/20 cursor-pointer transform hover:scale-[1.005] transition-all"
            >
              <span>Compile Personalized Question</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-4 space-y-4 flex flex-col">
            {statistics && (
              <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={14} className="text-indigo-400" />
                  Your Stats
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Attempts</p>
                    <p className="text-md font-black text-slate-200">{statistics.attempts_count}</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Completed</p>
                    <p className="text-md font-black text-emerald-400">{statistics.correct_attempts_count}</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">Practice Duration</p>
                      <p className="text-xs font-bold text-indigo-400 mt-0.5">{formatTime(statistics.practice_time_seconds)}</p>
                    </div>
                    <Clock size={16} className="text-slate-700" />
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-slate-850 pt-3">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Concept Gaps (Weak Topics)</p>
                  {statistics.weak_topics && statistics.weak_topics.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {statistics.weak_topics.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[9px] font-medium rounded-md">
                          ⚠️ {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No significant topic gaps identified yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Quick history snippet */}
            <div className="flex-1 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 flex flex-col overflow-hidden min-h-[180px]">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-3">
                <History size={14} className="text-indigo-400" />
                History Log
              </span>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {attemptsHistory.length > 0 ? (
                  attemptsHistory.map((att) => (
                    <div key={att.id} className="p-2 bg-slate-950/60 border border-slate-850 rounded-lg flex items-center justify-between text-xs hover:border-slate-750 transition duration-150">
                      <div className="truncate max-w-[130px]">
                        <p className="font-semibold text-slate-300 truncate" title={att.question?.title}>
                          {att.question?.title || 'Practice Challenge'}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{att.question?.topic}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        att.is_correct 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}>
                        {att.is_correct ? 'Pass' : 'Fail'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic text-center py-4">No past practice logs found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEETCODE WORKSPACE LAYOUT */}
      {!loading && activeQuestion && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
          
          {/* LEFT PANE: Tabs for Description / Hints / Submissions */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col overflow-hidden">
            {/* Left pane Tab Header */}
            <div className="flex items-center bg-slate-950/80 border-b border-slate-800/60 shrink-0 px-2">
              <button
                onClick={() => setLeftTab('description')}
                className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                  leftTab === 'description'
                    ? 'border-indigo-500 text-slate-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText size={14} />
                Description
              </button>
              <button
                onClick={() => setLeftTab('hints')}
                className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                  leftTab === 'hints'
                    ? 'border-indigo-500 text-slate-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen size={14} />
                Hints
              </button>
              <button
                onClick={() => setLeftTab('submissions')}
                className={`px-4 py-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                  leftTab === 'submissions'
                    ? 'border-indigo-500 text-slate-200'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <History size={14} />
                Submissions
              </button>
            </div>

            {/* Left pane Content scroll area */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-900/20">
              
              {/* Tab 1: Description */}
              {leftTab === 'description' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                      activeQuestion.difficulty_level === 'Hard' || activeQuestion.difficulty_level === 'Interview'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/25'
                        : activeQuestion.difficulty_level === 'Medium'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    }`}>
                      {activeQuestion.difficulty_level}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded text-[9px] uppercase font-bold">
                      {activeQuestion.programming_language}
                    </span>
                    {activeQuestion.company && (
                      <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/25 rounded text-[9px] uppercase font-bold">
                        🏢 {activeQuestion.company}
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-100">{activeQuestion.title}</h2>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase mt-0.5">Topic: {activeQuestion.topic}</p>
                  </div>

                  {/* Question description body */}
                  <div className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4 space-y-4 font-sans">
                    {activeQuestion.description.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Progressive Hints */}
              {leftTab === 'hints' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <div>
                      <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Progressive Assist</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Unlock hints sequentially. Each unlock registers to your attempt file.</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                      Used {hintsRevealed}/3 Hints
                    </span>
                  </div>

                  <div className="space-y-3">
                    {hintsRevealed < 3 ? (
                      <button
                        onClick={() => setHintsRevealed((prev) => prev + 1)}
                        className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-lg transition"
                      >
                        Reveal Hint {hintsRevealed + 1}
                      </button>
                    ) : hintsRevealed === 3 ? (
                      <button
                        onClick={() => setHintsRevealed(4)}
                        className="w-full py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-lg transition"
                      >
                        Reveal Final Solution Explanation
                      </button>
                    ) : (
                      <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-center text-xs text-slate-500 italic">
                        All hints revealed.
                      </div>
                    )}

                    {hintsRevealed > 0 && (
                      <div className="space-y-3 mt-3">
                        {activeQuestion.hints.slice(0, hintsRevealed).map((hint, idx) => (
                          <div
                            key={idx}
                            className={`p-3 border rounded-xl animate-fadeIn ${
                              idx === 3 
                                ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300' 
                                : 'bg-slate-950 border-slate-850 text-slate-350'
                            }`}
                          >
                            <p className="text-[9px] font-extrabold uppercase text-indigo-400 mb-1">
                              {idx === 3 ? 'Final Solution Reference' : `Hint ${idx + 1}`}
                            </p>
                            <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{hint}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Past attempts for this question */}
              {leftTab === 'submissions' && (
                <div className="space-y-3 animate-fadeIn">
                  <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider border-b border-slate-800/60 pb-2">
                    Attempts History
                  </h3>
                  {attemptsHistory.filter(h => h.question_id === activeQuestion.id).length > 0 ? (
                    attemptsHistory.filter(h => h.question_id === activeQuestion.id).map((att) => (
                      <div key={att.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            {new Date(att.created_at).toLocaleString()}
                          </span>
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                            att.is_correct 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {att.is_correct ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-slate-400 font-semibold">Score: {att.evaluation.overall_score}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic py-4 text-center">No submissions recorded for this challenge yet.</p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* RIGHT PANE: Code Editor & Result tabs */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden space-y-4">
            
            {/* Editor Workspace Box */}
            <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col overflow-hidden">
              {/* Editor Header Bar */}
              <div className="flex items-center justify-between bg-slate-950/80 border-b border-slate-800/60 px-4 py-2.5 shrink-0">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Code2 size={14} className="text-indigo-400" />
                  Source Code Editor
                </span>
                
                <div className="flex items-center gap-3">
                  {/* Elapsed Timer widget */}
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-lg">
                    <Clock size={12} className="text-indigo-400" />
                    {formatTime(elapsedTime)}
                  </span>
                </div>
              </div>

              {/* Editor area with simulated line numbers */}
              {activeQuestion.question_type === 'mcq' ? (
                <div className="flex-1 bg-slate-950/30 p-6 flex flex-col justify-center space-y-3">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Select the best option:</p>
                  {activeQuestion.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setUserAnswer(opt)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition duration-150 ${
                        userAnswer === opt
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-slate-950 border-slate-850 hover:border-slate-750 text-slate-450 hover:text-slate-350'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex overflow-hidden bg-slate-950/80 font-mono text-xs text-indigo-200">
                  {/* Line numbers column */}
                  <div
                    ref={lineNumbersRef}
                    className="w-10 border-r border-slate-900 bg-slate-950/45 py-3 select-none text-right pr-2 text-slate-600 overflow-hidden"
                    style={{ lineHeight: '1.5rem' }}
                  >
                    {lineNumbers.map((n) => (
                      <div key={n} className="h-6 pr-1 font-mono">{n}</div>
                    ))}
                  </div>

                  {/* Textarea code field */}
                  <textarea
                    ref={textareaRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onScroll={handleTextareaScroll}
                    onKeyDown={handleKeyDown}
                    placeholder="// Paste or write your solution here..."
                    className="flex-1 bg-transparent p-3 border-none outline-none resize-none overflow-auto whitespace-pre custom-scrollbar select-text text-indigo-100"
                    style={{ lineHeight: '1.5rem', tabSize: 4 }}
                    wrap="off"
                    spellCheck="false"
                  />
                </div>
              )}

              {/* Editor Console Run footer */}
              <div className="flex items-center justify-between bg-slate-950/80 border-t border-slate-800/60 px-4 py-2.5 shrink-0">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition duration-200 flex items-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg border border-indigo-500/20 cursor-pointer hover:scale-[1.01] transition flex items-center gap-1.5"
                >
                  <Play size={12} className="fill-white" />
                  Submit Answer
                </button>
              </div>
            </div>

            {/* Bottom Evaluation drawer (active only after submission attempts) */}
            {activeAttempt && (
              <div className="h-[250px] bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col overflow-hidden shrink-0 animate-fadeIn">
                {/* Result header tabs */}
                <div className="flex items-center justify-between bg-slate-950/80 border-b border-slate-800/60 px-2 shrink-0">
                  <div className="flex items-center">
                    <button
                      onClick={() => setBottomTab('result')}
                      className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                        bottomTab === 'result'
                          ? 'border-indigo-500 text-slate-200'
                          : 'border-transparent text-slate-450 hover:text-slate-250'
                      }`}
                    >
                      Report Summary
                    </button>
                    <button
                      onClick={() => setBottomTab('strengths')}
                      className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                        bottomTab === 'strengths'
                          ? 'border-indigo-500 text-slate-200'
                          : 'border-transparent text-slate-450 hover:text-slate-250'
                      }`}
                    >
                      Strengths & Weaknesses
                    </button>
                    <button
                      onClick={() => setBottomTab('solution')}
                      className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                        bottomTab === 'solution'
                          ? 'border-indigo-500 text-slate-200'
                          : 'border-transparent text-slate-450 hover:text-slate-250'
                      }`}
                    >
                      Alternative Code
                    </button>
                    <button
                      onClick={() => setBottomTab('tips')}
                      className={`px-3 py-2 text-xs font-bold border-b-2 transition ${
                        bottomTab === 'tips'
                          ? 'border-indigo-500 text-slate-200'
                          : 'border-transparent text-slate-450 hover:text-slate-250'
                      }`}
                    >
                      Interview Coaching
                    </button>
                  </div>

                  {/* Submission status icon */}
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border mr-2 ${
                    activeAttempt.is_correct 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                  }`}>
                    {activeAttempt.is_correct ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    Grade: {activeAttempt.evaluation.overall_score}
                  </span>
                </div>

                {/* Result contents */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900/20 text-xs">
                  
                  {/* Tab 1: Result summary details */}
                  {bottomTab === 'result' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-2.5 bg-slate-950/65 border border-slate-850 rounded-lg">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Time Complexity</span>
                          <span className="font-semibold text-indigo-300">{activeAttempt.evaluation.time_complexity}</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/65 border border-slate-850 rounded-lg">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Space Complexity</span>
                          <span className="font-semibold text-indigo-300">{activeAttempt.evaluation.space_complexity}</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/65 border border-slate-850 rounded-lg">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Code Style / Readability</span>
                          <span className="font-semibold text-indigo-300">{activeAttempt.evaluation.readability}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-lg space-y-2">
                        <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Logic Assessment</h4>
                        <p className="text-slate-300 leading-relaxed">{activeAttempt.evaluation.logic_evaluation}</p>
                      </div>

                      <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-lg space-y-1 text-slate-350">
                        <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Edge Cases Evaluation</span>
                        <p>{activeAttempt.evaluation.edge_cases}</p>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Strengths & Weaknesses */}
                  {bottomTab === 'strengths' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                      <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-1.5">
                        <h4 className="font-bold text-[10px] text-emerald-450 uppercase tracking-wider flex items-center gap-1 border-b border-slate-900 pb-1">
                          🟢 Solid Strengths
                        </h4>
                        <ul className="space-y-1 list-disc pl-3 text-slate-300 leading-relaxed">
                          {activeAttempt.evaluation.strengths.map((str, idx) => (
                            <li key={idx}>{str}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg space-y-1.5">
                        <h4 className="font-bold text-[10px] text-yellow-500 uppercase tracking-wider flex items-center gap-1 border-b border-slate-900 pb-1">
                          🟡 Improvement Gaps
                        </h4>
                        <ul className="space-y-1 list-disc pl-3 text-slate-300 leading-relaxed">
                          {activeAttempt.evaluation.weaknesses.map((weak, idx) => (
                            <li key={idx}>{weak}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Solution code block */}
                  {bottomTab === 'solution' && (
                    <div className="space-y-2 animate-fadeIn">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">AI Recommended Optimal Solution</p>
                      <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg overflow-x-auto">
                        <pre className="font-mono text-indigo-300 leading-relaxed whitespace-pre">{activeAttempt.evaluation.alternative_solution}</pre>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Interview coaching tips */}
                  {bottomTab === 'tips' && (
                    <div className="p-3.5 bg-indigo-950/10 border border-indigo-500/10 rounded-xl space-y-2 animate-fadeIn">
                      <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap size={10} /> Interview Coaching
                      </h4>
                      <ul className="space-y-1.5 list-disc pl-3.5 text-slate-300 leading-relaxed">
                        {activeAttempt.evaluation.interview_tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default PracticePage;
