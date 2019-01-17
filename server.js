/*
Copyright [2018] [Cisco and/or its affiliates]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

const express = require('express');
const bodyParser = require("body-parser");
const HttpStatus = require('http-status-codes');
const _ = require('underscore');
const cors  = require('cors');

// Constants
const PORT = 3000;
const LOG_ENV= process.env.LOG_ENV || 'Dev';

// function
var logFormatter = function(log) {
  var message = "2-Immerse";
  for (var prop in log) {
    message += " " + prop + ":" + JSON.stringify(log[prop]);
  }
  console.log(message + " env:" + LOG_ENV);
};

// App
const app = express();
app.use(bodyParser.urlencoded({limit: '10mb', extended: false }));
app.use(bodyParser.json({limit: '10mb'}));
app.use(cors());

app.get('/', function(req, res) {
    res.send('Use /post with a JSON object in the body including id, level and message to post a log!');
});

app.post('/post', function(req, res) {
  var body = req.body;

  if (body.logArray) {
    _.each(body.logArray, logFormatter);
  } else if (body) {
    logFormatter(body);
  }

  res.status(HttpStatus.OK).send("OK");
});

app.listen(PORT);
console.log('Running on http://0.0.0.0:' + PORT);
