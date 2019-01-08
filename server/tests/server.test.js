const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Eat chocolate';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(3);
            expect(todos[2].text).toBe(text);
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should not create a new todo with invalid body data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', done => {
    const validButNotExistentId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${validButNotExistentId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if id not valid', done => {
    const invalidId = '123';
    request(app)
      .get(`/todos/${invalidId}`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove the todo', done => {
    const idToDelete = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${idToDelete}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(idToDelete);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(idToDelete)
          .then(todo => {
            expect(todo).toBeFalsy();
            done();
          })
          .catch(error => done(error));
      });
  });

  it('should return 404 if todo not found', done => {
    const validButNotExistentId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${validButNotExistentId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if id not valid', done => {
    const invalidId = '123';
    request(app)
      .delete(`/todos/${invalidId}`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    const idToPatch = todos[0]._id.toHexString();
    const updatedTodo = { text: 'Updated text here', completed: true };
    request(app)
      .patch(`/todos/${idToPatch}`)
      .send(updatedTodo)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(updatedTodo.text);
        expect(res.body.todo.completed).toBe(updatedTodo.completed);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(idToPatch)
          .then(todo => {
            expect(todo.text).toBe(updatedTodo.text);
            expect(todo.completed).toBe(updatedTodo.completed);
            done();
          })
          .catch(error => done(error));
      });
  });

  it('should clear completedAt when todo is not completed', done => {
    const idToPatch = todos[1]._id.toHexString();
    const updatedTodo = { text: 'Updated text here', completed: false };
    request(app)
      .patch(`/todos/${idToPatch}`)
      .send(updatedTodo)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(updatedTodo.text);
        expect(res.body.todo.completed).toBe(updatedTodo.completed);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(idToPatch)
          .then(todo => {
            expect(todo.text).toBe(updatedTodo.text);
            expect(todo.completed).toBe(updatedTodo.completed);
            done();
          })
          .catch(error => done(error));
      });
  });

  it('should return 404 if todo not found', done => {
    const validButNotExistentId = new ObjectID().toHexString();
    request(app)
      .patch(`/todos/${validButNotExistentId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if id not valid', done => {
    const invalidId = '123';
    request(app)
      .patch(`/todos/${invalidId}`)
      .expect(404)
      .end(done);
  });
});
