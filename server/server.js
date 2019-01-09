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

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
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

app.get('/todos/:id', (req, res) => {
  const todoId = req.params.id;

  if (!ObjectID.isValid(todoId)) {
    return res.status(404).send();
  }

  Todo.findById(todoId).then(
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

app.get('/todos', (req, res) => {
  Todo.find().then(
    todos => {
      res.send({ todos });
    },
    err => {
      res.status(400).send(err);
    }
  );
});

app.delete('/todos/:id', (req, res) => {
  const todoId = req.params.id;

  if (!ObjectID.isValid(todoId)) {
    return res.status(404).send();
  }

  Todo.findOneAndDelete({ _id: todoId }).then(
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

app.patch('/todos/:id', (req, res) => {
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

  Todo.findByIdAndUpdate(todoId, { $set: body }, { new: true }).then(
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

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);
  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      return res.header('x-auth', token).send(user);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        return res.header('x-auth', token).send(user);
      });
    })
    .catch(err => {
      res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  const token = req.token;
  const user = req.user;

  user
    .removeToken(token)
    .then(() => {
      res.status(200).send();
    })
    .catch(err => res.status(400).send(err));
});

app.listen(port, () => {
  console.log('Started on port', port);
});

module.exports = { app };
