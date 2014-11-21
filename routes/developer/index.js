var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  res.render('developer/index', {
    title: 'Developer'
  });
})

module.exports = router;