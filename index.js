;process.title = "smhexprsrv" // name can't be much longer; matches with stop in package.json

var express = require('express');
var request = require('request');
var cors = require('cors')
var _ = require('underscore');

const NodeCache = require( "node-cache" );

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
var app = express();

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// app.use(cors());

const startState = {
  Question: "IDK",
  Voters: 
  
  // {
  //   "Ryan":     { "Vote": "7"   },
  //   "Deshawn":  { "Vote": "100" },
  //   "Paco":     { "Vote": "10"  },
  //   "Maqbool":  { "Vote": "?"   },
  // }
  [
    {"Name": "Ryan",    "Vote": "7"},
    {"Name": "Deshawn", "Vote": "3"},
    {"Name": "Maqbool", "Vote": "?"}
  ]
};
var state = startState;

// app.get('/b/:to', function(req, res){
//   var url = redirs[req.params.to];
//   req.pipe(request(url)).pipe(res);
// });

var getState = function(req, res){
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify(state));
};
var setState = function(req, res) {
  res.header('Content-Type', 'application/json');
  if (typeof req.params.Voter !== "undefined") {
    state.Voters[req.params.Voter.Name] = state.Voters[req.params.Voter.Name] || {};
    if (typeof req.params.Voter.Name !== "undefined") {
      state.Voters[req.params.Voter].Name = req.params.Voter.Name;      
    }
    if (typeof req.params.Voter.Vote !== "undefined") {
      state.Voters[req.params.Voter].Vote = req.params.Voter.Vote;      
    }
  }

  if(typeof req.params.Question !== "undefined") {
    state.Question = req.params.Question;
  }
};

app.get('/state.json', getState);
app.get('/set.json', setState);


app.listen(3000, () => console.log('Listening on port 3000!'));
