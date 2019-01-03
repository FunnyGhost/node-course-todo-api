const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');

const app = express();
const port = process.env.PORT || 3000;
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

app.listen(port, () => {
  console.log('Started on port', port);
});

module.exports = { app };
