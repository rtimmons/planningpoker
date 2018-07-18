const _ = require('underscore');
const  deepcopy = require('deepcopy');

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


var getStateJson = function() {
  return JSON.stringify(state);
};

var setState = function(question, vname, vote) {
  var existing, voter;

  // can set question even if other errors
  state.Question = question || state.Question;

  if (!(vname || !_.isUndefined(vote))) { return; }

  voter = _.find(state.Voters, (v) => v.Name == vname);
  existing = ! _.isUndefined(voter);

  if (!existing && (_.isUndefined(vname) || vname === '')) {
    throw `WTF with question=${question}, vname=${vname}, vote=${vote}`;
  }

  voter = voter || {};

  voter.Name = vname || voter.Name;
  voter.Vote = vote  || voter.Vote;
  voter.LastVoteTS = timestamp();

  if (!existing) {
    state.Voters.push(voter);
  }
};

var kick = function(vname) {
  state.Voters = _.reject(state.Voters, (v) => v.Name == vname);
}

var reset = function() {
  state = deepcopy(startState);
}

var clear = function() {
  _.each(state.Voters, v => {
    delete v.Vote;
  });
  // delete state.Question;
};

module.exports = {
  clear: clear,
  reset: reset,
  kick: kick,
  setState: setState,
  getStateJson: getStateJson,
};
