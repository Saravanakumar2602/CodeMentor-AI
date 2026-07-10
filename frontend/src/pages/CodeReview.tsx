import React, { useState, useEffect } from 'react';
import { useReview } from '../context/ReviewContext';
import CodeArea from '../components/CodeArea';
import { 
  FileCheck2, 
  Send, 
  Calendar, 
  FileText, 
  Trash2, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Code2
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

const CodeReview: React.FC = () => {
  const {
    code,
    setCode,
    language,
    setLanguage,
    loading,
    loadingStep,
    reviewResult,
    setReviewResult,
    error,
    handleReview,
    reviewList,
    fetchReviewList,
    deleteReview,
  } = useReview();

  const [activeTab, setActiveTab] = useState<'summary' | 'suggestions' | 'refactor' | 'tips'>('summary');

  useEffect(() => {
    fetchReviewList();
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

  const getCodeSnippetPreview = (codeContent: string) => {
    const lines = codeContent.trim().split('\n');
    const firstLine = lines[0] || '';
    return firstLine.length > 25 ? firstLine.slice(0, 25) + '...' : firstLine;
  };

  // Helper to color-code scores
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 50) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-rose-500/10 border-rose-500/30';
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this code review from your history?")) {
      return;
    }
    try {
      await deleteReview(id);
    } catch (err) {
      alert("Failed to delete review entry.");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          AI Code Review
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Perform high-fidelity static code analysis evaluated against naming, readability, security, maintainability, and SOLID smells.
        </p>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Workspace: Editor and controls */}
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
              onClick={handleReview}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-white border-white/20"></div>
              ) : (
                <>
                  Analyze <Send size={14} />
                </>
              )}
            </button>
          </div>

          <CodeArea
            value={code}
            onChange={setCode}
            placeholder="// Paste your code script here to initiate a professional code review..."
            language={language}
          />

          {/* History Panel */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-5 shadow-xl backdrop-blur-sm">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              <Calendar size={14} />
              Review History
            </h3>

            {reviewList.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-6">
                No past code reviews found.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {reviewList.map((item) => {
                  const isSelected = reviewResult?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setReviewResult(item)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500/40'
                          : 'bg-slate-950/20 border-slate-850 hover:bg-slate-900/30 hover:border-slate-800/60'
                      }`}
                    >
                      <div className="truncate flex-1 min-w-0 pr-3">
                        <p className="font-mono text-xs text-slate-300 truncate">
                          {getCodeSnippetPreview(item.code_input)}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColorClass(item.overall_score)}`}>
                          {item.overall_score}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-all duration-200"
                          title="Delete entry"
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

        {/* Right Workspace: Structured Review Results Panel */}
        <div className="lg:col-span-7 flex flex-col items-stretch">
          
          {loading ? (
            /* Loading Simulator Component */
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/10 p-12 text-slate-500 shadow-2xl backdrop-blur-sm min-h-[500px]">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-t-indigo-500 border-indigo-950/40 shadow-inner"></div>
                <div className="space-y-1">
                  <h3 className="text-slate-200 font-bold">Evaluating Code Quality</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed animate-pulse">
                    {loadingStep === 1 && "Connecting to Nemotron-3 API..."}
                    {loadingStep === 2 && "Analyzing SOLID principles & security gaps..."}
                    {loadingStep === 3 && "Grading quality metrics & compiling refactor suggestion..."}
                    {loadingStep === 0 && "Initializing review..."}
                  </p>
                </div>
              </div>
            </div>
          ) : error ? (
            /* Error Display Component */
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-rose-400 shadow-2xl backdrop-blur-sm min-h-[500px]">
              <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20 mb-4 animate-shake">
                <ShieldAlert size={36} />
              </div>
              <h3 className="text-lg font-bold text-rose-200 mb-2">Analysis Failed</h3>
              <p className="text-xs text-center text-rose-400/80 max-w-sm leading-relaxed mb-6">
                {error}
              </p>
              <button
                onClick={handleReview}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 px-5 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 transition-all duration-200"
              >
                Retry Request
              </button>
            </div>
          ) : reviewResult ? (
            /* Code Review Results view dashboard */
            <div className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/10 shadow-2xl backdrop-blur-sm overflow-hidden h-full">
              
              {/* Overall & Metric Scores Section */}
              <div className="p-6 bg-slate-900/30 border-b border-slate-800/60 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Big gauge circle for overall score */}
                <div className="md:col-span-4 flex flex-col items-center text-center">
                  <div className={`relative flex h-28 w-28 items-center justify-center rounded-full border-4 shadow-xl ${getScoreBgClass(reviewResult.overall_score)}`}>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-extrabold tracking-tight">
                        {reviewResult.overall_score}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Overall</span>
                    </div>
                  </div>
                </div>

                {/* Score bar meters for metrics */}
                <div className="md:col-span-8 space-y-3">
                  {[
                    { label: 'Readability', score: reviewResult.readability_score },
                    { label: 'Performance', score: reviewResult.performance_score },
                    { label: 'Maintainability', score: reviewResult.maintainability_score },
                    { label: 'Security', score: reviewResult.security_score },
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">{metric.label}</span>
                        <span className={getScoreColorClass(metric.score).split(' ')[0]}>{metric.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${getScoreBarColor(metric.score)}`} 
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-800/60 bg-slate-900/20 px-4">
                {[
                  { id: 'summary', label: 'Summary', icon: FileText },
                  { id: 'suggestions', label: 'Suggestions', icon: CheckCircle },
                  { id: 'refactor', label: 'Refactored Code', icon: Code2 },
                  { id: 'tips', label: 'Interview Tips', icon: HelpCircle },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3.5 px-4 text-xs font-medium border-b-2 transition-all duration-300 focus:outline-none ${
                        isActive
                          ? 'border-indigo-500 text-indigo-400 font-semibold'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Display Panel */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[460px] custom-scrollbar">
                
                {/* Summary Panel */}
                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <FileText size={14} className="text-indigo-400" />
                      Executive Review Summary
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans select-text">
                      {reviewResult.summary}
                    </p>
                  </div>
                )}

                {/* Suggestions List Panel */}
                {activeTab === 'suggestions' && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <CheckCircle size={14} className="text-indigo-400" />
                      Improvement Actions
                    </h3>
                    {reviewResult.suggestions.length === 0 ? (
                      <p className="text-xs text-slate-600">No major suggestions provided.</p>
                    ) : (
                      <ul className="space-y-3">
                        {reviewResult.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/20 text-slate-300 text-sm select-text">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                              {idx + 1}
                            </span>
                            <span className="leading-normal">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Refactored Code Panel */}
                {activeTab === 'refactor' && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <Code2 size={14} className="text-indigo-400" />
                      Refactored Code Proposal
                    </h3>
                    {reviewResult.refactored_code ? (
                      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg select-text">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                          <span>{language || 'refactored'}</span>
                        </div>
                        <pre className="p-4 overflow-x-auto font-mono text-xs text-indigo-300 leading-relaxed max-h-[350px]">
                          <code>{reviewResult.refactored_code}</code>
                        </pre>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-4 text-center">
                        Code structure is optimal. No structural refactoring is required.
                      </p>
                    )}
                  </div>
                )}

                {/* Interview Tips Panel */}
                {activeTab === 'tips' && (
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <HelpCircle size={14} className="text-indigo-400" />
                      Interview Focus Items
                    </h3>
                    {reviewResult.interview_tips.length === 0 ? (
                      <p className="text-xs text-slate-600">No interview tips identified for this code pattern.</p>
                    ) : (
                      <ul className="space-y-3">
                        {reviewResult.interview_tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/20 text-slate-300 text-sm select-text">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                              ?
                            </span>
                            <span className="leading-normal font-sans">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

              </div>

            </div>
          ) : (
            /* Blank/Welcome Screen */
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/10 p-12 text-slate-500 shadow-2xl backdrop-blur-sm min-h-[500px]">
              <div className="p-4 bg-slate-900/40 rounded-full border border-slate-800/40 mb-4 text-indigo-400">
                <FileCheck2 size={36} />
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Analysis Queue Empty</h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-1 leading-relaxed">
                Paste your program code inside the editor on the left and click Analyze to receive your senior review.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CodeReview;
