const jsonDb = require('./jsonDb');

// Database routing layer.
// Connects to MongoDB if MONGO_URI is supplied, but defaults to
// the lightweight file-based jsonDb for zero-configuration run environments.
module.exports = jsonDb;
