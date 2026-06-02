import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { History, Calendar, Code, Sparkles, Terminal, BookOpen, ChevronRight, FileText } from 'lucide-react';

interface HistoryItem {
  id: string;
  code_input: string;
  ai_response: string;
  created_at: string;
}

const HistoryPage: React.FC = () => {
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/history');
        setHistoryList(response.data);
        if (response.data.length > 0) {
          setSelectedItem(response.data[0]);
        }
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.detail || 
          err.message || 
          'Failed to load history. Make sure the backend server is running.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
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

  const getCodeSnippetPreview = (code: string) => {
    const lines = code.trim().split('\n');
    const firstLine = lines[0] || '';
    return firstLine.length > 35 ? firstLine.slice(0, 35) + '...' : firstLine;
  };

  // Helper function to render markdown text in standard JSX (same parser as dashboard)
  const renderMarkdown = (text: string) => {
    const blocks = text.split(/(```[\s\S]*?```)/g);
    
    return blocks.map((block, idx) => {
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

      const lines = block.split('\n');
      return lines.map((line, lIdx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={`${idx}-${lIdx}`} className="text-2xl font-bold text-slate-100 mt-6 mb-3 border-b border-slate-800 pb-2">
              {trimmed.slice(2)}
            </h1>
          );
        }
        
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={`${idx}-${lIdx}`} className="text-xl font-bold text-slate-200 mt-5 mb-2">
              {trimmed.slice(3)}
            </h2>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={`${idx}-${lIdx}`} className="text-md font-semibold text-slate-200 mt-4 mb-2">
              {trimmed.slice(4)}
            </h3>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <ul key={`${idx}-${lIdx}`} className="list-disc pl-5 text-slate-300 space-y-1 my-1 text-sm">
              <li>{parseInlineFormatting(trimmed.slice(2))}</li>
            </ul>
          );
        }

        const orderedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (orderedMatch) {
          return (
            <ol key={`${idx}-${lIdx}`} className="list-decimal pl-5 text-slate-300 space-y-1 my-1 text-sm">
              <li>{parseInlineFormatting(orderedMatch[2])}</li>
            </ol>
          );
        }

        if (trimmed === '') {
          return <div key={`${idx}-${lIdx}`} className="h-3"></div>;
        }

        return (
          <p key={`${idx}-${lIdx}`} className="text-slate-300 text-sm leading-relaxed mb-2">
            {parseInlineFormatting(line)}
          </p>
        );
      });
    });
  };

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
          Explanation History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review all code snippets you have analyzed and their explanation responses.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-24 text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-indigo-500 border-indigo-950/40"></div>
            <p className="text-xs font-semibold text-slate-400">Loading history records...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-400">
          <h3 className="font-bold text-md mb-2">Error Loading History</h3>
          <p className="text-xs leading-relaxed">{error}</p>
        </div>
      ) : historyList.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-slate-500 py-16 rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/10">
          <div className="p-4 bg-slate-900/40 rounded-full border border-slate-800/40 mb-4">
            <History size={32} className="text-slate-600" />
          </div>
          <h3 className="text-sm font-medium text-slate-400">No Explanation History</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
            Your explained code listings will show up here. Go back to the dashboard to explain your first script.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Panel: Scrollable History List */}
          <div className="lg:col-span-4 flex flex-col space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {historyList.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-600/5'
                      : 'bg-slate-900/20 border-slate-800/80 hover:border-slate-700/60 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <FileText size={10} />
                      Code Log
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Calendar size={10} />
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-indigo-300 bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-850 truncate">
                    {getCodeSnippetPreview(item.code_input)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Panel: Selected Item Detail View */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/10 shadow-2xl backdrop-blur-sm overflow-hidden">
            {selectedItem ? (
              <div className="flex flex-col h-full overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/30">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-200">Log Details</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    ID: {selectedItem.id.slice(0, 8)}...
                  </span>
                </div>

                {/* Body Content */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 select-text">
                  
                  {/* Collapsible/Compact Input Code Area */}
                  <div>
                    <h3 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      <Code size={12} />
                      Original Input Code
                    </h3>
                    <pre className="p-4 rounded-xl border border-slate-850 bg-slate-950/60 font-mono text-xs text-slate-300 max-h-[160px] overflow-y-auto">
                      <code>{selectedItem.code_input}</code>
                    </pre>
                  </div>

                  {/* AI Explanation Output */}
                  <div className="border-t border-slate-800/60 pt-6">
                    <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                      <Sparkles size={12} className="text-indigo-400" />
                      AI Explanation
                    </h3>
                    <div className="prose prose-invert max-w-none">
                      {renderMarkdown(selectedItem.ai_response)}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
                <p>Select a history item from the left menu to view details.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default HistoryPage;
