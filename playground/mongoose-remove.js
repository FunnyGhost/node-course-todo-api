const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

Todo.findByIdAndRemove('5c2ced0f5e9592d0d49c4fa1').then(todo => {
  console.log('Removed', todo);
});
