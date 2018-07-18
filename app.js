;process.title = "poker"

// imports

var express = require('express');
var request = require('request');
var cors = require('cors')
var bodyParser = require('body-parser');

var model = require('./model.js');

// setup

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static('ui'))

// Routing

/*
current state:
http://localhost:3000/state.json
(all of below return current state post-changes)

okay, empty vote (e.g. new user):
http://localhost:3000/set.json?a=b&Name=Marco

name and vote:
http://localhost:3000/set.json?a=b&Name=Marco&Vote=7

no name so error:
http://localhost:3000/set.json?a=b&Vote=100

set question without name:
http://localhost:3000/set.json?a=b&Question=Question1

reset:
http://localhost:3000/reset.json

kick:
http://localhost:3000/kick.json?Name=Abdul
*/

const header = (req, res) => {
  res.header('Content-Type', 'application/json')
  return Promise.resolve();
};

app.get('/state.json', function(req, res){
  return header(req, res)
    .then(model.getStateJson)
    .then(s => res.send(s));
});
app.get('/set.json', function(req, res) {
  return header(req, res)
    .then(() => model.setState(req.query.Question, req.query.Name, req.query.Vote))
    .then(s => res.send(s));
});
app.get('/kick.json', function(req, res) {
  return header(req, res)
    .then(() => model.kick(req.query.Name))
    .then(s => res.send(s));
});
app.get('/reset.json', function(req, res) {
  return header(req, res)
    .then(model.reset)
    .then(s => res.send(s));
});
app.get('/clear.json', function(req, res) {
  return header(req, res)
    .then(model.clear)
    .then(s => res.send(s));
});


// 💪

app.listen(3000, () => console.log('Listening on port 3000!'));
