const express = require('express');
const router = new express.Router();
const Request = require('../models/request');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/user');

router.get('/admin-open-requests', auth, admin, async (req, res) => {
  const requestType = req.query.requestType;
  const email = req.query.email;
  const filterByType = req.query.filterByType == true;
  if (filterByType) {
    try {
      if (requestType === 'הכל') {
        const requests = await Request.find({ status: 'pending' }).populate(
          'owner'
        );
        res.status(200).send({requests, isEmailValid: true})
      } else {
        const requests = await Request.find({
          status: 'pending',
          type: requestType,
        }).populate('owner');
        res.status(200).send({requests, isEmailValid: true})
      }
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err });
    }
  } else {
    try {
      let requests
      const myUser = await User.findOne({ email });
      if (!myUser || myUser !== req.user) {
        requests = await Request.find({ status: 'pending' }).populate(
         'owner'
       );
      return res.status(200).send({requests, isEmailValid: false});

     }
       requests = await Request.find({ owner: myUser._id }).populate('owner');
      res.status(200).send({requests, isEmailValid: true});
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err });
    }
  }
});

router.get('/admin-history-requests', admin, async (req, res) => {
  const { startDateVar, endDateVar, page } = req.query;
  const pageNumber = parseInt(page) || 1;
  const pageSize = 5;
  let startDate = new Date(startDateVar);
  let endDate = new Date(endDateVar);
  endDate.setDate(endDate.getDate() + 1);

  let query = {};

  if (startDateVar && endDateVar) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
    try {
      const requests = await Request.find(query)
        .populate('owner')
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec();
      const totalCount = await Request.countDocuments(query);
      const totalPages = Math.ceil(totalCount / pageSize);

      res.status(200).send({ requests, totalPages });
    } catch (error) {
      res.status(500).send('Error fetching dzfg');
    }
  } else {
    try {
      const requests = await Request.find({})
        .populate('owner')
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .exec();
      const totalCount = await Request.countDocuments(query);
      const totalPages = Math.ceil(totalCount / pageSize);

      res.status(200).send({ requests, totalPages });
    } catch (error) {
      res.status(500).send(error);
    }
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
      return res.status(404).send('שגיאה במציאת בקשה');
    }
    updates.forEach((update) => (request[update] = req.body[update]));
    await request.save();
    res.send(request);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/requests', auth, async (req, res) => {
  if(req.body.description.trim() === 0){
    res.status(400).send('תיאור הגשת הבקשה הוא חובה');
  }
  console.log(req.body.description);
  const request = new Request({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await request.save();
    res.status(201).send(request);
  } catch (e) {
    res.status(400).send('בדוק שכל הערכים מולאו');
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
