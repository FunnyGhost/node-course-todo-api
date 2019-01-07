require('colors');
const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const password = '123abc!';
bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
  console.log(salt.white);
  console.log(hash.green);
  });
});

// const hashedPassword = '$2a$10$Bt2hD0ZhzVFgur3dQVNPBOcoCzrxKOkhxpK5YqL6IeB/BmOa9J4La';
// bcrypt.compare(password, hashedPassword, (err, res) => {
//   console.log(res);
// });


// const data = {
//   id: 10
// };

// const token = jwt.sign(data, '123abc');
// console.log(`Token is ${token}`.yellow);

// const decoded = jwt.verify(token, '123abc');
// console.log(`Decoded is ${JSON.stringify(decoded)}`.green);


