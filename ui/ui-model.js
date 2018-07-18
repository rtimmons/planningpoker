var url = function(part) {
  var loc = window.location.origin != "null" 
    ? window.location.origin : 'http://localhost:3000';
  return loc + '/' + part + '.json';
};

var request = function(part, params) {
  return $.get({
    url: url(part),
    data: params,
    dataType: 'json',
  });
};

class State {
  constructor(serverState) {
    this.serverState = serverState;
    this.votes = _.collect(this.serverState.Voters || [], v => v.Vote);
    this._anyPendingVoters = this.votes.length == 0 || _.any(this.votes, v => _.isUndefined(v) || v === '');
    this._allSame = this.votes.length == 0 || _.all(this.votes, v => v === this.votes[0]);
  }
  
  question() {
    return this.serverState.Question;
  }
  
  anyPendingVoters() {
    return this._anyPendingVoters;
  }
  allSame() {
    return this._allSame;
  }
  eachVoter(f) {
    return _.collect(this.serverState.Voters || [], v => f(v));
  }

  computeAverage(state) {
    var sum = 0.0;
    var n = 0.0;

    var allDone = true;
    var allNumbers = true;
    for(var k in (this.serverState.Voters || [])) {
      if (_.isUndefined(this.serverState.Voters[k].Vote)) {
        allDone = false;
      }
      var points = parseInt(this.serverState.Voters[k].Vote);
      if (_.isNaN(points)) {
        allNumbers = false;
      }
      sum += points;
      ++n;
    }
    return allDone && allNumbers ?
       (sum/(n||1)).toFixed(2)
    : (!allDone ? 'NotDone' : '😱');
  }
}

class UI {
  constructor(params) {
    this.Container = params.container;

    this.Buttons = $('#Buttons');
    this.Question = $('#Question');
    this.Name = $('#Name');
    this.Voters = $('#Voters');
    this.Clear = $('#Clear');
    this.Reset = $('#Reset');
    this.Average = $('#Average');
    this.MaybeIceCream = $('#MaybeIceCream');

    this.rowTemplate = this.Voters.find('.template').clone(true);

    this.MyName = window.cookies.get('Name');

    this.buttonLabelToPoint = {};
    this.buttonPointToLabel = {};

    this._init();
  }

  _registerVoteButton($b) {
    var label = $b.html().trim();
    var score = $b.data('score');
    this.buttonLabelToPoint[label] = score;
    this.buttonPointToLabel[score] = label;
  }

  _handleKickClick($b) {
    // ohgod it's hard to be a parent these days
    this.updateState('kick',{Name: $b.parent().parent().parent().find('.Name').html().trim()});
    return false;
  }

  _handleVoteClick($b) {
    if (_.isUndefined(this.MyName) || this.MyName === '') {
      this.Name.find('input').focus();
      return false;
    }
    this.updateState('set', {
      Vote: this.buttonLabelToPoint[$b.html().trim()],
      Name: this.MyName
    });
    return false;
  }

  _handleNameChange(changedTo) {
    this.MyName = changedTo;
    window.cookies.set('Name', this.MyName);

    this.updateState('set', {
      Name: this.MyName
    });
    return false;
  }

  _handleQuestionChange(changedTo) {
    this.updateState('set', {
      Question: changedTo
    });
    return false;
  }

  _handleResetClick() {
    this.updateState('reset').then(() => {
      window.location.reload();
    });
    return false;
  }

  _handleClearClick() {
    this.updateState('clear');
    return false;
  }

  _initButtons() {
    var self = this;
    this.Buttons.find('button')
      .each(function(){
        return self._registerVoteButton($(this));
      })
      .click(function() {
        return self._handleVoteClick($(this));
      });


    // need to use this versus .each cuz we create new a.kicks via .clone()
    this.Voters.on('click', 'a.kick', function(){
      self._handleKickClick($(this));
    });

    this.Reset.click(function(){
      return self._handleResetClick()
    });

    this.Clear.click(function(){
      return self._handleClearClick();
    });
  }

  _initInputs() {
    var self = this;
    this.Question.find('input').keyup(function(){
      return self._handleQuestionChange($(this).val());
    });

    var onNameChange = function(){
      return self._handleNameChange($(this).val());
    };

    this.Name.find('input')
      .blur(onNameChange)
      .submit(onNameChange)
      .keyup(function(e){
        if (e.which == 13) { // enter
          return $(this).blur();
        }
      });

    this.Name.find('input').val(this.MyName || '');
    this.Name.find('input').focus();
  }

  _init() {
    this._initInputs();
    this._initButtons();
  }

  _renderAverage(state) {
    var average = state.computeAverage();
    average = average == 'NotDone' ? '🤔' : average;
    this.Average.find('span').html(average);
  }

  _renderQuestion(state) {
    // update the question but only if not focused(==has cursor)
    this.Question.find('input:not(:focus)').val(state.question());
  }

  _generateVoteTable(state) {
    var cloned = this.Voters.clone(true);
    cloned.empty(); // kill the obsolete rows

    state.eachVoter(voteri => {
      var row = this.rowTemplate.clone(true);
      row.find('.Name').html(voteri.Name);

      var showVotes = !state.anyPendingVoters();

      var label = this.buttonPointToLabel[voteri.Vote];
      if(!showVotes && (this.MyName !== voteri.Name)) {
        label = !_.isUndefined(voteri.Vote) ? '🙈' : '🤔';
      }
      row.find('.Vote').html(label);

      cloned.append(row);
    });

    return cloned;
  }

  _renderVoteTable(state) {
    var voteTable = this._generateVoteTable(state);
    
    this.Voters.replaceWith(voteTable);
    this.Voters = voteTable;
  }

  _renderState(state) {
    state = new State(state);

    this._renderQuestion(state);
    this._renderAverage(state);
    this._renderVoteTable(state);
    this._renderIceCream(state);
  }

  _renderIceCream(state) {
    var allSame = state.allSame()
    var label = state.anyPendingVoters(state) ? '' : (allSame ? '🍦' : '😼')
    this.MaybeIceCream.html(label);
  }

  updateState(part, params) {
    return request(part || 'state', params || {}).done(resp => {
      this._renderState(resp);
    });
  }

}