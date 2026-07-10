import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlaygroundProvider } from './context/PlaygroundContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlaygroundProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Dashboard/App Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/history" element={<HistoryPage />} />
              </Route>
            </Route>

            {/* Fallback to Dashboard / Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PlaygroundProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
