const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

router.patch('/users/forgot-password', async (req, res) => {
  try {
    const { email, newPassword, authPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('לא נמצא אימייל במערכת');
    }
    if (newPassword !== authPassword) {
      return res.status(400).send('אימות סיסמה נכשל');
    }

    user.password = newPassword;
    await user.save();
    const token = await user.generateToken();
    res.send({ user, token });

    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    if (req.body.password.trim().length < 8){
      res.status(400).send('סיסמה לא תקנית');
    }
    const anotherUser = await User.findOne({ email: req.body.email });
    if (!anotherUser) {
      await user.save();
      const token = await user.generateToken();
      return res.status(201).send({ user, token });
    }
    res.status(400).send('!אימייל קיים במערכת');
  } catch (e) {
    res.status(400).send('הרשמות נכשלה. בדוק את הערכים שהזנת');
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCred(req.body.email, req.body.password);
    const token = await user.generateToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send('שם משתמש או סיסמה שגויים');
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/users/me', auth, async (req, res) => {
  try {
    const email = req.user.email;
    res.send({email});
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ['email'];
  const validUpdate = updates.every((update) => allowed.includes(update));

  if (!validUpdate) {
    return res.status(400).send({ error: 'invald updates!!!' });
  }
  if (req.user.email === req.body.email) {
    return res.status(400).send('האימייל החדש לא יכול להיות האימייל הישן');
  }
  try {
    const anotherUser = await User.findOne({ email: req.body.email });
    if (anotherUser) {
      return res.status(400).send('אימייל קיים במערכת');
    }
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
