import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Award, 
  Flame, 
  Cpu, 
  BookOpen, 
  Plus, 
  MessageSquare, 
  Trophy, 
  Play, 
  Compass, 
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [leaderboardPreview, setLeaderboardPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all courses to filter
        const coursesRes = await api.get('/courses');
        const allCourses = coursesRes.data;

        // Filter user enrolled courses
        if (user && user.enrolledCourses) {
          const inProgress = [];
          const completed = [];
          
          user.enrolledCourses.forEach(ec => {
            const courseDetails = allCourses.find(c => c.id === ec.courseId);
            if (courseDetails) {
              const fullCourseInfo = {
                ...courseDetails,
                ...ec, // merges progress data like currentModuleIndex, completedModules, completed
                progressPercent: courseDetails.modules.length > 0 
                  ? Math.round((ec.completedModules.length / courseDetails.modules.length) * 100)
                  : 0
              };
              if (ec.completed) {
                completed.push(fullCourseInfo);
              } else {
                inProgress.push(fullCourseInfo);
              }
            }
          });
          setInProgressCourses(inProgress);
          setCompletedCourses(completed);

          // Recommendations: courses user is not enrolled in
          const unenrolled = allCourses.filter(c => !user.enrolledCourses.some(ec => ec.courseId === c.id));
          setRecommendations(unenrolled.slice(0, 3));
        } else {
          setRecommendations(allCourses.slice(0, 3));
        }

        // Fetch leaderboard preview
        const leadRes = await api.get('/leaderboard');
        setLeaderboardPreview(leadRes.data.topLearners.slice(0, 3));
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-gray-900 dark:text-white transition-colors duration-300 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.name}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
              Monitor your learning pathways, balances, and credits in real time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-sm font-semibold px-4.5 py-2.5 rounded-xl shadow-sm transition"
            >
              <Compass className="w-4 h-4" />
              Explore Marketplace
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {[
            {
              title: "Learning Credits",
              value: `${user?.learningCredits} LC`,
              sub: "For course unlocks",
              icon: Award,
              color: "text-primary"
            },
            {
              title: "Knowledge Score",
              value: user?.knowledgeScore || 0,
              sub: "Earned from quizzes",
              icon: Cpu,
              color: "text-accent"
            },
            {
              title: "Contribution Score",
              value: user?.contributionScore || 0,
              sub: "Forum doubts resolved",
              icon: Sparkles,
              color: "text-success"
            },
            {
              title: "Learning Streak",
              value: `${user?.learningStreak || 1} Days`,
              sub: "Daily active multiplier",
              icon: Flame,
              color: "text-warning"
            }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.title}</span>
                  <div className={`p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-heading tracking-tight">{card.value}</h3>
                  <span className="text-[10px] font-medium text-gray-400 mt-1 block">{card.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Middle: Courses Section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* In Progress Courses */}
            <div>
              <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Active Pathways
              </h2>
              {inProgressCourses.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You don't have any active learning modules.</p>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/60 dark:hover:bg-gray-800 text-xs font-semibold px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 transition"
                  >
                    Unlock First Course
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {inProgressCourses.map((c) => (
                    <div 
                      key={c.id}
                      className="p-5 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-glow-indigo transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="inline-block px-2.5 py-0.5 rounded bg-primary/10 text-primary dark:text-primary-dark font-semibold text-[10px] mb-2 uppercase tracking-wide">
                            {c.category}
                          </div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{c.title}</h3>
                          <p className="text-xs text-gray-500 mt-1 font-medium">Mentor: {c.mentor.name}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/courses/${c.id}/player`)}
                          className="self-start sm:self-center flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          Resume Lesson
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-5">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mb-1.5">
                          <span>Progress: {c.completedModules.length} of {c.modules.length} modules</span>
                          <span>{c.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${c.progressPercent}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Pathways */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                  <Compass className="w-5 h-5 text-accent" />
                  Recommended for You
                </h2>
                <Link to="/marketplace" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  View all
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/courses/${c.id}`)}
                    className="p-5 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-glow-purple transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-primary dark:text-primary-dark uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                          {c.difficulty}
                        </span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {c.knowledgeValue} <span className="text-primary font-bold">LC</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{c.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/40 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                      <span>By {c.mentor.name}</span>
                      <span>★ {c.qualityScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-success" />
                  Mastered Subjects
                </h2>
                <div className="space-y-3">
                  {completedCourses.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => navigate(`/courses/${c.id}`)}
                      className="p-4 rounded-xl border border-success/20 bg-success/5 dark:bg-success/5 flex items-center justify-between cursor-pointer hover:shadow-sm transition"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{c.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Completed: {new Date(c.completedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] font-bold text-success uppercase border border-success/30 px-2.5 py-0.5 rounded">
                        Mastery Certificate Issued
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sidebar Actions & Leaderboard Preview */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Quick Dock</h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => navigate('/marketplace?create=true')}
                  className="flex items-center gap-3 w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-900/90 text-left transition border border-gray-100 dark:border-gray-800"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Publish Subject</div>
                    <div className="text-[9px] text-gray-400">Share knowledge, earn LC payouts</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/forum')}
                  className="flex items-center gap-3 w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-900/90 text-left transition border border-gray-100 dark:border-gray-800"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Post a Doubt</div>
                    <div className="text-[9px] text-gray-400">Get answers from verified mentors</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/leaderboard')}
                  className="flex items-center gap-3 w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/60 dark:hover:bg-gray-900/90 text-left transition border border-gray-100 dark:border-gray-800"
                >
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Leaderboards</div>
                    <div className="text-[9px] text-gray-400">Ranked by intellectual contribution</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Top Learners</h3>
                <Link to="/leaderboard" className="text-[10px] text-primary font-bold hover:underline">Full Board</Link>
              </div>
              <div className="space-y-3">
                {leaderboardPreview.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-800/40 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-400">{idx + 1}.</span>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-[9px] font-bold">
                        {item.name[0]}
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                    </div>
                    <span className="font-semibold text-primary">{item.score} KS</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Philosophy Reminder */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-primary/5 to-accent/5 border border-primary/10 dark:border-primary/20 text-center">
              <TrendingUp className="w-5 h-5 text-accent mx-auto mb-2" />
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Knowledge Cycle</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Spend credits to gain knowledge. Teach peers to gain credits. The circular economy is completely self-sustaining.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
