import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlaygroundProvider } from './context/PlaygroundContext';
import { ReviewProvider } from './context/ReviewContext';
import { LearningProvider } from './context/LearningContext';
import { PracticeProvider } from './context/PracticeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/History';
import CodeReview from './pages/CodeReview';
import LearningPath from './pages/LearningPath';
import PracticePage from './pages/Practice';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlaygroundProvider>
          <ReviewProvider>
            <LearningProvider>
              <PracticeProvider>
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Protected Dashboard/App Routes */}
                  <Route element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/review" element={<CodeReview />} />
                      <Route path="/learning" element={<LearningPath />} />
                      <Route path="/practice" element={<PracticePage />} />
                    </Route>
                  </Route>

                  {/* Fallback to 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PracticeProvider>
            </LearningProvider>
          </ReviewProvider>
        </PlaygroundProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;
