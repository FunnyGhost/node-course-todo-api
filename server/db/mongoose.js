const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(
  mongoURI,
  { useNewUrlParser: true }
);

module.exports = { mongoose };
