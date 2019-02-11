require('./config/config');

const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo.save().then(
    doc => {
      res.send(doc);
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.get('/todos/:id', authenticate, (req, res) => {
  const todoId = req.params.id;

  if (!ObjectID.isValid(todoId)) {
    return res.status(404).send();
  }

  Todo.findOne({ _id: todoId, _creator: req.user._id }).then(
    todo => {
      if (todo) {
        res.send({ todo });
      } else {
        res.status(404).send();
      }
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id }).then(
    todos => {
      res.send({ todos });
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.delete('/todos/:id', authenticate, async (req, res) => {
  const todoId = req.params.id;

  if (!ObjectID.isValid(todoId)) {
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOneAndDelete({ _id: todoId, _creator: req.user._id });
    if (todo) {
      return res.send({ todo });
    } else {
      return res.status(404).send();
    }
  } catch (error) {
    return res.status(400).send(error);
  }
});

app.patch('/todos/:id', authenticate, (req, res) => {
  const todoId = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(todoId)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate(
    { _id: todoId, _creator: req.user._id },
    { $set: body },
    { new: true }
  ).then(
    todo => {
      if (todo) {
        res.send({ todo });
      } else {
        res.status(404).send();
      }
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.post('/users', async (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    return res.header('x-auth', token).send(user);
  } catch (error) {
    return res.status(400).send(error);
  }
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    return res.header('x-auth', token).send(user);
  } catch (error) {
    return res.status(400).send(error);
  }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
  const token = req.token;
  const user = req.user;

  try {
    await user.removeToken(token);
    return res.status(200).send();
  } catch (error) {
    return res.status(400).send(err);
  }
});

app.listen(port, () => {
  console.log('Started on port', port);
});

module.exports = { app };
