;process.title = "poker"

var express = require('express');
var request = require('request');
var cors = require('cors')
var _ = require('underscore');
var deepcopy = require('deepcopy');

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
http://localhost:3000/kick.json?Name=Ryan
*/

var app = express();

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(cors());

app.use(express.static('ui'))

timestamp = function() { return new Date().getTime(); };

const startState = {
  Question: "IDK",
  Voters: [
    // for good experience on reset, keep the Vote values in-sync with <buttons> on html
    {"Name": "Ryan",    "Vote": "7 Points", "LastVoteTS": timestamp()},
    {"Name": "Deshawn", "Vote": "3 Points", "LastVoteTS": timestamp()},
    {"Name": "Maqbool", "Vote": "😫 Points", "LastVoteTS": timestamp()}
  ]
};
var state = deepcopy(startState);

// app.get('/b/:to', function(req, res){
//   var url = redirs[req.params.to];
//   req.pipe(request(url)).pipe(res);
// });

var setState = function(question, vname, vote) {
  var existing, voter;

  // can set question even if other errors
  state.Question = question || state.Question;

  if (!(vname || !_.isUndefined(vote))) { return; }

  voter = _.find(state.Voters, (v) => v.Name == vname);
  existing = ! _.isUndefined(voter);

  if (!existing && _.isUndefined(vname)) {
    throw `WTF with question=${question}, vname=${vname}, vote=${vote}`;
  }

  voter = voter || {};

  voter.Name = vname || voter.Name;
  voter.Vote = vote  || voter.Vote;
  voter.LastVoteTS = timestamp();

  if (!existing) {
    state.Voters.push(voter);
  }
}

var kick = function(vname) {
  state.Voters = _.reject(state.Voters, (v) => v.Name == vname);
}

var reset = function() {
  state = deepcopy(startState);
}

var getStateHandler = function(req, res){
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify(state));
};
var setStateHandler = function(req, res) {
  setState(req.query.Question, req.query.Name, req.query.Vote);
  return getStateHandler(req,res);
};
var kickHandler = function(req, res) {
  kick(req.query.Name);
  return getStateHandler(req, res);
}
var resetHandler = function(req, res) {
  reset();
  return getStateHandler(req, res);
}

app.get('/state.json',  getStateHandler);
app.get('/set.json',    setStateHandler);
app.get('/kick.json',   kickHandler);
app.get('/reset.json',  resetHandler);

app.use('/ui', express.static('ui'))

app.listen(3000, () => console.log('Listening on port 3000!'));
