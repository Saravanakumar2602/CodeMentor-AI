import React from 'react';
import { Link } from 'react-router-dom';
import { Code, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-3 shadow-lg shadow-indigo-500/5">
            <Code size={26} className="animate-pulse" />
          </div>
          <span className="font-bold text-sm tracking-wider uppercase text-slate-500">
            Error 404
          </span>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/30 p-8 shadow-2xl backdrop-blur-md space-y-6">
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Lost in Code?
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page you are looking for doesn't exist or has been relocated. Let's get you back on track.
          </p>
          <div className="pt-4">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
