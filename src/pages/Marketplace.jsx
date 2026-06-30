import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Award, 
  Star, 
  Cpu, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  BookOpen, 
  X, 
  Check, 
  Percent,
  Clock
} from 'lucide-react';

export default function Marketplace() {
  const { user, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const showCreateModal = searchParams.get('create') === 'true';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortOption, setSortOption] = useState('SkillScore');

  // Create Course form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Engineering');
  const [newDifficulty, setNewDifficulty] = useState('Beginner');
  const [newDuration, setNewDuration] = useState('3 hours');
  const [newSkills, setNewSkills] = useState('');
  const [newOutcomes, setNewOutcomes] = useState('');
  
  // Custom Modules fields
  const [m1Title, setM1Title] = useState('');
  const [m1Notes, setM1Notes] = useState('');
  const [m1Q, setM1Q] = useState('');
  const [m1O1, setM1O1] = useState('');
  const [m1O2, setM1O2] = useState('');
  const [m1Correct, setM1Correct] = useState(1);

  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  const categories = ['All', 'Engineering', 'Economy', 'Design'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Load Marketplace
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses', {
        params: {
          search: searchTerm,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          sort: sortOption
        }
      });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedCategory, selectedDifficulty, sortOption]);

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!newTitle || !newDesc || !m1Title || !m1Notes || !m1Q || !m1O1 || !m1O2) {
      setCreateError('Please fill in all course fields including at least 1 full module with quiz.');
      return;
    }

    const payload = {
      title: newTitle,
      description: newDesc,
      category: newCategory,
      difficulty: newDifficulty,
      duration: newDuration,
      skills: newSkills.split(',').map(s => s.trim()).filter(Boolean),
      outcomes: newOutcomes.split(',').map(s => s.trim()).filter(Boolean),
      modules: [
        {
          id: `m-user-${Date.now()}-1`,
          title: m1Title,
          notes: m1Notes,
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          quiz: {
            questions: [
              {
                id: `q-user-${Date.now()}-1`,
                question: m1Q,
                options: [m1O1, m1O2],
                correctAnswer: parseInt(m1Correct)
              }
            ]
          }
        }
      ]
    };

    try {
      await api.post('/courses/create', payload);
      setCreateSuccess(true);
      refreshUserProfile(); // sync user createdCourses list
      setTimeout(() => {
        setCreateSuccess(false);
        closeModal();
        fetchCourses();
        // Reset form
        setNewTitle('');
        setNewDesc('');
        setM1Title('');
        setM1Notes('');
        setM1Q('');
        setM1O1('');
        setM1O2('');
      }, 1500);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create course. Ensure server is active.');
    }
  };

  const closeModal = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-gray-900 dark:text-white transition-colors duration-300 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold font-heading tracking-tight">Course Marketplace</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Unlock foundational or complex knowledge using your Learning Credits.</p>
          </div>
          <button
            onClick={() => setSearchParams({ create: 'true' })}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Publish Subject
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pathways (e.g. Architectures, UX Psychology...)"
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-xl text-sm focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Sort selection */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-xl text-sm focus:outline-none focus:border-primary transition appearance-none cursor-pointer"
            >
              <option value="SkillScore">Rank by SkillScore</option>
              <option value="Best Rated">Rank by Rating</option>
              <option value="Most Valuable">Rank by Credit Value</option>
              <option value="Highest Completion">Rank by Completion</option>
            </select>
          </div>

          {/* Difficulty selection */}
          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-xl text-sm focus:outline-none focus:border-primary transition appearance-none cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              {difficulties.slice(1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2.5 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                selectedCategory === cat
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              {cat === 'All' ? 'All Modules' : cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 h-64 rounded-2xl"></div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No courses found matching filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => {
              const userEnrolled = user?.enrolledCourses?.some(ec => ec.courseId === course.id);
              return (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-glow-indigo transition-all duration-300"
                >
                  {/* Card Thumbnail / Header */}
                  <div className="relative h-36 bg-gradient-to-br from-primary/10 to-accent/20 p-5 flex flex-col justify-between border-b border-gray-200/40 dark:border-gray-800/40">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-primary dark:text-primary-dark uppercase tracking-wider bg-white/70 dark:bg-gray-900/60 px-2 py-0.5 rounded">
                        {course.category}
                      </span>
                      <div className="flex items-center gap-1 bg-white/70 dark:bg-gray-900/60 px-2 py-0.5 rounded text-[9px] font-semibold">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {course.duration}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1 text-gray-900 dark:text-white font-mono font-bold text-lg">
                        {course.knowledgeValue} <span className="text-primary text-xs">LC</span>
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-none">Knowledge Value</div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-grow">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mb-2">
                      <span className="uppercase tracking-wide">{course.difficulty}</span>
                      <div className="flex items-center gap-1 text-primary">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>SkillScore: {course.skillScore}</span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 leading-snug">{course.title}</h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{course.description}</p>
                  </div>

                  {/* Footer details */}
                  <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800/40 bg-gray-50/20 dark:bg-darkCard/10 flex items-center justify-between text-[10px] font-semibold text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-[8px] font-bold">
                        {course.mentor.name[0]}
                      </div>
                      <span className="line-clamp-1">{course.mentor.name}</span>
                      {course.mentor.verified && <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-warning text-warning" /> {course.qualityScore}</span>
                      <span className="flex items-center gap-0.5"><Percent className="w-3 h-3 text-success" /> {course.completionRate}%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* CREATE COURSE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-lightCard dark:bg-darkCard border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/40">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <span className="font-bold text-gray-900 dark:text-white">Publish Course (Become a Mentor)</span>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateCourseSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                
                {createSuccess && (
                  <div className="p-3.5 bg-success/10 border border-success/20 text-success text-xs font-semibold rounded-xl text-center">
                    Course published successfully! Returning to marketplace...
                  </div>
                )}

                {createError && (
                  <div className="p-3.5 bg-error/10 border border-error/20 text-error text-xs font-semibold rounded-xl text-center">
                    {createError}
                  </div>
                )}

                {/* Grid Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Course Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Distributed Consensus Algorithms"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Overview Description</label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Summarize the course core topics and goals..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Domain Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Economy">Economy</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Difficulty Level</label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                    >
                      <option value="Beginner">Beginner (Cost: 15 LC)</option>
                      <option value="Intermediate">Intermediate (Cost: 28 LC)</option>
                      <option value="Advanced">Advanced (Cost: 45 LC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Duration</label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="e.g. 3 hours"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Skills Tagging (comma separated)</label>
                    <input
                      type="text"
                      value={newSkills}
                      onChange={(e) => setNewSkills(e.target.value)}
                      placeholder="Raft, Consensus, Go"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                {/* Modules Entry */}
                <div className="border-t border-gray-200 dark:border-gray-850 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-primary tracking-wide">Configure Initial Module & Quiz Checks</h4>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Module 1 Title</label>
                    <input
                      type="text"
                      value={m1Title}
                      onChange={(e) => setM1Title(e.target.value)}
                      placeholder="e.g. Consensus Foundations"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Module 1 Study Notes</label>
                    <textarea
                      value={m1Notes}
                      onChange={(e) => setM1Notes(e.target.value)}
                      placeholder="Describe notes students should read before taking quiz..."
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  {/* Quiz builder */}
                  <div className="bg-gray-55/30 dark:bg-gray-900/30 p-4 rounded-xl space-y-3 border border-gray-100 dark:border-gray-800">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-450">Module Quiz Question</label>
                    <input
                      type="text"
                      value={m1Q}
                      onChange={(e) => setM1Q(e.target.value)}
                      placeholder="e.g. Which node replicates log logs in Raft?"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-lg text-xs focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={m1O1}
                        onChange={(e) => setM1O1(e.target.value)}
                        placeholder="Option 1"
                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={m1O2}
                        onChange={(e) => setM1O2(e.target.value)}
                        placeholder="Option 2"
                        className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-lg text-xs"
                      />
                    </div>
                    <select
                      value={m1Correct}
                      onChange={(e) => setM1Correct(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-lg text-xs"
                    >
                      <option value={1}>Option 1 is correct</option>
                      <option value={2}>Option 2 is correct</option>
                    </select>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    Publish Course
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
