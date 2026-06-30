import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Award, 
  Cpu, 
  Sparkles, 
  Flame, 
  CheckCircle, 
  User, 
  BookOpen, 
  ShieldCheck, 
  Trophy, 
  Calendar,
  Layers,
  Star
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  
  const [createdCourses, setCreatedCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate GitHub contribution grid simulated data
  // 5 rows, 20 columns
  const [activityGrid, setActivityGrid] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const coursesRes = await api.get('/courses');
        const allCourses = coursesRes.data;

        if (user) {
          // Filter courses created by this user
          const created = allCourses.filter(c => c.mentor.id === user.id || user.createdCourses?.includes(c.id));
          setCreatedCourses(created);

          // Filter completed courses
          const completed = [];
          user.enrolledCourses?.forEach(ec => {
            if (ec.completed) {
              const matched = allCourses.find(c => c.id === ec.courseId);
              if (matched) completed.push(matched);
            }
          });
          setCompletedCourses(completed);

          // Build random learning activity values (0 to 4 intensity)
          const cells = [];
          for (let r = 0; r < 5; r++) {
            const row = [];
            for (let c = 0; c < 24; c++) {
              // Add a bit more density to make it look full
              const randVal = Math.floor(Math.random() * 5);
              row.push(randVal);
            }
            cells.push(row);
          }
          setActivityGrid(cells);
        }
      } catch (err) {
        console.error("Error fetching profile details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-lightBg dark:bg-darkBg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-550 dark:text-gray-400">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Calculate completion percentage
  const enrollmentCount = user?.enrolledCourses?.length || 0;
  const completedCount = completedCourses.length;
  const completionRate = enrollmentCount > 0 ? Math.round((completedCount / enrollmentCount) * 100) : 100;

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-gray-900 dark:text-white transition-colors duration-300 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Profile Card Header */}
        <div className="p-8 rounded-3xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-lg mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-glow-purple">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name[0]
              )}
            </div>
            <div className="text-center md:text-left space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">{user?.name}</h1>
                {createdCourses.length > 0 && (
                  <span className="flex items-center gap-0.5 bg-accent/10 border border-accent/20 px-2 py-0.5 rounded text-[9px] font-bold text-accent dark:text-accent-dark animate-pulse uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Mentor
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cognitive Network Member • Joined June 2026</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1.5">
                {user?.skills?.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800/50 rounded-md text-[10px] font-semibold text-gray-600 dark:text-gray-400 border border-gray-200/30 dark:border-gray-800/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick numbers */}
          <div className="grid grid-cols-3 gap-6 text-center border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 pt-6 md:pt-0 md:pl-10 relative z-10 w-full md:w-auto">
            <div>
              <div className="text-xl font-bold text-primary">{user?.learningCredits}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Learning Credits</div>
            </div>
            <div>
              <div className="text-xl font-bold text-accent">{user?.knowledgeScore}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Knowledge Score</div>
            </div>
            <div>
              <div className="text-xl font-bold text-success">{user?.contributionScore}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Contribution</div>
            </div>
          </div>
        </div>

        {/* Learning Activity Chart (GitHub grid style) */}
        <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm mb-10 overflow-x-auto">
          <div className="flex justify-between items-center mb-4 min-w-[500px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Knowledge Contributions (Weekly Grid)</h3>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
              <span>Less</span>
              <span className="w-2.5 h-2.5 bg-gray-100 dark:bg-gray-900 rounded-sm"></span>
              <span className="w-2.5 h-2.5 bg-primary/20 rounded-sm"></span>
              <span className="w-2.5 h-2.5 bg-primary/45 rounded-sm"></span>
              <span className="w-2.5 h-2.5 bg-primary/70 rounded-sm"></span>
              <span className="w-2.5 h-2.5 bg-primary rounded-sm"></span>
              <span>More</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-[500px] pb-2">
            {activityGrid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-1 justify-between">
                {row.map((val, cIdx) => {
                  let colorClass = 'bg-gray-100 dark:bg-gray-900/60';
                  if (val === 1) colorClass = 'bg-primary/20';
                  if (val === 2) colorClass = 'bg-primary/40';
                  if (val === 3) colorClass = 'bg-primary/70';
                  if (val === 4) colorClass = 'bg-primary';
                  return (
                    <div 
                      key={cIdx} 
                      className={`h-4.5 flex-grow rounded-sm transition hover:scale-110 ${colorClass}`}
                      title={`${val} learning events verified`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Metrics & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Achievements (Badges) */}
          <div className="lg:col-span-1 p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" /> Completed Achievements
            </h3>
            <div className="space-y-4">
              {user?.achievements?.map((ach, idx) => (
                <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-850">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary/10 to-accent/15 flex items-center justify-center text-accent">
                    <Award className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-850 dark:text-gray-200">{ach.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courses Completed */}
          <div className="lg:col-span-1 p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" /> Mastered Subjects
            </h3>
            <div className="space-y-3">
              {completedCourses.length === 0 ? (
                <p className="text-xs text-gray-500 font-medium italic">No courses completed yet.</p>
              ) : (
                completedCourses.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900/20 text-xs">
                    <h4 className="font-bold text-gray-850 dark:text-gray-200">{c.title}</h4>
                    <div className="flex justify-between items-center text-[9px] text-gray-400 mt-2 font-semibold">
                      <span>★ {c.qualityScore} Rating</span>
                      <span className="text-success uppercase">Endorsed</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Courses Created (Mentor Mode) */}
          <div className="lg:col-span-1 p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Educational Contributions
            </h3>
            <div className="space-y-3">
              {createdCourses.length === 0 ? (
                <p className="text-xs text-gray-500 font-medium italic">You haven't published any courses yet.</p>
              ) : (
                createdCourses.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900/20 text-xs">
                    <h4 className="font-bold text-gray-850 dark:text-gray-200">{c.title}</h4>
                    <div className="flex justify-between items-center text-[9px] text-gray-400 mt-2 font-semibold">
                      <span>{c.knowledgeValue} LC Value</span>
                      <span className="text-primary font-bold">{c.difficulty}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
