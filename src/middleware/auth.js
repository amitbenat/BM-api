const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }
    const token = req.header('Authorization').replace('Bearer', '').trim();
    const decoded = jwt.verify(token, 'AmitIsTheBestProgramer');
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error("can't find user!");
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
      res.status(401).send(e);
  }
};

module.exports = auth;
