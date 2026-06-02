import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, History, LogOut, Code } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error("Logout failure:", err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/40 border-r border-slate-800/80 backdrop-blur-md">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
          <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Code size={22} className="animate-pulse" />
          </div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            CodeMentor AI
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-950/40 hover:text-slate-100 border border-transparent'
              }`
            }
          >
            <Terminal size={20} />
            <span>Explain Code</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-950/40 hover:text-slate-100 border border-transparent'
              }`
            }
          >
            <History size={20} />
            <span>History Logs</span>
          </NavLink>
        </nav>

        {/* Authenticated User Status Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="truncate max-w-[150px]">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Account</p>
              <p className="text-sm font-medium text-slate-300 truncate" title={user?.email}>
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all duration-200"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header Navigation */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Code size={20} className="text-indigo-400" />
            <span className="font-bold text-md tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CodeMentor AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `p-2 rounded-lg transition-colors ${isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`
              }
            >
              <Terminal size={18} />
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `p-2 rounded-lg transition-colors ${isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'}`
              }
            >
              <History size={18} />
            </NavLink>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 rounded-lg">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
