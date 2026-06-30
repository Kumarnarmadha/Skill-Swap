import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  X, 
  ArrowLeft, 
  CornerDownRight, 
  ThumbsUp, 
  Award, 
  CheckCircle,
  HelpCircle,
  Cpu,
  User
} from 'lucide-react';

export default function Forum() {
  const { user, refreshUserProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get('courseId');

  const [discussions, setDiscussions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected discussion view
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [answerBody, setAnswerBody] = useState('');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Ask Question Modal
  const [showAskModal, setShowAskModal] = useState(false);
  const [askCourseId, setAskCourseId] = useState('');
  const [askTitle, setAskTitle] = useState('');
  const [askBody, setAskBody] = useState('');
  const [askError, setAskError] = useState('');
  const [askSuccess, setAskSuccess] = useState(false);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/forum', {
        params: { courseId: courseIdParam || undefined }
      });
      setDiscussions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
      if (res.data.length > 0) {
        setAskCourseId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDiscussions();
    fetchCourses();
  }, [courseIdParam]);

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    setAskError('');

    if (!askTitle.trim() || !askBody.trim() || !askCourseId) {
      setAskError('Please fill in all fields.');
      return;
    }

    try {
      const res = await api.post('/forum', {
        courseId: askCourseId,
        title: askTitle,
        body: askBody
      });
      setAskSuccess(true);
      setTimeout(() => {
        setAskSuccess(false);
        setShowAskModal(false);
        setAskTitle('');
        setAskBody('');
        fetchDiscussions();
      }, 1000);
    } catch (err) {
      setAskError('Could not post discussion. Verify server status.');
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerBody.trim()) return;

    try {
      const res = await api.post(`/forum/${selectedDiscussion.id}/answers`, {
        body: answerBody
      });
      // Update local view
      setSelectedDiscussion(res.data);
      setAnswerBody('');
      // Sync list
      fetchDiscussions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkHelpful = async (answerId) => {
    try {
      const res = await api.post(`/forum/${selectedDiscussion.id}/answers/${answerId}/helpful`);
      setSelectedDiscussion(res.data.discussion);
      fetchDiscussions();
      refreshUserProfile(); // sync credit balance updates
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark helpful.');
    }
  };

  // Filter list by search term
  const filteredDiscussions = discussions.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-gray-900 dark:text-white transition-colors duration-300 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Main Header / View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold font-heading tracking-tight flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              Community Forum
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Solve doubts. Earn +5 Learning Credits for helpful answers validated by the community.
            </p>
          </div>
          {!selectedDiscussion && (
            <button
              onClick={() => setShowAskModal(true)}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-sm transition"
            >
              <Plus className="w-4.5 h-4.5" />
              Ask a Doubt
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!selectedDiscussion ? (
            /* LIST THREADS VIEW */
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search discussion index..."
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 rounded-xl text-sm focus:outline-none focus:border-primary transition"
                />
              </div>

              {/* Discussions List */}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-850 h-24 rounded-xl"></div>
                  ))}
                </div>
              ) : filteredDiscussions.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl">
                  <HelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No discussions posted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDiscussions.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDiscussion(d)}
                      className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-sm hover:shadow-glow-indigo cursor-pointer transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-[8px] font-bold">
                              {d.author.name[0]}
                            </div>
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{d.author.name}</span>
                            <span className="text-[9px] font-bold text-gray-400 border border-gray-200 dark:border-gray-800 px-1.5 py-0.5 rounded uppercase">
                              {d.author.rank}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">{d.title}</h3>
                          <p className="text-xs text-gray-500 mt-2 line-clamp-1 leading-relaxed">{d.body}</p>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-primary/10 dark:bg-primary/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{d.answers ? d.answers.length : 0}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/40 flex justify-between items-center text-[10px] text-gray-400">
                        <span>Created {new Date(d.createdAt).toLocaleDateString()}</span>
                        <span className="text-accent font-bold">Category Forum</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* EXPANDED THREAD VIEW */
            <motion.div
              key="detail-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <button
                onClick={() => setSelectedDiscussion(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to doubt logs
              </button>

              {/* Main question block */}
              <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-[9px] font-bold">
                    {selectedDiscussion.author.name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{selectedDiscussion.author.name}</div>
                    <span className="text-[8px] font-bold text-gray-400 border border-gray-250 dark:border-gray-850 px-1 py-0.5 rounded">
                      {selectedDiscussion.author.rank}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedDiscussion.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4 leading-relaxed font-normal">{selectedDiscussion.body}</p>
              </div>

              {/* Answers list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <CornerDownRight className="w-4 h-4 text-primary" />
                  Solutions ({selectedDiscussion.answers ? selectedDiscussion.answers.length : 0})
                </h4>

                {selectedDiscussion.answers && selectedDiscussion.answers.map((ans) => (
                  <div 
                    key={ans.id}
                    className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                      ans.rewarded 
                        ? 'border-success/20 bg-success/5 dark:bg-success/5' 
                        : 'border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-900/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-[8px] font-bold">
                          {ans.author.name[0]}
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{ans.author.name}</span>
                        <span className="text-[8px] font-bold text-gray-400 border border-gray-250 dark:border-gray-850 px-1 py-0.5 rounded">
                          {ans.author.rank}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ans.body}</p>
                    </div>

                    {/* Help rewards triggers */}
                    <div className="self-end sm:self-start flex flex-col items-center gap-2">
                      {ans.rewarded ? (
                        <span className="text-[10px] font-bold text-success flex items-center gap-1 bg-success/15 border border-success/30 px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
                          <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
                          Validated (+5 LC Payout)
                        </span>
                      ) : (
                        user && user.name === selectedDiscussion.author.name && (
                          <button
                            onClick={() => handleMarkHelpful(ans.id)}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-sm"
                          >
                            <Award className="w-3.5 h-3.5 animate-bounce" />
                            Mark Helpful (+5 LC)
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Reply input */}
              <div className="p-6 rounded-2xl glass-panel-light dark:glass-panel-dark border border-gray-200/50 dark:border-gray-800/50 shadow-md">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-450 mb-3">Submit your explanation</h4>
                <form onSubmit={handlePostAnswer} className="space-y-4">
                  <textarea
                    required
                    value={answerBody}
                    onChange={(e) => setAnswerBody(e.target.value)}
                    placeholder="Provide a detailed architectural breakdown to resolve this doubt..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-primary to-accent text-white font-semibold text-xs px-6 py-3 rounded-xl hover:shadow-glow-purple shadow-sm transition"
                  >
                    Post Answer
                  </button>
                </form>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ASK DOUBT MODAL */}
      <AnimatePresence>
        {showAskModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-lightCard dark:bg-darkCard border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/40">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span className="font-bold text-gray-900 dark:text-white">Ask a Community Doubt</span>
                </div>
                <button onClick={() => setShowAskModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handlePostQuestion} className="p-6 space-y-5">
                {askSuccess && (
                  <div className="p-3.5 bg-success/10 border border-success/20 text-success text-xs font-semibold rounded-xl text-center">
                    Question posted successfully! Reloading forum index...
                  </div>
                )}

                {askError && (
                  <div className="p-3.5 bg-error/10 border border-error/20 text-error text-xs font-semibold rounded-xl text-center">
                    {askError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-405 mb-1.5">Related Subject</label>
                  <select
                    value={askCourseId}
                    onChange={(e) => setAskCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-405 mb-1.5">Question Title</label>
                  <input
                    type="text"
                    value={askTitle}
                    onChange={(e) => setAskTitle(e.target.value)}
                    placeholder="Summarize your blocker (e.g. Raft election timeouts configuration)"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-405 mb-1.5">Explain your doubt</label>
                  <textarea
                    value={askBody}
                    onChange={(e) => setAskBody(e.target.value)}
                    placeholder="Provide context, log scripts, or architecture flow configurations..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-xl text-xs focus:outline-none focus:border-primary transition"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    Post Question
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
