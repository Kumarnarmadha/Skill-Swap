import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import CourseDetails from './pages/CourseDetails';
import CoursePlayer from './pages/CoursePlayer';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Forum from './pages/Forum';

// Route wrapper to guard authenticated paths
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/auth?mode=login" />;
};

function AppContent() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen transition-colors duration-300 bg-lightBg dark:bg-darkBg text-gray-900 dark:text-white font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        
        {/* Protected workspace paths */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
        <Route path="/courses/:id" element={<PrivateRoute><CourseDetails /></PrivateRoute>} />
        <Route path="/courses/:id/player" element={<PrivateRoute><CoursePlayer /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/forum" element={<PrivateRoute><Forum /></PrivateRoute>} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
