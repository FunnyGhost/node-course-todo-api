// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

const connectOptions = { useNewUrlParser: true };

MongoClient.connect(
  'mongodb://localhost:27017/TodoApp',
  connectOptions,
  (error, client) => {
    if (error) {
      return console.log('Unable to connect to database');
    }

    console.log('Connected to database');
    const db = client.db('TodoApp');
    // db.collection('Todos')
    //   .find({ _id: new ObjectID('5c262af9940c76b0c6b5258e') })
    //   .toArray()
    //   .then(
    //     docs => {
    //       console.log('Todos', docs);
    //     },
    //     error => {
    //       console.log('Unable to fetch Todos', error);
    //     }
    //   );

    db.collection('Users')
      .find()
      .toArray()
      .then(
        count => {
          console.log('Users in list', count);
        },
        error => {
          console.log('Unable to fetch Users', error);
        }
      );

    client.close();
  }
);
