const express = require('express');
const router = new express.Router();
const Request = require('../models/request');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/requests', auth, async (req, res) => {
  const request = new Request({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await request.save();
    res.status(201).send(request);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/admin-open-requests', auth, admin, async (req, res) => {
  try {
    const requestType = req.query.requestType
    if (requestType === 'הכל'){
      const requests = await Request.find({status: 'pending'}).populate('owner')
      res.status(200).send(requests)
    } else{
    const requests = await Request.find({status: 'pending', type: requestType}).populate('owner')
    res.status(200).send(requests)
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
});

router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user._id });
    res.send(requests);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get('/requests/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const request = await Request.findOne({ _id, owner: req.user._id });
    if (!request) {
      return res.status(404).send();
    }
    res.send(request);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch('/admin-open-requests/:id', admin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ['status', 'isValid', 'reasonIfNeeded'];
  const validUpdate = updates.every((update) => allowed.includes(update));

  if (!validUpdate) {
    return res.status(400).send({ error: 'invald updates!!!' });
  }
  try {
    const request = await Request.findOne({
      _id: req.params.id,
    });
    if (!request) {
      return res.status(404).send('tcyun');
    }
    updates.forEach((update) => (request[update] = req.body[update]));
    await request.save();
    res.send(request);
  } catch (e) {
    res.status(400).send(e);
  }
});


router.delete('/request/:id', auth, async (req, res) => {
  try {
    const request = await Request.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!request) {
      return res.status(404).send();
    }

    res.send(request);
  } catch (e) {
    res.status(500).send();
  }
});

router.delete('/request/:id', auth, async (req, res) => {
  try {
    const request = await Request.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!request) {
      return res.status(404).send();
    }

    res.send(request);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
