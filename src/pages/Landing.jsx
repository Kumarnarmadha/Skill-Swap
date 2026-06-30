import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  Star, 
  Flame,
  Award,
  BookOpenCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth?mode=register');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="relative min-h-screen transition-colors duration-300 bg-lightBg dark:bg-darkBg overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none radial-mesh-light dark:radial-mesh opacity-100 transition-opacity duration-300"></div>

      {/* Decorative Floating Blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent dark:text-accent-dark animate-pulse" />
            <span className="text-xs font-semibold text-primary dark:text-primary-dark tracking-wider uppercase">Welcome to the Knowledge Economy</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-7xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight leading-[1.08] mb-6"
          >
            Knowledge is the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">only currency.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-normal leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Learn. Teach. Grow. Unlock premium developer courses, verify your skills, and earn Learning Credits (LC) in a self-sustaining intellectual ecosystem.
          </motion.p>

          {/* Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20"
          >
            <button
              onClick={handleStart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white font-semibold px-8 py-4 rounded-xl shadow-glow-purple transition duration-300"
            >
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="w-full sm:w-auto flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-800 dark:text-white font-semibold px-8 py-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition duration-300"
            >
              Explore Courses
            </button>
          </motion.div>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto border-t border-b border-gray-200/40 dark:border-gray-800/60 py-10 mb-28 bg-gray-50/20 dark:bg-darkCard/10 rounded-2xl px-6"
        >
          {[
            { value: "120+", label: "Mastery Courses" },
            { value: "45+", label: "Verified Mentors" },
            { value: "24,000+", label: "Learning Credits Exchanged" },
            { value: "3,500+", label: "Active Learners" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features / How It Works */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4">How SkillSwap Works</h2>
            <p className="text-gray-600 dark:text-gray-400">Our decentralized design eliminates money as a barrier, establishing a pure learning loop.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                step: "01",
                title: "Register & Get Starter LC",
                desc: "Every new account receives starter Learning Credits (LC) and foundation courses to kickstart their intellectual journey."
              },
              {
                icon: Cpu,
                step: "02",
                title: "Unlock & Master Modules",
                desc: "Spend LC to unlock courses. Watch bite-sized unlisted videos, complete interactive code assignments, and pass quizzes to unlock next modules."
              },
              {
                icon: Zap,
                step: "03",
                title: "Teach & Recharge Balance",
                desc: "Create and publish courses to teach the community. Or answer doubts on the forum. Earn LC payouts to unlock advanced learning."
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8 }}
                  className="p-8 rounded-2xl glass-panel-light dark:glass-panel-dark shadow-premium-light dark:shadow-premium-dark flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-gray-300 dark:text-gray-700">{feat.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feat.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4">Learner Testimonials</h2>
            <p className="text-gray-600 dark:text-gray-400">Join top developers who are swapping skills every day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Alex Rivera",
                role: "Senior Systems Engineer",
                comment: "The fact that I can't withdraw credits keeps the platform pure. Everyone here actually wants to learn and teach. I shared my Go architecture secrets and unlocked an advanced AI engineering course.",
                rating: 5
              },
              {
                name: "Sophia Vance",
                role: "Self-Taught Architect",
                comment: "Starting with 50 LC let me unlock key courses. Passing quizzes got me enough bonus credits to study design systems. SkillSwap is the best Knowledge Economy I've ever experienced.",
                rating: 5
              }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-2xl glass-panel-light dark:glass-panel-dark shadow-sm">
                <div className="flex gap-1 mb-4 text-warning">
                  {[...Array(t.rating)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-warning" />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-6">"{t.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold">{t.name[0]}</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400">Everything you need to know about the SkillSwap system.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "What are Learning Credits (LC)?",
                a: "Learning Credits are the closed-loop currency of SkillSwap. They represent educational energy. You earn them by creating modules, completing quizzes, or answering community doubts. You spend them to unlock premium courses."
              },
              {
                q: "Can I buy or withdraw credits with actual money?",
                a: "No. SkillSwap is built on the philosophy that 'Knowledge is the only currency.' Learning Credits cannot be bought with money, nor can they be withdrawn. They exist solely to ensure value exchange remains educational."
              },
              {
                q: "How does the Mentor Reward work?",
                a: "Mentors do not receive credits immediately upon a user unlocking a course. Credits are locked in escrow and only released when the learner completes the modules, passes the final quiz, and submits a review."
              }
            ].map((faq, i) => (
              <details key={i} className="group p-6 rounded-2xl glass-panel-light dark:glass-panel-dark [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    {faq.q}
                  </h3>
                  <span className="ml-1.5 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 p-1.5 text-gray-900 dark:text-white group-open:rotate-180 transition-transform duration-300">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </span>
                </summary>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-7">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-darkCard/30 relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-[10px]">SS</div>
            <span>SkillSwap</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2026 SkillSwap Platform. Built for the Decentralized Knowledge Economy.
          </div>
          <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-400">
            <span className="hover:text-primary cursor-pointer transition">Philosophy</span>
            <span className="hover:text-primary cursor-pointer transition">Marketplace</span>
            <span className="hover:text-primary cursor-pointer transition">Developer API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
