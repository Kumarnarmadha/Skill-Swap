import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Award, 
  ArrowLeft, 
  Clock, 
  Cpu, 
  Star, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  User, 
  Play,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, unlockCourse } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        setError('Failed to retrieve course details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleUnlock = async () => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    
    setError('');
    setSuccessMsg('');
    setUnlocking(true);

    const res = await unlockCourse(id);
    if (res.success) {
      setSuccessMsg('Pathway successfully unlocked! Launching lesson player...');
      setTimeout(() => {
        navigate(`/courses/${id}/player`);
      }, 1500);
    } else {
      setError(res.error);
    }
    setUnlocking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Querying Knowledge Block...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center p-4">
        <div className="p-8 rounded-2xl glass-panel-light dark:glass-panel-dark text-center max-w-md">
          <p className="text-sm text-error font-semibold mb-4">{error}</p>
          <button onClick={() => navigate('/marketplace')} className="text-xs text-primary font-bold hover:underline">Return to Marketplace</button>
        </div>
      </div>
    );
  }

  // Check enrollment status
  const enrollment = user?.enrolledCourses?.find(ec => ec.courseId === course.id);
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.completed;

  const canAfford = user ? user.learningCredits >= course.knowledgeValue : true;

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-gray-900 dark:text-white transition-colors duration-300 pb-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap gap-2.5 mb-4">
                <span className="text-[9px] font-bold text-primary dark:text-primary-dark uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                  {course.category}
                </span>
                <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {course.difficulty}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight leading-tight">{course.title}</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-4 leading-relaxed font-normal">{course.description}</p>
            </div>

            {/* Learning Outcomes */}
            <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50">
              <h2 className="text-base font-bold font-heading mb-4 text-gray-900 dark:text-white">Learning Outcomes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {course.outcomes && course.outcomes.map((o, index) => (
                  <div key={index} className="flex gap-2.5 text-xs text-gray-600 dark:text-gray-400 align-top">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{o}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modules List */}
            <div>
              <h2 className="text-lg font-bold font-heading mb-4">Course Structure</h2>
              <div className="space-y-3">
                {course.modules && course.modules.map((mod, index) => (
                  <div 
                    key={mod.id}
                    className="p-5 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-white/40 dark:bg-gray-900/20 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-gray-400 font-bold">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h4 className="text-xs font-bold text-gray-850 dark:text-gray-200 leading-snug">{mod.title}</h4>
                        <span className="text-[10px] text-gray-400 mt-1 block">Module end quiz included</span>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <span className="text-[10px] text-success font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 bg-gray-100 dark:bg-gray-800/60 px-2.5 py-1 rounded-lg">
                        <Lock className="w-3 h-3 text-gray-500" />
                        Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-bold font-heading mb-4">Learner Feedback</h2>
              <div className="space-y-4">
                {course.reviews && course.reviews.length === 0 ? (
                  <p className="text-xs text-gray-500 font-medium italic">No reviews published yet for this module.</p>
                ) : (
                  course.reviews && course.reviews.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-150 dark:border-gray-800/40 bg-gray-50/20 dark:bg-darkCard/10 text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{r.studentName}</span>
                        <span className="flex items-center gap-0.5 text-warning">★ {r.rating}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 italic">"{r.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Transaction Sidebar Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-lg relative overflow-hidden">
              
              {/* Header tags */}
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mb-6">
                <span className="uppercase tracking-wider">Subject Value</span>
                <span className="flex items-center gap-1 text-primary">
                  <Cpu className="w-3.5 h-3.5" />
                  SkillScore: {course.skillScore}
                </span>
              </div>

              {/* Price Details */}
              <div className="text-center mb-6">
                <div className="text-4xl font-extrabold font-heading text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent inline-block">
                  {course.knowledgeValue} <span className="text-lg font-bold">LC</span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium mt-1">Closed-Loop Value Payout</div>
              </div>

              {/* Error messages */}
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 text-error rounded-xl text-[10px] font-semibold mb-4 text-center">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-success/10 border border-success/20 text-success rounded-xl text-[10px] font-semibold mb-4 text-center">
                  {successMsg}
                </div>
              )}

              {/* CTA Action button */}
              <div className="space-y-3.5">
                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/courses/${course.id}/player`)}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-glow-purple flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    {isCompleted ? 'View Course Mastery' : 'Resume Learning'}
                  </button>
                ) : (
                  <button
                    onClick={handleUnlock}
                    disabled={unlocking || !canAfford}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-glow-purple disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {unlocking ? 'Processing Unlock...' : `Unlock Course (${course.knowledgeValue} LC)`}
                  </button>
                )}

                {/* Balance validation alert */}
                {!isEnrolled && !canAfford && (
                  <div className="p-3.5 bg-warning/10 border border-warning/20 text-warning text-[10px] font-semibold rounded-xl leading-relaxed text-center">
                    Unlock blocked. You need {course.knowledgeValue - user.learningCredits} more LC. Solve doubts on the community forums or pass quizzes in other modules to earn help credits.
                  </div>
                )}
              </div>

              {/* Course Meta Grid */}
              <div className="border-t border-gray-200 dark:border-gray-800/60 mt-6 pt-6 space-y-3.5 text-xs text-gray-500 font-medium">
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="text-gray-800 dark:text-gray-300 font-semibold">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality rating</span>
                  <span className="text-gray-800 dark:text-gray-300 font-semibold flex items-center gap-0.5">
                    ★ {course.qualityScore}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate</span>
                  <span className="text-gray-800 dark:text-gray-300 font-semibold">{course.completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Mentor Info */}
            <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450 mb-4">Verified Educator</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-extrabold overflow-hidden">
                  {course.mentor.avatar ? (
                    <img src={course.mentor.avatar} alt={course.mentor.name} className="w-full h-full object-cover" />
                  ) : (
                    course.mentor.name[0]
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    {course.mentor.name}
                    {course.mentor.verified && <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />}
                  </h4>
                  <span className="text-[10px] text-gray-500 leading-none">Pedagogy Rating: {course.mentor.qualityScore || 9.8}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{course.mentor.bio}</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
