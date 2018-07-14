;process.title = "smhexprsrv" // name can't be much longer; matches with stop in package.json

var express = require('express');
var request = require('request');
var cors = require('cors')

const NodeCache = require( "node-cache" );

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
var app = express();

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// app.use(cors());

var state = {
  Question: "IDK",
  Voters: [
    {"Name": "Ryan",    "Vote": "7"},
    {"Name": "Deshawn", "Vote": "3"},
    {"Name": "Maqbool", "Vote": "?"}
  ]
};

// app.get('/b/:to', function(req, res){
//   var url = redirs[req.params.to];
//   req.pipe(request(url)).pipe(res);
// });


app.get('/state.json', function(req, res){
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify(state));
});

app.listen(3000, () => console.log('Listening on port 3000!'));
