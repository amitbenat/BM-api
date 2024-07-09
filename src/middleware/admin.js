const User = require('../models/user');
const jwt = require('jsonwebtoken');

const checkAdmin = async (req, res, next) => {
  try {
    let user;

    if (req.user) {
      user = await User.findById(req.user);
    } else {
      const authHeader = req.header('Authorization');

      if (!authHeader) {
        return res.status(401).send('Authorization header is missing');
      }

      const token = authHeader.replace('Bearer ', '').trim();

      try {
        const decoded = jwt.verify(token, 'AmitIsTheBestProgramer');
        user = await User.findById(decoded._id);
      } catch (err) {
        return res.status(401).send('Invalid token');
      }
    }

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (!user.isAdmin) {
      return res.status(403).send('Access denied');
    }

    req.user = user; // Attach the user to the request object for use in subsequent middleware/handlers
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = checkAdmin;