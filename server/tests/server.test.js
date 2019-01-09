const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');

const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Eat chocolate';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if id not valid', done => {
    const invalidId = '123';
    request(app)
      .get(`/todos/${invalidId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not return a todo doc created by other user', done => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove the todo', done => {
    const idToDelete = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${idToDelete}`)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if id not valid', done => {
    const invalidId = '123';
    request(app)
      .delete(`/todos/${invalidId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not remove a todo created by another user', done => {
    const idToDelete = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${idToDelete}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(idToDelete)
          .then(todo => {
            expect(todo).toBeTruthy();
            done();
          })
          .catch(error => done(error));
      });
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    const idToPatch = todos[0]._id.toHexString();
    const updatedTodo = { text: 'Updated text here', completed: true };
    request(app)
      .patch(`/todos/${idToPatch}`)
      .send(updatedTodo)
      .set('x-auth', users[0].tokens[0].token)
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
    const idToPatch = todos[0]._id.toHexString();
    const updatedTodo = { text: 'Updated text here', completed: false };
    request(app)
      .patch(`/todos/${idToPatch}`)
      .send(updatedTodo)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if id not valid', done => {
    const invalidId = '123';
    request(app)
      .patch(`/todos/${invalidId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not update a todo created by a different user', done => {
    const idToPatch = todos[1]._id.toHexString();
    const updatedTodo = { text: 'Updated text here', completed: false };
    request(app)
      .patch(`/todos/${idToPatch}`)
      .send(updatedTodo)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(idToPatch)
          .then(todo => {
            expect(todo.text).not.toBe(updatedTodo.text);
            expect(todo.completed).not.toBe(updatedTodo.completed);
            done();
          })
          .catch(error => done(error));
      });
  });
});

describe('GET /users/me', () => {
  it('should return the user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return a 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', done => {
    const email = 'example@example.com';
    const password = 'password';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should return validation error if request invalid', done => {
    const email = 'xample.com';
    const password = 'password';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({ email }).then(user => {
          expect(user).toBeFalsy();
          done();
        });
      });
  });

  it('should not create user if email is already used', done => {
    const email = users[0].email;
    const password = 'password';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(err => {
        if (err) {
          return done(err);
        }

        User.find({ email }).then(users => {
          expect(users.length).toBe(1);
          done();
        });
      });
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    const email = users[0].email;
    const password = users[0].password;

    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens[1]).toMatchObject({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should reject invalid login', done => {
    const email = users[0].email;
    const password = 'invalid-password';

    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end(done);
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', done => {
    const token = users[0].tokens[0].token;

    request(app)
      .delete('/users/me/token')
      .set('x-auth', token)
      .expect(200)
      .end(err => {
        if (err) {
          return done(err);
        }

        User.findOne({ email: users[0].email })
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(err => done(err));
      });
  });
});
