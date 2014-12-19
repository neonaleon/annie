var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();

var aboutFile = fs.readFileSync(path.join(__dirname, '../../views/about/about.md'), { encoding: 'utf-8' });

router.get('/', function(req, res){
  res.render('about/index', {
    title: 'About',
    text: aboutFile
  });
});

module.exports = router;