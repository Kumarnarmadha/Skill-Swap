import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create configured Axios instance
export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillswap_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillswap_token'));
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  // Initialize Auth & Theme
  useEffect(() => {
    const initialize = async () => {
      // 1. Theme Configuration
      const savedTheme = localStorage.getItem('skillswap_theme');
      const isDark = savedTheme !== null ? savedTheme === 'dark' : true;
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // 2. Fetch User Profile
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
          // Set user dark mode setting if saved
          if (response.data.settings && response.data.settings.darkMode !== undefined) {
            const userDark = response.data.settings.darkMode;
            setDarkMode(userDark);
            if (userDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          // Fetch notifications
          const notifRes = await api.get('/notifications');
          setNotifications(notifRes.data);
        } catch (error) {
          console.error("Session verification failed. Token expired or server unreachable.", error);
          logout();
        }
      }
      setLoading(false);
    };

    initialize();
  }, [token]);

  // Handle User Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: userToken, user: userData } = response.data;
      
      localStorage.setItem('skillswap_token', userToken);
      setToken(userToken);
      setUser(userData);
      
      // Update theme from user preferences
      if (userData.settings && userData.settings.darkMode !== undefined) {
        setThemeMode(userData.settings.darkMode);
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid credentials' 
      };
    }
  };

  // Handle User Registration
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token: userToken, user: userData } = response.data;
      
      localStorage.setItem('skillswap_token', userToken);
      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  // Handle Logout
  const logout = () => {
    localStorage.removeItem('skillswap_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  // Toggle CSS Light/Dark themes
  const setThemeMode = (dark) => {
    setDarkMode(dark);
    localStorage.setItem('skillswap_theme', dark ? 'dark' : 'light');
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = async () => {
    const nextMode = !darkMode;
    setThemeMode(nextMode);
    
    if (user) {
      try {
        const response = await api.put('/users/settings', { darkMode: nextMode });
        setUser(response.data);
      } catch (err) {
        console.error("Could not sync settings to backend.", err);
      }
    }
  };

  // Sync / refresh notification list
  const refreshNotifications = async () => {
    if (!token) return;
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications as read
  const markNotificationsAsRead = async () => {
    if (!token) return;
    try {
      await api.post('/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Unlock course transaction helper
  const unlockCourse = async (courseId) => {
    try {
      const response = await api.post(`/courses/${courseId}/unlock`);
      setUser(response.data.user);
      refreshNotifications();
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Could not unlock course.'
      };
    }
  };

  // Submit Quiz helper
  const submitQuizAnswers = async (courseId, moduleId, answers) => {
    try {
      const response = await api.post(`/courses/${courseId}/modules/${moduleId}/quiz`, { answers });
      if (response.data.passed) {
        setUser(response.data.user);
        refreshNotifications();
      }
      return response.data; // contains passed, score, correctCount, totalQuestions, user, message
    } catch (error) {
      return {
        passed: false,
        error: error.response?.data?.error || 'Could not submit quiz.'
      };
    }
  };

  // Complete course transaction helper
  const completeCourse = async (courseId) => {
    try {
      const response = await api.post(`/courses/${courseId}/complete`);
      setUser(response.data.user);
      refreshNotifications();
      return { success: true, certificate: response.data.certificate, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Could not complete course.'
      };
    }
  };

  // Reload user profile info manually
  const refreshUserProfile = async () => {
    if (!token) return;
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      notifications,
      darkMode,
      login,
      register,
      logout,
      toggleTheme,
      unlockCourse,
      submitQuizAnswers,
      completeCourse,
      refreshNotifications,
      markNotificationsAsRead,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
