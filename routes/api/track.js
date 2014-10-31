var express = require('express');
var router = express.Router();

var models = require('../../models');
var EventModel = models.EventModel;

router.get('/track', function(req, res){
  EventModel.find({}, function(err, docs){
    res.status(200).send(docs);
  });
});

router.post('/track', function(req, res){
  console.log(req.body);
  EventModel.create({
    event: req.body.event,
    data: req.body.data,
    timestamp: req.body.timestamp
  }, function(err){
    if (err) res.status(500).send(err);

    res.status(200).end();
  });
});

module.exports = router;
