const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Helper to ensure data directory and files exist
function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const collections = {
    users: [],
    courses: [
      {
        id: "course-1",
        title: "Introduction to Knowledge Tokenomics",
        description: "Explore the fundamental philosophy that knowledge is the only true currency. Learn how to optimize your learning paths, create valuable content, and participate in self-sustaining educational ecosystems.",
        mentor: {
          id: "mentor-sophia",
          name: "Sophia Vance",
          bio: "Cognitive Economist & Researcher. Pioneering models for decentralized education.",
          expertise: ["Economics", "Pedagogy", "Game Theory"],
          students: 1240,
          completionRate: 96,
          qualityScore: 9.8,
          knowledgeScore: 890,
          verified: true,
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        },
        difficulty: "Beginner",
        category: "Economy",
        knowledgeValue: 15, // LC cost
        completionRate: 94,
        qualityScore: 9.8,
        duration: "2.5 hours",
        skills: ["Tokenomics", "Learning Optimization", "Educational Design"],
        outcomes: [
          "Understand the core philosophy of SkillSwap and Knowledge Credits",
          "Identify strategies to generate high-value educational content",
          "Learn to balance learning inputs with teaching outputs"
        ],
        modules: [
          {
            id: "m1-1",
            title: "The Philosophy of Knowledge Currency",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder unlisted behavior
            notes: "In this module, we discuss the core thesis: money focuses on extraction, whereas learning focus on expansion. Learning Credits (LC) represent a closed-loop medium of exchange designed to facilitate knowledge sharing without financial friction.",
            quiz: {
              questions: [
                {
                  id: "q1",
                  question: "What is the primary philosophy behind SkillSwap?",
                  options: [
                    "To replace universities with paid certifications",
                    "Knowledge is the only currency",
                    "To earn money by posting videos",
                    "To compete for financial sponsorships"
                  ],
                  correctAnswer: 1
                },
                {
                  id: "q2",
                  question: "Can Learning Credits (LC) be withdrawn or converted to fiat money?",
                  options: [
                    "Yes, after completing 5 courses",
                    "No, they exist solely to unlock more learning within the ecosystem",
                    "Only by verified mentors",
                    "Yes, through direct bank transfer"
                  ],
                  correctAnswer: 1
                }
              ]
            }
          },
          {
            id: "m1-2",
            title: "Earning vs Spending Learning Credits (LC)",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            notes: "Balance is key in a knowledge economy. Earning occurs by creating quality courses, passing quizzes, and answering community doubts. Spending unlocks advanced modules and exclusive mentor sessions.",
            quiz: {
              questions: [
                {
                  id: "q3",
                  question: "Which of the following does NOT earn you Learning Credits?",
                  options: [
                    "Creating a high-quality course",
                    "Answering a peer's doubt in the forum",
                    "Passing a module quiz",
                    "Just logging in and browsing courses"
                  ],
                  correctAnswer: 3
                }
              ]
            }
          }
        ],
        reviews: [
          { studentName: "David Kim", rating: 5, comment: "Mind-bending paradigm. Totally changed how I view sharing code and tutorials." },
          { studentName: "Sasha Gray", rating: 4.8, comment: "Short, punchy, and highly informative." }
        ]
      },
      {
        id: "course-2",
        title: "Decoupled Architectural Systems",
        description: "Master the design of production-grade decoupled backends. Dive deep into event-driven design patterns, eventual consistency, message brokers, and failure isolation techniques.",
        mentor: {
          id: "mentor-marcus",
          name: "Marcus Thorne",
          bio: "Principal Systems Architect. Ex-Netflix, Ex-Stripe. Specialist in highly distributed systems.",
          expertise: ["System Architecture", "Microservices", "Go", "Kubernetes"],
          students: 3420,
          completionRate: 88,
          qualityScore: 9.6,
          knowledgeScore: 975,
          verified: true,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        },
        difficulty: "Advanced",
        category: "Engineering",
        knowledgeValue: 40, // LC cost
        completionRate: 88,
        qualityScore: 9.6,
        duration: "6 hours",
        skills: ["Event Sourcing", "CQRS", "RabbitMQ / Kafka", "Circuit Breakers"],
        outcomes: [
          "Design system components that fail gracefully without cascading",
          "Implement eventual consistency patterns across microservices",
          "Apply CQRS to optimize read and write models separately"
        ],
        modules: [
          {
            id: "m2-1",
            title: "Message Queues & Eventual Consistency",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            notes: "Eventual consistency trades immediate consistency for high availability. In this module we analyze how Message Queues (RabbitMQ/Kafka) decouple services so they process transactions asynchronously.",
            quiz: {
              questions: [
                {
                  id: "q1",
                  question: "What is the primary benefit of eventual consistency over strict consistency in distributed systems?",
                  options: [
                    "Lower storage requirements",
                    "Higher availability and system scalability",
                    "Simpler application code",
                    "Guaranteed instantaneous updates"
                  ],
                  correctAnswer: 1
                }
              ]
            }
          },
          {
            id: "m2-2",
            title: "Circuit Breakers & Fault Tolerance",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            notes: "A circuit breaker prevents an application from repeatedly trying to execute an operation that is likely to fail. We discuss Open, Closed, and Half-Open states.",
            quiz: {
              questions: [
                {
                  id: "q2",
                  question: "In what state does a circuit breaker allow a limited number of test requests to pass?",
                  options: [
                    "Closed State",
                    "Open State",
                    "Half-Open State",
                    "Locked State"
                  ],
                  correctAnswer: 2
                }
              ]
            }
          }
        ],
        reviews: [
          { studentName: "Amelie Laurent", rating: 5, comment: "Exceptional architecture course. Marcus explains production-grade topics with ease." }
        ]
      },
      {
        id: "course-3",
        title: "UX Psychology & Cognitive Load Design",
        description: "Explore the intersections of human psychology and interface design. Learn how to map cognitive models, reduce visual clutter, and build micro-interactions that delight without distracting.",
        mentor: {
          id: "mentor-elena",
          name: "Elena Rostova",
          bio: "Senior UX Designer and Design Ethicist. Focused on human-centered luxury design principles.",
          expertise: ["User Experience", "Interaction Psychology", "Figma", "Research"],
          students: 1890,
          completionRate: 91,
          qualityScore: 9.9,
          knowledgeScore: 910,
          verified: true,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        },
        difficulty: "Intermediate",
        category: "Design",
        knowledgeValue: 25, // LC cost
        completionRate: 91,
        qualityScore: 9.9,
        duration: "4 hours",
        skills: ["Hick's Law", "Fitts's Law", "Cognitive Friction", "Micro-interactions"],
        outcomes: [
          "Calculate and reduce cognitive load for complex dashboards",
          "Apply Gestalt principles to align interface components beautifully",
          "Implement organic animations that match human optical feedback"
        ],
        modules: [
          {
            id: "m3-1",
            title: "Hick's Law & Reducing Choice Overhead",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            notes: "Hick's Law states that the time it takes to make a decision increases logarithmically with the number and complexity of choices. Modern SaaS layouts reduce choices through progressive disclosure.",
            quiz: {
              questions: [
                {
                  id: "q1",
                  question: "According to Hick's Law, how does decision-making time change with more choices?",
                  options: [
                    "It increases linearly",
                    "It increases logarithmically",
                    "It decreases exponentially",
                    "It remains constant"
                  ],
                  correctAnswer: 1
                }
              ]
            }
          }
        ],
        reviews: [
          { studentName: "Oliver Bennett", rating: 5, comment: "Splendid layout and theory. The examples of progressive disclosure were excellent." }
        ]
      }
    ],
    discussions: [
      {
        id: "d-1",
        courseId: "course-1",
        title: "How is the dynamic SkillScore computed?",
        body: "I noticed course rankings use SkillScore instead of simple 5-star ratings. Does anyone know the exact weights used for completion rate vs mentor rating?",
        author: {
          name: "Sasha Gray",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
          rank: "Learner"
        },
        answers: [
          {
            id: "a-1",
            body: "According to the architect, SkillScore is computed dynamically by multiplying Completion Rate (35%), Mentor Trust / Verification (25%), Student Ratings (20%), Quiz Success (10%), and freshness/demand metrics. This stops mentors from inflating ratings through fake accounts.",
            author: {
              name: "Sophia Vance",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
              rank: "Verified Mentor"
            },
            helpfulCount: 8,
            rewarded: true
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
      },
      {
        id: "d-2",
        courseId: "course-2",
        title: "Dead-letter exchange setup in RabbitMQ",
        body: "What is the best practice for configuring a dead-letter exchange (DLX) for message retry timeouts? Should retries have their own separate backoff queues?",
        author: {
          name: "Alex Rivera",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
          rank: "Systems Engineer"
        },
        answers: [],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
      }
    ],
    notifications: []
  };

  Object.entries(collections).forEach(([key, val]) => {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(val, null, 2), 'utf-8');
    }
  });
}

// Perform DB init immediately
initDb();

// Generic CRUD helper
const jsonDb = {
  read(collection) {
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error(`Error reading database file: ${filePath}`, e);
      return [];
    }
  },

  write(collection, data) {
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error(`Error writing database file: ${filePath}`, e);
      return false;
    }
  },

  find(collection, filter = {}) {
    const data = this.read(collection);
    return data.filter(item => {
      return Object.entries(filter).every(([key, val]) => {
        if (typeof val === 'object' && val !== null) {
          // Basic handle nested queries
          return JSON.stringify(item[key]) === JSON.stringify(val);
        }
        return item[key] === val;
      });
    });
  },

  findOne(collection, filter = {}) {
    const data = this.read(collection);
    return data.find(item => {
      return Object.entries(filter).every(([key, val]) => {
        return item[key] === val;
      });
    }) || null;
  },

  findById(collection, id) {
    const data = this.read(collection);
    return data.find(item => item.id === id || item._id === id) || null;
  },

  create(collection, itemData) {
    const data = this.read(collection);
    const newItem = {
      id: `${collection.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      _id: `${collection.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...itemData
    };
    data.push(newItem);
    this.write(collection, data);
    return newItem;
  },

  findByIdAndUpdate(collection, id, updates) {
    const data = this.read(collection);
    const index = data.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;

    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    this.write(collection, data);
    return data[index];
  },

  updateOne(collection, query, updates) {
    const data = this.read(collection);
    const index = data.findIndex(item => {
      return Object.entries(query).every(([key, val]) => item[key] === val);
    });
    if (index === -1) return null;

    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    this.write(collection, data);
    return data[index];
  },

  delete(collection, query) {
    const data = this.read(collection);
    const beforeLen = data.length;
    const filtered = data.filter(item => {
      return !Object.entries(query).every(([key, val]) => item[key] === val);
    });
    if (filtered.length !== beforeLen) {
      this.write(collection, filtered);
      return true;
    }
    return false;
  }
};

module.exports = jsonDb;
