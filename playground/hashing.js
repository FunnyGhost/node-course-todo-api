require('colors');
const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

const data = {
  id: 10
};

const token = jwt.sign(data, '123abc');
console.log(`Token is ${token}`.yellow);

const decoded = jwt.verify(token, '123abc');
console.log(`Decoded is ${JSON.stringify(decoded)}`.green);
