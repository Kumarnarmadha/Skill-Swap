import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  Award, 
  BrainCircuit, 
  HelpCircle 
} from 'lucide-react';

export default function Auth() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'forgot', 'onboarding'
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Onboarding states
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [onboardingStep, setOnboardingStep] = useState(1); // 1: Credit Pop, 2: Skill Select, 3: Course Recommendations

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error);
      }
    } else if (mode === 'register') {
      if (!name) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password);
      if (res.success) {
        setMode('onboarding');
      } else {
        setError(res.error);
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Simulate forgot password
    setTimeout(() => {
      setSuccessMsg('A password recovery email has been sent. Please check your inbox.');
      setLoading(false);
    }, 1000);
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const finishOnboarding = () => {
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const skillsList = [
    "Distributed Systems",
    "Frontend Engineering",
    "UX Psychology",
    "Game Theory",
    "Pedagogy",
    "Go / Rust Development",
    "UI Glassmorphism",
    "Tokenomics"
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-lightBg dark:bg-darkBg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Glow mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {mode !== 'onboarding' ? (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md p-8 rounded-2xl glass-panel-light dark:glass-panel-dark shadow-premium-dark border border-gray-200/50 dark:border-gray-800/50 z-10"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
                {mode === 'login' && 'Sign in to SkillSwap'}
                {mode === 'register' && 'Create your Profile'}
                {mode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                {mode === 'login' && "Access the knowledge marketplace"}
                {mode === 'register' && "Receive 50 starter Learning Credits"}
                {mode === 'forgot' && "We'll send recovery instructions"}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-semibold mb-4 text-center">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-success/10 border border-success/20 text-success rounded-xl text-xs font-semibold mb-4 text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={mode === 'forgot' ? handleForgotPassword : handleAuthSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alexander Thorne"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-primary dark:text-primary-dark hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-glow-purple transition duration-200 flex justify-center items-center gap-2"
              >
                {loading ? 'Processing...' : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Register Profile'}
                    {mode === 'forgot' && 'Send Instructions'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
              {mode === 'login' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  New to the economy?{' '}
                  <button onClick={() => setMode('register')} className="text-primary font-semibold hover:underline">
                    Create account (+50 LC)
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-primary font-semibold hover:underline">
                    Login
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <button onClick={() => setMode('login')} className="text-xs text-primary font-semibold hover:underline">
                  Return to login
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Onboarding wizard */
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl p-8 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-2xl z-10 text-center"
          >
            {onboardingStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-glow-purple">
                  <Award className="w-10 h-10 text-white animate-bounce" />
                </div>
                <h3 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
                  Welcome to SkillSwap, {user?.name}!
                </h3>
                <div className="inline-block px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 dark:border-primary/40 font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-lg">
                  + 50 Learning Credits (LC) Loaded
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  We've credited your account with starter learning assets. Use them to unlock specialized modules, test your intelligence, and participate in peer doubt pools.
                </p>
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-glow-purple transition"
                >
                  Configure My Preferences
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {onboardingStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  Select Skills of Interest
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  We'll suggest specific foundational courses to help you leverage your credits.
                </p>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {skillsList.map((skill, index) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`p-3 rounded-xl text-xs font-semibold text-center border transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary/15 border-primary text-primary dark:text-primary-dark font-bold'
                            : 'bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white px-4 py-2"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    disabled={selectedSkills.length === 0}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-glow-purple disabled:opacity-50 transition"
                  >
                    Generate Recommendations
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {onboardingStep === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 text-left"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-success/10 flex items-center justify-center text-success mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                    Foundational Pathways Ready
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Based on your interest in {selectedSkills.join(', ')}:
                  </p>
                </div>

                {/* Course Recommendation cards */}
                <div className="space-y-3.5 max-w-md mx-auto">
                  <div className="p-4 rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Introduction to Knowledge Tokenomics</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Difficulty: Beginner • Value: 15 LC</p>
                    </div>
                    <span className="text-[10px] font-bold text-primary dark:text-primary-dark uppercase border border-primary/20 px-2 py-0.5 rounded">Highly Recommended</span>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">UX Psychology & Cognitive Load</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Difficulty: Intermediate • Value: 25 LC</p>
                    </div>
                    <span className="text-[10px] text-gray-500 border border-gray-200 dark:border-gray-800 px-2 py-0.5 rounded">Matching Skill</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white px-4 py-2"
                  >
                    Modify Skills
                  </button>
                  <button
                    onClick={finishOnboarding}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-glow-purple transition"
                  >
                    Enter Workspace
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
