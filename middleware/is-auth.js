const jwt = require('jsonwebtoken');
const { tokenSecretKey } = require('../lib/config');

module.exports = (r, res, next) => {
  const authHeader = r.get('Authorization');
  if (!authHeader) {
    // console.log('No authHeader');
    r.isAuth = false;
    return next();
  }

  const token = authHeader.split('public!_*_!')[1];
  if (!token) {
    // console.log('No token');
    r.isAuth = false;
    return next();
  }

  const decryptToken = jwt.verify(token, tokenSecretKey);
  if (!decryptToken) {
    // console.log('No decryptToken');
    r.isAuth = false;
    return next();
  }

  r.isAuth = true;
  r.userId = decryptToken.userId;
  next();
};
