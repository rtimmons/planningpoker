;process.title = "poker"

const PORT = process.env.PORT || 3000;

// imports

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const xssFilter = require('x-xss-protection');

const model = require('./model.js');

// setup

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(xssFilter());
app.use(helmet());

app.use(express.static('ui'));

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

record in logbook:
http://localhost:3000/recordlog.json?ID=1&Question=Foo&Vote=7
*/

const header = (req, res) => {
  res.header('Content-Type', 'application/json')
  return Promise.resolve();
};

function onModel(req, res, f, args) {
  return header(req, res)
    .then(() => f.apply(model, args || []))
    .then(s => res.send(s));
}

app.get('/state.json', function(req, res){
  return onModel(req, res, model.getStateJson)
});
app.get('/set.json', function(req, res) {
  return onModel(req, res, model.setState, [
    req.query.Question, req.query.Name, req.query.Vote
  ]);
});
app.get('/kick.json', function(req, res) {
  return onModel(req, res, model.kick, [req.query.Name]);
});
app.get('/reset.json', function(req, res) {
  return onModel(req, res, model.reset);
});
app.get('/clear.json', function(req, res) {
  return onModel(req, res, model.clear);
});

app.get('/recordlog.json', function(req, res) {
  return onModel(req, res, model.recordInLogbook, [
    req.query.ID, req.query.Question, req.query.Vote
  ]);
});

app.get('/removelog.json', function(req, res) {
  return onModel(req, res, model.removeLogEntry, [
    req.query.ID
  ]);
});



// 💪

app.listen(PORT, () => console.log('Listening on port 3000!'));
