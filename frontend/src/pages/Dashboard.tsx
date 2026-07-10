import React, { useState } from 'react';
import CodeArea from '../components/CodeArea';
import api from '../lib/api';
import { Terminal, Send, AlertTriangle, Sparkles } from 'lucide-react';

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

const Dashboard: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to simulate loading steps for the user
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

  // Helper function to render markdown text in standard JSX
  const renderMarkdown = (text: string) => {
    const blocks = text.split(/(```[\s\S]*?```)/g);
    
    return blocks.map((block, idx) => {
      // Handle code blocks
      if (block.startsWith('```')) {
        const match = block.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : '';
        const codeContent = match ? match[2] : block.slice(3, -3);
        
        return (
          <div key={idx} className="my-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
              <span>{lang || 'code'}</span>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-xs text-indigo-300 leading-relaxed">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Handle standard text lines
      const lines = block.split('\n');
      return lines.map((line, lIdx) => {
        const trimmed = line.trim();

        // Header 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={`${idx}-${lIdx}`} className="text-2xl font-bold text-slate-100 mt-6 mb-3 border-b border-slate-800 pb-2">
              {trimmed.slice(2)}
            </h1>
          );
        }
        
        // Header 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={`${idx}-${lIdx}`} className="text-xl font-bold text-slate-200 mt-5 mb-2">
              {trimmed.slice(3)}
            </h2>
          );
        }

        // Header 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={`${idx}-${lIdx}`} className="text-md font-semibold text-slate-200 mt-4 mb-2">
              {trimmed.slice(4)}
            </h3>
          );
        }

        // List item (unordered)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <ul key={`${idx}-${lIdx}`} className="list-disc pl-5 text-slate-300 space-y-1 my-1 text-sm">
              <li>{parseInlineFormatting(trimmed.slice(2))}</li>
            </ul>
          );
        }

        // List item (ordered)
        const orderedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (orderedMatch) {
          return (
            <ol key={`${idx}-${lIdx}`} className="list-decimal pl-5 text-slate-300 space-y-1 my-1 text-sm">
              <li>{parseInlineFormatting(orderedMatch[2])}</li>
            </ol>
          );
        }

        // Spacing
        if (trimmed === '') {
          return <div key={`${idx}-${lIdx}`} className="h-3"></div>;
        }

        // Default paragraph
        return (
          <p key={`${idx}-${lIdx}`} className="text-slate-300 text-sm leading-relaxed mb-2">
            {parseInlineFormatting(line)}
          </p>
        );
      });
    });
  };

  // Helper function to format bold text and inline code blocks
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="font-mono bg-slate-900/80 text-purple-400 px-1.5 py-0.5 rounded text-xs border border-slate-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Code Explanation Studio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste any complex block of code and receive a structured breakdown powered by Gemini AI.
        </p>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Code input and configuration */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 px-4 text-sm text-slate-300 outline-none transition-colors duration-200 focus:border-indigo-500/50"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-slate-950 text-slate-300">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExplain}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-white border-white/20"></div>
              ) : (
                <>
                  <span>Explain Code</span>
                  <Send size={15} />
                </>
              )}
            </button>
          </div>

          <div className="flex-1">
            <CodeArea value={code} onChange={setCode} />
          </div>
        </div>

        {/* Right Column: Output Explanation Display */}
        <div className="lg:col-span-6 flex flex-col min-h-[400px] rounded-2xl border border-slate-800/80 bg-slate-900/10 shadow-2xl backdrop-blur-sm overflow-hidden">
          
          {/* Result Header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-800/60 bg-slate-900/30">
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-slate-200">AI Explanation Output</h2>
          </div>

          {/* Result Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400 text-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Explanation Request Failed</h4>
                  <p className="text-xs text-rose-400/90 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-indigo-500 border-indigo-950/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={20} className="text-indigo-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    {loadingStep === 1 && 'Initiating request...'}
                    {loadingStep === 2 && 'AI is reading code architecture...'}
                    {loadingStep === 3 && 'Compiling explanation layout...'}
                  </p>
                  <p className="text-xs text-slate-500">This may take a few seconds.</p>
                </div>
              </div>
            )}

            {!explanation && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
                <div className="p-4 bg-slate-900/40 rounded-full border border-slate-800/40 mb-4">
                  <Terminal size={32} className="text-slate-600" />
                </div>
                <h3 className="text-sm font-medium text-slate-400">Ready to Analyze</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Enter your code in the editor on the left and select "Explain Code" to generate your explanation.
                </p>
              </div>
            )}

            {explanation && !loading && !error && (
              <div className="prose prose-invert max-w-none animate-fadeIn select-text">
                {renderMarkdown(explanation)}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
