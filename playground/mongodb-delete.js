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

    // deleteMany
    // db.collection('Users')
    //   .deleteMany({ name: 'Catalin Ciubotaru' })
    //   .then(result => {
    //     console.log(result);
    //   });

    // deleteOne
    // db.collection('Users')
    //   .deleteOne({ name: 'Catalin Ciubotaru' })
    //   .then(result => console.log(result));

    // findOneAndDelete
    db.collection('Users')
      .findOneAndDelete({ _id: ObjectID('5c262bade7a35ab0d2b86611') })
      .then(result => console.log(result));

    // client.close();
  }
);
