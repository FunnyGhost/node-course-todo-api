// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect(
  'mongodb://localhost:27017/TodoApp',
  (error, client) => {
    if (error) {
      return console.log('Unable to connect to database');
    }

    console.log('Connected to database');
    const db = client.db('TodoApp');

    // db.collection('Todos').insertOne(
    //   {
    //     text: 'Something to do',
    //     completed: false
    //   },
    //   (error, result) => {
    //     if (error) {
    //       return console.log('Unable to insert Todo', err);
    //     }

    //     console.log('Todo added', result.ops);
    //   }
    // );
    // db.collection('Users').insertOne(
    //   {
    //     name: 'Catalin Ciubotaru',
    //     age: 30,
    //     location: 'Utrecht'
    //   },
    //   (error, result) => {
    //     if (error) {
    //       return console.log('Unable to insert User', err);
    //     }

    //     console.log('User added', result.ops[0]._id.getTimestamp());
    //   }
    // );

    client.close();
  }
);
