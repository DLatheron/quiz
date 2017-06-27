/* global module,require */
'use strict';

var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res) {
    res.sendStatus('respond with a resource');
});


module.exports = router;
