var express = require('express');
var bodyParser = require('body-parser');
var eventsController = require('../controllers/eventsController');

var router = express.Router();

var jsonParser = bodyParser.json({
  type: 'application/vnd.contentful.management.v1+json'
});


router.all('/', jsonParser, eventsController.index);

module.exports = router
