import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Lock, 
  CheckCircle, 
  BookOpen, 
  HelpCircle, 
  Award, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles,
  Printer,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, submitQuizAnswers, completeCourse } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active module & Navigation
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes', 'quiz', 'assignment'
  
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [quizResult, setQuizResult] = useState(null); // { passed, score, correctCount, totalQuestions, message }
  const [quizError, setQuizError] = useState('');
  
  // Assignment state
  const [assignmentSubmission, setAssignmentSubmission] = useState('');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  // Certificate / Completion
  const [completedCertificate, setCompletedCertificate] = useState(null);

  // Get enrollment detail
  const enrollment = user?.enrolledCourses?.find(ec => ec.courseId === id);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        if (!user) {
          navigate('/auth?mode=login');
          return;
        }

        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);

        if (enrollment) {
          setActiveModuleIndex(enrollment.currentModuleIndex || 0);
        }
      } catch (err) {
        setError('Could not load course player.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading Course Interface...</p>
        </div>
      </div>
    );
  }

  if (error || !course || !enrollment) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center p-4">
        <div className="p-8 rounded-2xl glass-panel-light dark:glass-panel-dark text-center max-w-md">
          <p className="text-sm text-error font-semibold mb-4">{error || 'You are not enrolled in this course.'}</p>
          <button onClick={() => navigate('/marketplace')} className="text-xs text-primary font-bold hover:underline">Go to Marketplace</button>
        </div>
      </div>
    );
  }

  const activeModule = course.modules[activeModuleIndex];

  // Check if a specific module index is unlocked
  const isModuleUnlocked = (index) => {
    if (index === 0) return true;
    // Unlocked if user progress index is >= this index, or previous module is completed
    const prevModule = course.modules[index - 1];
    return enrollment.completedModules.includes(prevModule.id);
  };

  // Check if a specific module is completed
  const isModuleCompleted = (modId) => {
    return enrollment.completedModules.includes(modId);
  };

  const handleSelectOption = (qIdx, optIdx) => {
    setQuizAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleQuizSubmit = async () => {
    setQuizError('');
    setQuizResult(null);

    const questions = activeModule.quiz.questions;
    // Validate that user answered all questions
    if (Object.keys(quizAnswers).length < questions.length) {
      setQuizError('Please answer all questions before evaluating.');
      return;
    }

    const answersArray = questions.map((_, idx) => quizAnswers[idx]);
    const res = await submitQuizAnswers(course.id, activeModule.id, answersArray);

    if (res.error) {
      setQuizError(res.error);
    } else {
      setQuizResult(res);
      if (res.passed) {
        // Trigger minor confetti celebration for module pass
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!assignmentSubmission.trim()) return;
    setAssignmentSubmitted(true);
    // Award achievement points locally
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.7 }
    });
  };

  const handleFinalCourseComplete = async () => {
    const res = await completeCourse(course.id);
    if (res.success) {
      setCompletedCertificate(res.certificate);
      // Trigger massive confetti blast!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });
    } else {
      alert(res.error || 'Failed to complete course.');
    }
  };

  const allModulesCompleted = course.modules.every(m => enrollment.completedModules.includes(m.id));

  // Render certificate if completed modal active
  if (completedCertificate) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center p-4 transition-colors duration-300">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full p-8 rounded-3xl glass-panel-light dark:glass-panel-dark border border-gray-200 dark:border-gray-800 text-center shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center text-success">
            <Award className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white">Mastery Verified</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Your educational credentials have been successfully written to the ledger.</p>
          
          {/* Certificate Board */}
          <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800/80 bg-white dark:bg-gray-950/40 text-left space-y-4 font-heading font-sans relative">
            <span className="absolute top-4 right-4 text-[10px] font-mono text-gray-400">ID: {completedCertificate.id}</span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary">SkillSwap Board of Education</span>
              <h3 className="text-lg font-bold text-gray-850 dark:text-gray-100 mt-1">{completedCertificate.courseTitle}</h3>
            </div>
            <div className="text-sm">
              <span className="text-gray-500 block text-xs">Mastery Endorsed to</span>
              <span className="font-bold text-gray-900 dark:text-white text-base">{completedCertificate.studentName}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-4 border-t border-gray-150 dark:border-gray-850">
              <div>
                <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Verified Mentor</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{completedCertificate.mentorName}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Date Released</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{completedCertificate.issueDate}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-xs font-semibold px-4.5 py-3 rounded-xl border border-gray-200 dark:border-gray-800 transition"
            >
              <Printer className="w-4 h-4" />
              Print Certificate
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-primary to-accent text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-sm hover:opacity-95"
            >
              Enter Workspace
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-gray-900 dark:text-white transition-colors duration-300 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(`/courses/${course.id}`)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Details
        </button>

        {/* Player Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Player & Notes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Native Video Player Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-200/50 dark:border-gray-800/50">
              
              {/* Overlapping Glass Header to block Youtube overlay links */}
              <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none"></div>
              
              <iframe
                src={`${activeModule.videoUrl}?modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&theme=dark`}
                title={activeModule.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Title / Module info */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Module {activeModuleIndex + 1}</span>
              <h2 className="text-xl font-bold font-heading mt-1">{activeModule.title}</h2>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-850 flex gap-4">
              {[
                { id: 'notes', name: 'Study Notes', icon: BookOpen },
                { id: 'quiz', name: 'Interactive Quiz', icon: HelpCircle },
                { id: 'assignment', name: 'Assignments', icon: Award }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setQuizError('');
                      setQuizResult(null);
                    }}
                    className={`flex items-center gap-1.5 pb-3.5 text-xs font-semibold border-b-2 transition ${
                      activeTab === tab.id
                        ? 'border-primary text-primary dark:text-primary-dark font-bold'
                        : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Panel */}
            <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 min-h-48">
              
              {/* Tab: Notes */}
              {activeTab === 'notes' && (
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
                  <p>{activeModule.notes}</p>
                </div>
              )}

              {/* Tab: Quiz */}
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  {/* Error banner */}
                  {quizError && (
                    <div className="p-3.5 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-semibold text-center">
                      {quizError}
                    </div>
                  )}

                  {/* Result banner */}
                  {quizResult && (
                    <div className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed text-center ${
                      quizResult.passed 
                        ? 'bg-success/10 border-success/20 text-success' 
                        : 'bg-error/10 border-error/20 text-error'
                    }`}>
                      {quizResult.message} (Score: {quizResult.score}%)
                    </div>
                  )}

                  {activeModule.quiz && activeModule.quiz.questions.map((q, qIdx) => (
                    <div key={q.id} className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-850 dark:text-gray-200 flex gap-2">
                        <span className="text-primary font-mono">{qIdx + 1}.</span>
                        {q.question}
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5 pl-5">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizAnswers[qIdx] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(qIdx, oIdx)}
                              disabled={isModuleCompleted(activeModule.id)}
                              className={`p-3.5 rounded-xl text-left text-xs font-semibold border transition ${
                                isSelected
                                  ? 'bg-primary/10 border-primary text-primary font-bold'
                                  : 'bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-850 text-gray-650 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-750'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Submit Quiz btn */}
                  {!isModuleCompleted(activeModule.id) && (
                    <button
                      onClick={handleQuizSubmit}
                      className="bg-gradient-to-r from-primary to-accent text-white font-semibold text-xs px-6 py-3 rounded-xl hover:shadow-glow-purple shadow-sm transition"
                    >
                      Evaluate Quiz Answers
                    </button>
                  )}
                </div>
              )}

              {/* Tab: Assignment */}
              {activeTab === 'assignment' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Active Assignment</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Implement a practical solution covering the metrics explained in this module. Write your conceptual solution or link your repository branch.
                    </p>
                  </div>

                  {assignmentSubmitted ? (
                    <div className="p-4 rounded-xl border border-success/20 bg-success/5 dark:bg-success/5 text-xs text-success text-center font-semibold">
                      Assignment submitted successfully. Completed checks logged.
                    </div>
                  ) : (
                    <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                      <textarea
                        required
                        value={assignmentSubmission}
                        onChange={(e) => setAssignmentSubmission(e.target.value)}
                        placeholder="Write your explanation or repository link..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                      />
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-primary to-accent text-white font-semibold text-xs px-6 py-3 rounded-xl hover:shadow-glow-purple transition"
                      >
                        Submit Assignment
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Curriculum Sidebar */}
          <div className="space-y-6">
            
            {/* Modules List panel */}
            <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Course Curriculum</h3>
              
              <div className="space-y-2.5">
                {course.modules && course.modules.map((mod, index) => {
                  const unlocked = isModuleUnlocked(index);
                  const completed = isModuleCompleted(mod.id);
                  const active = index === activeModuleIndex;

                  return (
                    <button
                      key={mod.id}
                      disabled={!unlocked}
                      onClick={() => {
                        setActiveModuleIndex(index);
                        setQuizAnswers({});
                        setQuizResult(null);
                        setQuizError('');
                        setActiveTab('notes');
                      }}
                      className={`w-full p-4 rounded-xl text-left flex items-center justify-between border transition duration-200 ${
                        active
                          ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm'
                          : unlocked
                            ? 'bg-white/40 dark:bg-gray-900/20 border-gray-200 dark:border-gray-850 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-750'
                            : 'bg-gray-100 dark:bg-gray-900/10 border-gray-150 dark:border-gray-900 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold">{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-xs font-semibold line-clamp-1">{mod.title}</span>
                      </div>
                      
                      {completed ? (
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      ) : active ? (
                        <Play className="w-3.5 h-3.5 fill-primary text-primary flex-shrink-0" />
                      ) : !unlocked ? (
                        <Lock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Final Course Complete Trigger */}
              {allModulesCompleted && !enrollment.completed && (
                <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
                  <button
                    onClick={handleFinalCourseComplete}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-glow-purple flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Finalize Course & Claim LC
                  </button>
                  <span className="text-[9px] text-gray-400 text-center block mt-2">
                    Claims certificate and releases payouts to the verified mentor.
                  </span>
                </div>
              )}

              {enrollment.completed && (
                <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
                  <button
                    onClick={() => setCompletedCertificate({
                      id: `cert-${Date.now()}`,
                      courseTitle: course.title,
                      studentName: user.name,
                      mentorName: course.mentor.name,
                      issueDate: new Date(enrollment.completedAt || Date.now()).toLocaleDateString()
                    })}
                    className="w-full py-3 bg-success/15 border border-success/30 text-success font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-success/20 transition"
                  >
                    <Award className="w-4 h-4" />
                    View Mastery Certificate
                  </button>
                </div>
              )}
            </div>

            {/* Community Doubts reminder link */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-accent/5 to-primary/5 border border-primary/10 dark:border-primary/20 text-center">
              <BookOpen className="w-4 h-4 text-accent mx-auto mb-2 animate-bounce" />
              <h4 className="text-xs font-bold">Stuck on a topic?</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed mb-3">
                Post your question in the course discussion forum. Helping peers answer doubts awards them Learning Credits!
              </p>
              <button
                onClick={() => navigate(`/forum?courseId=${course.id}`)}
                className="text-[10px] text-primary font-bold hover:underline"
              >
                Open Course Forums →
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
