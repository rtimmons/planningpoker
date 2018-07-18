const Promise = require('promise');
const _ = require('underscore');
const deepcopy = require('deepcopy');

/*
Business-logic for back-end.
This is about at its limit for complexity without some refactoring
and/or automated testing!
*/

/*
 20 voters max at (10 + 50)=60 chars per => max of 20*60=1200 bytes-ish + 100 for the question
 => we can consume on the order of 2kb of memory :)
*/
const QUESTION_LIMIT = 100;
const MAX_VOTERS     = 20;
const NAME_LIMIT     = 50;
const VOTE_LIMIT     = 10;


var timestamp = function() { return new Date().getTime(); };

const startState = {
  Question: "So, uh, how's that Python 3 coming along?",
  Voters: [
    // 英津子 is "Etsuko" 👘
    {"Name": "英津子",   "Vote": "8", "LastVoteTS": timestamp()},
    {"Name": "Deshawn", "Vote": "3", "LastVoteTS": timestamp()},
    {"Name": "Maqbool", "Vote": "😫?", "LastVoteTS": timestamp()}
  ]
};
var state = deepcopy(startState);

var shorten = function(str, max) {
  return (_.isUndefined(str) || !_.isString(str)) ? str : (str.length >= max ? str.substring(0,max-1) : str);
}

var getStateJson = function() {
  if ((state.Voters || []).length >= MAX_VOTERS) {
    return reset();
  }
  return Promise.resolve(JSON.stringify(state));
};

var setState = function(question, vname, vote) {
  var existing, voter;

  // can set question even if other errors
  state.Question = question || state.Question;
  state.Question = shorten(state.Question, QUESTION_LIMIT);

  if (!(vname || !_.isUndefined(vote))) { return; }

  vname = shorten(vname, NAME_LIMIT);

  voter = _.find(state.Voters, (v) => v.Name == vname);
  existing = ! _.isUndefined(voter);

  if (!existing && (_.isUndefined(vname) || vname === '')) {
    throw `WTF with question=${question}, vname=${vname}, vote=${vote}`;
  }

  voter = voter || {};

  voter.Name = vname || voter.Name;
  voter.Name = shorten(voter.Name, NAME_LIMIT);

  voter.Vote = vote || voter.Vote;
  voter.Vote = shorten(voter.Vote, VOTE_LIMIT);

  voter.LastVoteTS = timestamp();

  if (!existing) {
    state.Voters.push(voter);
  }

  return getStateJson();
};

var kick = function(vname) {
  vname = shorten(vname, NAME_LIMIT);
  state.Voters = _.reject(state.Voters, (v) => v.Name == vname);

  return getStateJson();
}

var reset = function() {
  state = deepcopy(startState);

  return getStateJson();
}

var clear = function() {
  _.each(state.Voters, v => {
    delete v.Vote;
  });

  return getStateJson();
};

module.exports = {
  clear: clear,
  reset: reset,
  kick: kick,
  setState: setState,
  getStateJson: getStateJson,
};
