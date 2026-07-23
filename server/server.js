const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

// Load environment variables from the server folder's .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'skillswap-super-secret-key-for-mvp';

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// MIDDLEWARE: Authentication
// ==========================================
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Access Denied. No token provided.' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied. Invalid token format.' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
}

// ==========================================
// AUTH ENDPOINTS
// ==========================================

// Register User (and seed starter LC)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all fields' });
  }

  const existingUser = db.findOne('users', { email });
  if (existingUser) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // New User initialization with 50 Starter Learning Credits
  const newUser = db.create('users', {
    name,
    email,
    password: hashedPassword,
    learningCredits: 50, // Starter credits
    knowledgeScore: 10,  // Base starting score
    contributionScore: 0,
    learningStreak: 1,
    skills: ["General Learning"],
    achievements: [
      { id: "ach-onboarding", title: "Genesis Learner", description: "Completed onboarding and received 50 starter LC", icon: "Award" }
    ],
    enrolledCourses: [], // { courseId, currentModuleIndex, completedModules: [], quizScores: {}, completed: false }
    createdCourses: [],
    settings: {
      darkMode: true,
      notifications: true,
      privacy: 'public'
    }
  });

  // Create welcome notification
  db.create('notifications', {
    userId: newUser.id,
    title: "Welcome to SkillSwap!",
    message: "You have received 50 Starter Learning Credits (LC). Spend them to unlock your first course!",
    type: "credit",
    read: false
  });

  // Generate Token
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

  // Exclude password from response
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ token, user: userWithoutPassword });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  const user = db.findOne('users', { email });
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// Forgot Password (mock)
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.findOne('users', { email });
  if (!user) return res.status(404).json({ error: 'No account associated with this email.' });
  res.json({ message: 'Reset instruction sent to your registered email.' });
});

// Get Current User Info
app.get('/api/auth/me', verifyToken, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// ==========================================
// COURSE MARKETPLACE ENDPOINTS
// ==========================================

// Helper to compute SkillScore dynamically
function calculateSkillScore(course) {
  const completionRate = course.completionRate || 50;
  const qualityScore = course.qualityScore || 5.0;
  const mentorVerified = course.mentor && course.mentor.verified ? 20 : 0;
  const reviewsCount = course.reviews ? course.reviews.length : 0;
  
  // Custom algorithm based on project vision
  // Max score: 100
  const score = (completionRate * 0.35) + (qualityScore * 4 * 0.25) + mentorVerified + Math.min(reviewsCount * 2, 10) + 15;
  return parseFloat(Math.min(score, 100).toFixed(1));
}

// Get all courses (with filters and sorting)
app.get('/api/courses', (req, res) => {
  let courses = db.find('courses');
  
  // Calculate SkillScore dynamically for ranking
  courses = courses.map(c => ({
    ...c,
    skillScore: calculateSkillScore(c)
  }));

  // Simple search filter
  const { search, category, difficulty, sort } = req.query;
  
  if (search) {
    const q = search.toLowerCase();
    courses = courses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }

  if (category && category !== 'All') {
    courses = courses.filter(c => c.category === category);
  }

  if (difficulty && difficulty !== 'All') {
    courses = courses.filter(c => c.difficulty === difficulty);
  }

  // Sort logic
  if (sort === 'SkillScore') {
    courses.sort((a, b) => b.skillScore - a.skillScore);
  } else if (sort === 'Most Valuable') {
    courses.sort((a, b) => b.knowledgeValue - a.knowledgeValue);
  } else if (sort === 'Highest Completion') {
    courses.sort((a, b) => b.completionRate - a.completionRate);
  } else {
    // Default: Best Rated / Quality Score
    courses.sort((a, b) => b.qualityScore - a.qualityScore);
  }

  res.json(courses);
});

// Create new course (Mentor mode)
app.post('/api/courses/create', verifyToken, (req, res) => {
  const { title, description, category, difficulty, modules, skills, outcomes, duration } = req.body;
  const user = db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Calculate knowledge value based on platform constraints
  let knowledgeValue = 15;
  if (difficulty === 'Intermediate') knowledgeValue = 28;
  if (difficulty === 'Advanced') knowledgeValue = 45;

  const newCourse = db.create('courses', {
    title,
    description,
    category,
    difficulty,
    duration: duration || '3 hours',
    knowledgeValue,
    completionRate: 100, // starting rate
    qualityScore: 10.0, // initial rating
    skills: skills || [],
    outcomes: outcomes || [],
    modules: modules || [],
    reviews: [],
    mentor: {
      id: user.id,
      name: user.name,
      bio: `Verified educator in ${category}.`,
      expertise: skills || [category],
      students: 0,
      completionRate: 100,
      qualityScore: 10.0,
      knowledgeScore: user.knowledgeScore,
      verified: true,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    }
  });

  // Track created courses on user model
  const createdCourses = user.createdCourses || [];
  createdCourses.push(newCourse.id);
  db.findByIdAndUpdate('users', user.id, { createdCourses });

  res.status(201).json(newCourse);
});

// Get single course details
app.get('/api/courses/:id', (req, res) => {
  const course = db.findById('courses', req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  
  // Dynamic SkillScore
  course.skillScore = calculateSkillScore(course);
  res.json(course);
});

// Unlock/Enroll in Course
app.post('/api/courses/:id/unlock', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const user = db.findById('users', req.user.id);
  const course = db.findById('courses', courseId);

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!course) return res.status(404).json({ error: 'Course not found' });

  // Verify if already enrolled
  const isEnrolled = user.enrolledCourses.some(ec => ec.courseId === courseId);
  if (isEnrolled) {
    return res.status(400).json({ error: 'You are already enrolled in this course.' });
  }

  // Verify credit balance
  const cost = course.knowledgeValue;
  if (user.learningCredits < cost) {
    return res.status(400).json({ error: `Insufficient Learning Credits. Course costs ${cost} LC, you have ${user.learningCredits} LC.` });
  }

  // Deduct credits
  const updatedCredits = user.learningCredits - cost;
  
  // Enroll user (starts at Module index 0, with empty progress)
  const enrolledCourses = [...user.enrolledCourses, {
    courseId,
    currentModuleIndex: 0,
    completedModules: [],
    quizScores: {},
    completed: false,
    unlockedAt: new Date().toISOString()
  }];

  const updatedUser = db.findByIdAndUpdate('users', user.id, {
    learningCredits: updatedCredits,
    enrolledCourses
  });

  // Create notifications
  db.create('notifications', {
    userId: user.id,
    title: "Course Unlocked",
    message: `You spent ${cost} LC to unlock "${course.title}". Start learning now!`,
    type: "credit",
    read: false
  });

  // Increment mentor students metric
  if (course.mentor && course.mentor.id) {
    const mentorUser = db.findById('users', course.mentor.id);
    if (mentorUser) {
      db.create('notifications', {
        userId: mentorUser.id,
        title: "New Learner Enrolled",
        message: `${user.name} has unlocked your course "${course.title}". Earning Credits are held until completion!`,
        type: "mentor",
        read: false
      });
    }
  }

  const { password: _, ...userWithoutPassword } = updatedUser;
  res.json({ user: userWithoutPassword, message: "Course unlocked successfully." });
});

// Submit Quiz for a module
app.post('/api/courses/:id/modules/:moduleId/quiz', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const moduleId = req.params.moduleId;
  const { answers } = req.body; // Array of option indexes e.g., [1, 2]

  const user = db.findById('users', req.user.id);
  const course = db.findById('courses', courseId);

  if (!user || !course) return res.status(404).json({ error: 'User or Course not found' });

  const enrollment = user.enrolledCourses.find(ec => ec.courseId === courseId);
  if (!enrollment) return res.status(400).json({ error: 'You are not enrolled in this course.' });

  // Locate the module
  const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
  if (moduleIndex === -1) return res.status(404).json({ error: 'Module not found' });
  
  const targetModule = course.modules[moduleIndex];
  const quiz = targetModule.quiz;

  if (!quiz || !quiz.questions) {
    return res.status(400).json({ error: 'No quiz for this module' });
  }

  // Score validation
  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (answers[idx] === q.correctAnswer) {
      correctCount++;
    }
  });

  const totalQuestions = quiz.questions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= 80; // 80% to pass

  if (passed) {
    // Mark module as completed on enrollment if not already
    const completedModules = enrollment.completedModules || [];
    let rewardsEarned = 0;
    if (!completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
      enrollment.completedModules = completedModules;
      
      // Award student Learning Credit bonus for passing quiz & finishing module
      rewardsEarned = 3; // +3 LC
      user.learningCredits += rewardsEarned;
      user.knowledgeScore += 5; // +5 Knowledge points

      // Add to achievements if they hit high score
      if (user.knowledgeScore >= 50 && !user.achievements.some(a => a.id === 'ach-50-ks')) {
        user.achievements.push({ id: 'ach-50-ks', title: 'Knowledge Explorer', description: 'Reached 50 Knowledge Score', icon: 'Sparkles' });
      }

      // Unlock next module
      if (moduleIndex + 1 < course.modules.length) {
        enrollment.currentModuleIndex = moduleIndex + 1;
      }
    }

    enrollment.quizScores = {
      ...enrollment.quizScores,
      [moduleId]: scorePercent
    };

    // Update user DB record
    const updatedUser = db.findByIdAndUpdate('users', user.id, {
      enrolledCourses: user.enrolledCourses,
      learningCredits: user.learningCredits,
      knowledgeScore: user.knowledgeScore,
      achievements: user.achievements
    });

    if (rewardsEarned > 0) {
      db.create('notifications', {
        userId: user.id,
        title: "Learning Credits Earned!",
        message: `You earned +${rewardsEarned} LC for passing the "${targetModule.title}" quiz!`,
        type: "credit",
        read: false
      });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.json({
      passed: true,
      score: scorePercent,
      correctCount,
      totalQuestions,
      user: userWithoutPassword,
      message: 'Congratulations! You passed and unlocked the next module.'
    });
  } else {
    return res.json({
      passed: false,
      score: scorePercent,
      correctCount,
      totalQuestions,
      message: 'Failed to meet 80% passing mark. Please review the notes and try again!'
    });
  }
});

// Finalize/Complete Course (students receive completion bonus, mentor receives release of credits)
app.post('/api/courses/:id/complete', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const user = db.findById('users', req.user.id);
  const course = db.findById('courses', courseId);

  if (!user || !course) return res.status(404).json({ error: 'User or Course not found' });

  const enrollment = user.enrolledCourses.find(ec => ec.courseId === courseId);
  if (!enrollment) return res.status(400).json({ error: 'You are not enrolled in this course.' });

  // Ensure all modules are completed
  const allModulesCompleted = course.modules.every(m => enrollment.completedModules.includes(m.id));
  if (!allModulesCompleted) {
    return res.status(400).json({ error: 'Please complete all module quizzes before finalizing the course.' });
  }

  if (enrollment.completed) {
    return res.status(400).json({ error: 'Course already completed' });
  }

  // Mark Completed
  enrollment.completed = true;
  enrollment.completedAt = new Date().toISOString();

  // Student completion bonus
  const studentBonus = 10; // +10 LC
  user.learningCredits += studentBonus;
  user.knowledgeScore += 25; // +25 Knowledge Score boost
  
  // Award Completed achievement if first course
  const completedCount = user.enrolledCourses.filter(ec => ec.completed).length;
  if (completedCount === 1) {
    user.achievements.push({
      id: "ach-first-complete",
      title: "Paradigm Shift",
      description: "Successfully completed your first full knowledge course",
      icon: "Award"
    });
  }

  // Update Student
  db.findByIdAndUpdate('users', user.id, {
    enrolledCourses: user.enrolledCourses,
    learningCredits: user.learningCredits,
    knowledgeScore: user.knowledgeScore,
    achievements: user.achievements
  });

  db.create('notifications', {
    userId: user.id,
    title: "Course Mastered!",
    message: `Mastery certificate unlocked for "${course.title}". Eearned +10 LC completion reward.`,
    type: "credit",
    read: false
  });

  // MENTOR REWARD SYSTEM:
  // Transfer knowledge credits to the course mentor balance only on learner completion!
  const mentorId = course.mentor.id;
  const cost = course.knowledgeValue;
  
  if (mentorId) {
    const mentorUser = db.findById('users', mentorId);
    if (mentorUser) {
      // Award mentor 85% of the course cost as payout credits
      const mentorEarnings = Math.round(cost * 0.85);
      mentorUser.learningCredits += mentorEarnings;
      mentorUser.contributionScore += 20; // boost contribution rating

      db.findByIdAndUpdate('users', mentorId, {
        learningCredits: mentorUser.learningCredits,
        contributionScore: mentorUser.contributionScore
      });

      db.create('notifications', {
        userId: mentorId,
        title: "Delayed Credits Released",
        message: `${user.name} completed "${course.title}". Received +${mentorEarnings} LC educational payout.`,
        type: "mentor",
        read: false
      });
    }
  }

  const updatedUser = db.findById('users', user.id);
  const { password: _, ...userWithoutPassword } = updatedUser;

  // Mock certificate structure
  const certificate = {
    id: `cert-${Date.now()}`,
    courseTitle: course.title,
    studentName: user.name,
    mentorName: course.mentor.name,
    issueDate: new Date().toLocaleDateString()
  };

  res.json({
    user: userWithoutPassword,
    certificate,
    message: "Congratulations on mastering this subject!"
  });
});

// Post a course review
app.post('/api/courses/:id/review', verifyToken, (req, res) => {
  const courseId = req.params.id;
  const { rating, comment } = req.body;
  const user = db.findById('users', req.user.id);
  const course = db.findById('courses', courseId);

  if (!user || !course) return res.status(404).json({ error: 'User or Course not found' });

  // Add review
  const reviews = course.reviews || [];
  reviews.push({
    studentName: user.name,
    rating: parseFloat(rating),
    comment,
    createdAt: new Date().toISOString()
  });

  // Re-evaluate quality rating
  const avgRating = parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1));
  
  db.findByIdAndUpdate('courses', courseId, {
    reviews,
    qualityScore: avgRating
  });

  res.json({ message: "Review submitted.", qualityScore: avgRating });
});

// ==========================================
// DISCUSSION / DOUBTS ENDPOINTS
// ==========================================

// Get forum discussions
app.get('/api/forum', (req, res) => {
  const { courseId } = req.query;
  let discussions = db.find('discussions');
  if (courseId) {
    discussions = discussions.filter(d => d.courseId === courseId);
  }
  // Sort by latest
  discussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(discussions);
});

// Create new discussion question
app.post('/api/forum', verifyToken, (req, res) => {
  const { courseId, title, body } = req.body;
  const user = db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newPost = db.create('discussions', {
    courseId,
    title,
    body,
    author: {
      name: user.name,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      rank: user.contributionScore > 100 ? "Elite Contributor" : "Learner"
    },
    answers: [],
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newPost);
});

// Answer a question / post a response
app.post('/api/forum/:id/answers', verifyToken, (req, res) => {
  const discussionId = req.params.id;
  const { body } = req.body;
  const user = db.findById('users', req.user.id);
  const discussion = db.findById('discussions', discussionId);

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!discussion) return res.status(404).json({ error: 'Discussion thread not found' });

  const newAnswer = {
    id: `ans-${Date.now()}`,
    body,
    author: {
      id: user.id,
      name: user.name,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      rank: user.contributionScore > 100 ? "Elite Contributor" : "Learner"
    },
    helpfulCount: 0,
    rewarded: false,
    createdAt: new Date().toISOString()
  };

  const answers = discussion.answers || [];
  answers.push(newAnswer);

  const updatedDiscussion = db.findByIdAndUpdate('discussions', discussionId, { answers });
  res.status(201).json(updatedDiscussion);
});

// Reward helpful answers (LC transfer & Contribution increase)
app.post('/api/forum/:id/answers/:answerId/helpful', verifyToken, (req, res) => {
  const discussionId = req.params.id;
  const answerId = req.params.answerId;

  const discussion = db.findById('discussions', discussionId);
  if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

  const answerIndex = discussion.answers.findIndex(a => a.id === answerId);
  if (answerIndex === -1) return res.status(404).json({ error: 'Answer not found' });

  const answer = discussion.answers[answerIndex];
  if (answer.rewarded) {
    return res.status(400).json({ error: 'This answer has already been rewarded.' });
  }

  // Verify that the person endorsing is NOT the author of the answer
  if (answer.author.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot mark your own answer as helpful.' });
  }

  // Endorse & Reward helper
  answer.helpfulCount += 1;
  answer.rewarded = true;

  const helperUser = db.findById('users', answer.author.id);
  if (helperUser) {
    // Award credits to the helper
    helperUser.learningCredits += 5; // +5 LC reward for answering doubts
    helperUser.contributionScore += 15; // Bump contribution rankings

    db.findByIdAndUpdate('users', helperUser.id, {
      learningCredits: helperUser.learningCredits,
      contributionScore: helperUser.contributionScore
    });

    db.create('notifications', {
      userId: helperUser.id,
      title: "Community Reward!",
      message: `Your answer on the forums was marked as helpful. Earned +5 LC and +15 Contribution score!`,
      type: "credit",
      read: false
    });
  }

  db.findByIdAndUpdate('discussions', discussionId, { answers: discussion.answers });
  res.json({ message: "Thanks for validating community contributions. Help credits released!", discussion });
});

// ==========================================
// LEADERBOARD ENDPOINT
// ==========================================
app.get('/api/leaderboard', (req, res) => {
  const users = db.find('users');

  // Top Learners: Sort by Knowledge Score
  const topLearners = [...users]
    .sort((a, b) => b.knowledgeScore - a.knowledgeScore)
    .slice(0, 10)
    .map(u => ({ id: u.id, name: u.name, score: u.knowledgeScore, skills: u.skills }));

  // Top Contributors: Sort by Contribution Score
  const topContributors = [...users]
    .sort((a, b) => b.contributionScore - a.contributionScore)
    .slice(0, 10)
    .map(u => ({ id: u.id, name: u.name, score: u.contributionScore, streak: u.learningStreak }));

  // Top Mentors: Calculated from total students/rating
  const courses = db.find('courses');
  const mentorsMap = {};
  courses.forEach(c => {
    if (c.mentor && c.mentor.id) {
      if (!mentorsMap[c.mentor.id]) {
        mentorsMap[c.mentor.id] = {
          name: c.mentor.name,
          qualityScore: c.mentor.qualityScore || 5.0,
          studentsCount: 0
        };
      }
      mentorsMap[c.mentor.id].studentsCount += c.mentor.students || 0;
    }
  });

  const topMentors = Object.entries(mentorsMap)
    .map(([id, val]) => ({ id, name: val.name, score: val.studentsCount, qualityScore: val.qualityScore }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  res.json({
    topLearners,
    topContributors,
    topMentors
  });
});

// ==========================================
// NOTIFICATIONS ENDPOINTS
// ==========================================
app.get('/api/notifications', verifyToken, (req, res) => {
  const userNotifications = db.find('notifications', { userId: req.user.id });
  // Sort newest first
  userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userNotifications);
});

app.post('/api/notifications/read', verifyToken, (req, res) => {
  const notifications = db.find('notifications', { userId: req.user.id });
  notifications.forEach(n => {
    db.findByIdAndUpdate('notifications', n.id, { read: true });
  });
  res.json({ message: "Notifications marked as read." });
});

// ==========================================
// PROFILE & SETTINGS
// ==========================================
app.get('/api/users/:id', (req, res) => {
  const user = db.findById('users', req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.put('/api/users/settings', verifyToken, (req, res) => {
  const { darkMode, notifications, privacy } = req.body;
  const user = db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updatedSettings = {
    ...user.settings,
    darkMode: darkMode !== undefined ? darkMode : user.settings.darkMode,
    notifications: notifications !== undefined ? notifications : user.settings.notifications,
    privacy: privacy !== undefined ? privacy : user.settings.privacy
  };

  const updatedUser = db.findByIdAndUpdate('users', user.id, { settings: updatedSettings });
  const { password: _, ...userWithoutPassword } = updatedUser;
  res.json(userWithoutPassword);
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../dist')));

  // For any page request, send the React app's index.html (SPA fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'dist', 'index.html'));
  });
}

// Start listening
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` SkillSwap Backend running on http://localhost:${PORT}`);
  console.log(` Zero-Setup fallback JSON database active in /server/data/`);
  console.log(`=================================================`);
});
