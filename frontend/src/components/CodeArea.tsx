import React from 'react';

interface CodeAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: string;
}

const CodeArea: React.FC<CodeAreaProps> = ({
  value,
  onChange,
  placeholder = "// Paste your code here and click Explain Code...",
}) => {
  return (
    <div className="relative w-full rounded-2xl border border-slate-800/80 bg-slate-900/20 focus-within:border-indigo-500/50 transition-all duration-300 shadow-2xl backdrop-blur-sm overflow-hidden">
      {/* Editor Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/70"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500/70"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500/70"></span>
          <span className="text-xs text-slate-400 font-mono ml-2">code_session.py</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/30">
            Source
          </span>
        </div>
      </div>

      {/* Text Area Input */}
      <div className="relative min-h-[320px] p-4 bg-slate-950/40">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[300px] bg-transparent text-indigo-100 placeholder-slate-600 border-none outline-none resize-y focus:ring-0 focus:outline-none font-mono text-sm leading-relaxed"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default CodeArea;
