var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');

router.get('/', function(req, res){
  fs.readFile(path.join(__dirname, '../../views/guide/index.md'), { encoding: 'utf-8' }, function(err, data){
    res.render('guide/index', {
      title: 'Guide',
      text: data
    });
  })
})

module.exports = router;