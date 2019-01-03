const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp';
mongoose.connect(
  mongoURI,
  { useNewUrlParser: true }
);

module.exports = { mongoose };
