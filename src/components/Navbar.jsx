import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sun, 
  Moon, 
  Bell, 
  User, 
  LogOut, 
  Cpu, 
  Sparkles, 
  Menu, 
  X, 
  Award,
  BookOpen,
  MessageSquare,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout, notifications, markNotificationsAsRead, darkMode, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  const navLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: Cpu },
    { path: '/marketplace', name: 'Marketplace', icon: BookOpen },
    { path: '/forum', name: 'Doubts & Forums', icon: MessageSquare },
    { path: '/leaderboard', name: 'Leaderboard', icon: Trophy },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-300 w-full glass-panel-light dark:glass-panel-dark border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl font-heading text-gray-900 dark:text-white tracking-tight">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow-purple"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <span>Skill<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Swap</span></span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          {user && (
            <div className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'text-primary dark:text-primary-dark bg-gray-100 dark:bg-gray-800/60 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Action Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            {user ? (
              <>
                {/* Learning Credits Capsule */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-accent/15 border border-primary/20 dark:border-primary/40 px-3.5 py-1.5 rounded-full hover:shadow-glow-indigo transition-all duration-300"
                >
                  <Award className="w-4 h-4 text-accent dark:text-accent-dark animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wider">
                    {user.learningCredits} <span className="text-primary font-bold">LC</span>
                  </span>
                </motion.div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={handleNotificationsClick}
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full animate-pulse border border-white dark:border-darkBg"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 py-2"
                      >
                        <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-800/50 flex justify-between items-center">
                          <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
                          {unreadCount > 0 && <span className="text-xs text-primary">{unreadCount} new</span>}
                        </div>
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-gray-500">No notifications yet.</div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800/40 text-xs hover:bg-gray-50 dark:hover:bg-gray-800/20 transition ${
                                !n.read ? 'bg-primary/5 dark:bg-primary/5 border-l-2 border-l-primary' : ''
                              }`}
                            >
                              <div className="font-semibold text-gray-800 dark:text-gray-200">{n.title}</div>
                              <div className="text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile / Avatar */}
                <div className="flex items-center gap-2.5 border-l border-gray-200 dark:border-gray-800 pl-4">
                  <Link to="/profile" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition">{user.name}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">Rank {user.knowledgeScore > 200 ? 'Master' : 'Learner'}</div>
                    </div>
                  </Link>

                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-error hover:bg-red-500/10 transition"
                    title="Logout"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth?mode=login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 py-1.5 transition">
                  Login
                </Link>
                <Link to="/auth?mode=register" className="text-sm font-medium text-white bg-gradient-to-r from-primary to-accent px-4 py-2 rounded-lg hover:shadow-glow-purple transition duration-200">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger icon */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 pt-2 pb-4 space-y-2.5 glass-panel-light dark:glass-panel-dark"
          >
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-semibold">
                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : user.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.learningCredits} LC balance</div>
                  </div>
                </div>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        isActive(link.path)
                          ? 'text-primary dark:text-primary-dark bg-gray-100 dark:bg-gray-800/80'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    logout();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-error rounded-lg text-sm font-medium hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/auth?mode=login"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-center py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Login
                </Link>
                <Link
                  to="/auth?mode=register"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-center py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-primary to-accent"
                >
                  Register
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
