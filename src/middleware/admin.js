const User = require('../models/user');

const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (!user.isAdmin) {
      return res.status(403).send('Access denied');
    }

    next();
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

module.exports = checkAdmin;
