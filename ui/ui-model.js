var $ = jQuery;

const url = function(part) {
  var loc = window.location.origin !== "null"
    ? window.location.origin : 'http://localhost:3000';
  return loc + '/' + part + '.json';
};

const request = function(part, params) {
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
    this._anyPendingVoters = this.votes.length === 0 || _.any(this.votes, v => _.isUndefined(v) || v === '');
    this._allSame = this.votes.length === 0 || _.all(this.votes, v => v === this.votes[0]);
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

  renderableVotes(myName, buttonPointToLabel) {
    const showVotes = !this.anyPendingVoters();
    return this.eachVoter(v => {
      return {
        Name: v.Name,
        Label: showVotes || v.Name === myName ?
          buttonPointToLabel[v.Vote] :
          (_.isUndefined(v.Vote) ? '🤔': '🙈')
      }
    });
  }

  reward() {
    return this.anyPendingVoters() ? '🤔'
          : (this.allSame() ? '🍦' : '😼');
  }

  logbook() {
    return this.serverState.Logbook || {};
  }

  computeAverage() {
    let sum = 0.0;
    let n = 0.0;

    let allDone = true;
    let allNumbers = true;
    for(let k in (this.serverState.Voters || [])) {
      if (_.isUndefined(this.serverState.Voters[k].Vote)) {
        allDone = false;
      }
      const points = parseInt(this.serverState.Voters[k].Vote);
      if (_.isNaN(points)) {
        allNumbers = false;
      }
      sum += points;
      ++n;
    }
    return allDone && allNumbers ?
       (sum/(n||1)).toFixed(2)
    : (!allDone ? '🤔' : '😱');
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
    this.Logbook = $('#Logbook');
    this.AddToLogbook = $('#AddToLogbook');

    // TODO: rename to voteRowTemplate
    this.rowTemplate = this.Voters.find('.template').clone(true);
    this.logbookTemplate = this.Logbook.find('.template').clone(true);

    this.MyName = window.cookies.get('Name');

    this.buttonLabelToPoint = {};
    this.buttonPointToLabel = {};

    this._init();
  }

  // public

  updateState(part, params) {
    return request(part || 'state', params || {}).done(resp => {
      this._renderState(resp);
    });
  }

  // helpers

  _registerVoteButton($b) {
    const label = $b.text().trim();
    const score = $b.data('score');
    this.buttonLabelToPoint[label] = score;
    this.buttonPointToLabel[score] = label;
  }

  // Inits

  _init() {
    this._initInputs();
    this._initButtons();
  }

  _initButtons() {
    const self = this;
    this.Buttons.find('button')
      .each(function(){
        return self._registerVoteButton($(this));
      })
      .click(function() {
        return self._handleVoteClick($(this));
      });

    // need to use this versus .each cuz we create new a.kicks via .clone()
    this.Voters.on('click', 'a.kick', function(){
      return self._handleKickClick($(this));
    });

    this.Logbook.on('click', 'a.remove', function(){
      return self._handleLogbookRemoveClick($(this));
    });

    this.AddToLogbook.click(function(){
      return self._handleAddToLogbookClick();
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
      .keyup(() => {
        if (e.which === 13) { // enter
          return $(this).blur();
        }
      });

    this.Name.find('input').val(this.MyName || '');
    this.Name.find('input').focus();
  }

  // Handlers (bound in _init methods)

  _handleKickClick($b) {
    // ohgod it's hard to be a parent these days
    this.updateState('kick',{Name: $b.parent().parent().parent().find('.Name').text().trim()});
    return false;
  }

  questionValue() {
    return this.Question.find('input').val();
  }

  _handleAddToLogbookClick() {
    this.updateState('recordlog', {
      ID: new Date().getTime(),
      Question: this.questionValue(),
      Vote: this.Average.text(),
    });
    // TODO: rename or refactor, we're not handling a click just want to clear votes
    this._handleClearClick();
    this.Question.find('.input').val('').focus();
    return false;
  }

  _handleLogbookRemoveClick($b) {
    this.updateState('removelog', {ID: $b.parent().parent().parent().find('.ID').text().trim()});
    return false;
  }

  _handleVoteClick($b) {
    if (_.isUndefined(this.MyName) || this.MyName === '') {
      this.Name.find('input').focus();
      return false;
    }
    this.updateState('set', {
      Vote: this.buttonLabelToPoint[$b.text().trim()],
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

  // renders

  // called by updateState (which is periodically run)
  _renderState(state) {
    state = new State(state);
    this._renderQuestion(state);
    this._renderAverage(state);
    this._renderVoteTable(state);
    this._renderLogbook(state);
    this._renderIceCream(state);
  }

  _renderAverage(state) {
    this.Average.find('span').text(state.computeAverage());
  }

  _renderIceCream(state) {
    this.MaybeIceCream.text(state.reward());
  }

  _renderQuestion(state) {
    // update the question but only if not focused(==has cursor)
    this.Question.find('input:not(:focus)').val(state.question());
  }

  _renderLogbook(state) {
    const logbookTable = this._generateLogbookTable(state);
    this.Logbook.replaceWith(logbookTable);
    this.Logbook = logbookTable;
  }

  _generateLogbookTable(state) {
    const cloned = this.Logbook.clone(true).empty();
    const book = state.logbook();
    for(let k in book) {
      const entry = book[k];
      cloned.append(this.logbookTemplate.clone(true)
        .find('.Question').text(entry.Question).end()
        .find('.Vote').text(entry.Vote).end()
        .find('.ID').text(k).end()
      );
    }
    return cloned;
  }

  _renderVoteTable(state) {
    const voteTable = this._generateVoteTable(state);
    this.Voters.replaceWith(voteTable);
    this.Voters = voteTable;
  }

  _generateVoteTable(state) {
    const cloned = this.Voters.clone(true).empty();
    _.each(state.renderableVotes(this.MyName, this.buttonPointToLabel),voteri => {
      cloned.append(this.rowTemplate.clone(true)
        .find('.Name').text(voteri.Name).end()
        .find('.Vote').text(voteri.Label).end()
      );
    });
    return cloned;
  }

}
