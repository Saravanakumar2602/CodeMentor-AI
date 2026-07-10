import React, { useState, useEffect } from 'react';
import { useLearning } from '../context/LearningContext';
import CodeArea from '../components/CodeArea';
import { 
  Compass, 
  Send, 
  Calendar, 
  Trash2, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  BookOpen,
  Layers,
  GraduationCap,
  Clock,
  Sparkles,
  TrendingUp,
  Cpu
} from 'lucide-react';

const LANGUAGES = [
  { value: '', label: 'Auto Detect Language' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

const LearningPath: React.FC = () => {
  const {
    code,
    setCode,
    language,
    setLanguage,
    loading,
    loadingStep,
    learningResult,
    setLearningResult,
    error,
    handleGenerateRoadmap,
    learningList,
    fetchLearningList,
    deleteRoadmap,
  } = useLearning();

  const [activeTab, setActiveTab] = useState<'concepts' | 'roadmap' | 'practice' | 'mentorship'>('concepts');

  useEffect(() => {
    fetchLearningList();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCodePreview = (codeContent: string) => {
    const lines = codeContent.trim().split('\n');
    const firstLine = lines[0] || '';
    return firstLine.length > 25 ? firstLine.slice(0, 25) + '...' : firstLine;
  };

  // Helper to color-code difficulty levels
  const getDifficultyColorClass = (level: string) => {
    const cleaned = level.toLowerCase();
    if (cleaned.includes('beginner') || cleaned.includes('easy')) {
      return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    }
    if (cleaned.includes('advanced') || cleaned.includes('hard') || cleaned.includes('expert')) {
      return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    }
    return 'text-amber-400 border-amber-500/20 bg-amber-500/5'; // default/intermediate
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 50) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-rose-500/10 border-rose-500/30';
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this learning path from your history?")) {
      return;
    }
    try {
      await deleteRoadmap(id);
    } catch (err) {
      alert("Failed to delete learning path entry.");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          AI Learning Path & Mentor
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Input a code block to reverse-engineer a personalized programming syllabus, identify skill gaps, and get step-by-step mentoring tips.
        </p>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Code Editor and History list */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 px-3.5 text-sm text-slate-300 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-white border-white/20"></div>
              ) : (
                <>
                  Mentor Me <Send size={14} />
                </>
              )}
            </button>
          </div>

          <CodeArea
            value={code}
            onChange={setCode}
            placeholder="// Paste a programming snippet to discover master concepts and formulate a learning plan..."
            language={language}
          />

          {/* History Sidebar list */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-5 shadow-xl backdrop-blur-sm">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              <Calendar size={14} />
              Syllabus History
            </h3>

            {learningList.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-6">
                No past learning roadmaps found.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {learningList.map((item) => {
                  const isSelected = learningResult?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setLearningResult(item)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500/40'
                          : 'bg-slate-950/20 border-slate-850 hover:bg-slate-900/30 hover:border-slate-800/60'
                      }`}
                    >
                      <div className="truncate flex-1 min-w-0 pr-3">
                        <p className="font-mono text-xs text-slate-300 truncate">
                          {getCodePreview(item.code_input)}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>{formatDate(item.created_at)}</span>
                          <span className="text-[8px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">{item.difficulty_level}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColorClass(item.interview_readiness_score)}`}>
                          {item.interview_readiness_score}% Read
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-all duration-200"
                          title="Delete roadmap"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Learning Roadmap Dashboard Results */}
        <div className="lg:col-span-7 flex flex-col items-stretch">
          
          {loading ? (
            /* Loading Steps Display */
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/10 p-12 text-slate-500 shadow-2xl backdrop-blur-sm min-h-[500px]">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-t-indigo-500 border-indigo-950/40 shadow-inner"></div>
                <div className="space-y-1">
                  <h3 className="text-slate-200 font-bold">Constructing Learning Path</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed animate-pulse">
                    {loadingStep === 1 && "Analyzing program concepts & compiler details..."}
                    {loadingStep === 2 && "Identifying developer knowledge gaps & prerequisites..."}
                    {loadingStep === 3 && "Formulating interactive syllabus & mentor advice..."}
                    {loadingStep === 0 && "Initializing personal mentor..."}
                  </p>
                </div>
              </div>
            </div>
          ) : error ? (
            /* Error Warning */
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-rose-400 shadow-2xl backdrop-blur-sm min-h-[500px]">
              <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20 mb-4 animate-shake">
                <ShieldAlert size={36} />
              </div>
              <h3 className="text-lg font-bold text-rose-200 mb-2">Mentor Analysis Failed</h3>
              <p className="text-xs text-center text-rose-400/80 max-w-sm leading-relaxed mb-6">
                {error}
              </p>
              <button
                onClick={handleGenerateRoadmap}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 px-5 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 transition-all duration-200"
              >
                Retry Mentorship
              </button>
            </div>
          ) : learningResult ? (
            /* Learning Path View Dashboard */
            <div className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/10 shadow-2xl backdrop-blur-sm overflow-hidden h-full">
              
              {/* Top Summary Cards */}
              <div className="p-6 bg-slate-900/30 border-b border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Difficulty Level card */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800 bg-slate-950/45 text-center">
                  <Cpu size={20} className="text-indigo-400 mb-2" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Difficulty</span>
                  <span className={`text-sm font-bold mt-1 px-2.5 py-0.5 rounded border ${getDifficultyColorClass(learningResult.difficulty_level)}`}>
                    {learningResult.difficulty_level}
                  </span>
                </div>

                {/* 2. Estimated Learning Time card */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800 bg-slate-950/45 text-center">
                  <Clock size={20} className="text-purple-400 mb-2" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Estimated Time</span>
                  <span className="text-sm font-extrabold text-slate-200 mt-1.5">
                    {learningResult.estimated_learning_time}
                  </span>
                </div>

                {/* 3. Interview Readiness Gauge card */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-800 bg-slate-950/45 text-center">
                  <div className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 shadow ${getScoreBgClass(learningResult.interview_readiness_score)}`}>
                    <span className="text-xs font-bold">{learningResult.interview_readiness_score}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-2">Interview Readiness</span>
                </div>

              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-800/60 bg-slate-900/20 px-4">
                {[
                  { id: 'concepts', label: '1. Detected Concepts', icon: Layers },
                  { id: 'roadmap', label: '2. Knowledge Gaps', icon: GraduationCap },
                  { id: 'practice', label: '3. Practice Plan', icon: CheckCircle },
                  { id: 'mentorship', label: '4. Mentor Tips', icon: HelpCircle },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3.5 px-3 md:px-4 text-xs font-medium border-b-2 transition-all duration-300 focus:outline-none ${
                        isActive
                          ? 'border-indigo-500 text-indigo-400 font-semibold'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[1]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Display Panel */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[460px] custom-scrollbar">
                
                {/* 1. Concepts Detected & Prerequisites */}
                {activeTab === 'concepts' && (
                  <div className="space-y-6">
                    {/* Detected Concepts */}
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <Layers size={14} className="text-indigo-400" />
                        Master Concepts Detected in Code
                      </h3>
                      {learningResult.concepts_detected.length === 0 ? (
                        <p className="text-xs text-slate-650">No core programming concepts identified.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {learningResult.concepts_detected.map((concept, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs text-slate-300 bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-lg select-text"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Prerequisites */}
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <BookOpen size={14} className="text-purple-400" />
                        Prerequisite Skill Foundations
                      </h3>
                      {learningResult.prerequisites.length === 0 ? (
                        <p className="text-xs text-slate-650">No initial prerequisites identified.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {learningResult.prerequisites.map((prereq, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs text-purple-300/90 bg-purple-500/5 border border-purple-500/10 px-3 py-1.5 rounded-lg select-text"
                            >
                              {prereq}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Knowledge Gaps & Recommended next steps */}
                {activeTab === 'roadmap' && (
                  <div className="space-y-6">
                    {/* Knowledge Gaps */}
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <ShieldAlert size={14} className="text-rose-400" />
                        Identified Knowledge Gaps
                      </h3>
                      {learningResult.knowledge_gaps.length === 0 ? (
                        <p className="text-xs text-slate-600">Great! No major skill holes found for this topic scale.</p>
                      ) : (
                        <div className="space-y-2">
                          {learningResult.knowledge_gaps.map((gap, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-300 text-sm select-text">
                              <span className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                              <span>{gap}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recommended Next Topics */}
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <TrendingUp size={14} className="text-indigo-400" />
                        Recommended Next Topics to Learn
                      </h3>
                      {learningResult.recommended_next_topics.length === 0 ? (
                        <p className="text-xs text-slate-650">No additional topics recommended.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {learningResult.recommended_next_topics.map((topic, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/30 text-slate-300 text-xs font-medium flex items-center gap-2 select-text">
                              <Sparkles size={12} className="text-indigo-400 shrink-0" />
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Actionable Practice Plan */}
                {activeTab === 'practice' && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <CheckCircle size={14} className="text-indigo-400" />
                      Step-by-Step Practice Syllabus
                    </h3>
                    {learningResult.practice_plan.length === 0 ? (
                      <p className="text-xs text-slate-650">No practice actions formulated.</p>
                    ) : (
                      <ul className="space-y-3">
                        {learningResult.practice_plan.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-950/20 text-slate-350 text-sm select-text">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-455 text-[10px] font-bold border border-indigo-500/20">
                              {idx + 1}
                            </span>
                            <span className="leading-normal">{step}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* 4. Mentorship Advice & Study Links */}
                {activeTab === 'mentorship' && (
                  <div className="space-y-6">
                    {/* Mentor General Advice text */}
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <GraduationCap size={14} className="text-indigo-400" />
                        Mentoring Direction & Advice
                      </h3>
                      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/30 text-slate-300 text-sm leading-relaxed select-text whitespace-pre-line font-sans">
                        {learningResult.mentor_advice}
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <BookOpen size={14} className="text-purple-400" />
                        Suggested Resources & Exercises
                      </h3>
                      {learningResult.suggested_resources.length === 0 ? (
                        <p className="text-xs text-slate-600">No external resources suggested.</p>
                      ) : (
                        <div className="space-y-2">
                          {learningResult.suggested_resources.map((res, idx) => (
                            <div 
                              key={idx} 
                              className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/45 text-purple-300/90 text-xs font-mono font-bold flex items-center justify-between select-text"
                            >
                              <span>{res}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            /* Blank Welcome viewport */
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/10 p-12 text-slate-500 shadow-2xl backdrop-blur-sm min-h-[500px]">
              <div className="p-4 bg-slate-900/40 rounded-full border border-slate-800/40 mb-4 text-indigo-400">
                <Compass size={36} />
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Roadmap Workspace Idle</h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-1 leading-relaxed">
                Paste your program code inside the editor on the left and click Mentor Me to formulate your custom programming syllabus.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default LearningPath;
