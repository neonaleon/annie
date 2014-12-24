var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

router.get('/', function(req, res){
  fs.readFile(path.join(__dirname, '../../views/developer/index.md'), { encoding: 'utf-8' }, function(err, data){
    res.render('developer/index', {
      title: 'Developer',
      text: data
    });
  })
})

module.exports = router;