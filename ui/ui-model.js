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

    this.init();
  }

  init() {
    var self = this;
    this.Buttons.find('button').each(function(){
      var t = $(this);
      var label = t.html().trim();
      var point = t.data('score');
      self.buttonLabelToPoint[label] = point;
      self.buttonPointToLabel[point] = label;
    });

    // need to use this versus .each cuz we create new a.kicks via .clone()
    this.Voters.on('click', 'a.kick', function(){
      // ohgod it's hard to be a parent these days
      self.updateState('kick',{Name: $(this).parent().parent().parent().find('.Name').html().trim()});
      return false;
    });

    $('#Buttons button').each(function(){
      $(this).click(() => {
        if (_.isUndefined(self.MyName) || self.MyName === '') {
          self.Name.find('input').focus();
          return false;
        }
        self.updateState('set', {Vote: self.buttonLabelToPoint[$(this).html().trim()], Name: self.MyName});
        return false;
      });
    });

    var onNameChange = function(){
      this.MyName = $(this).val();
      window.cookies.set('Name', this.MyName);
      this.updateState('set', {Name: this.MyName});

      return false;
    };

    // 😹
    this.Name.find('input')
      .blur(onNameChange)
      .submit(onNameChange)
      .keyup(function(e){
        var code = e.which;
        if (code == 13) {
          return $(this).blur();
        }
      });

    // DRY mucho, vos?

    this.Question.find('input').keyup(function(){
      this.updateState('set', {Question: $(this).val()});
      return false;
    });

    this.Reset.click(function(){
      self.updateState('reset').then(() => {
        window.location.reload();
      });
      return false;
    });

    this.Clear.click(function(){
      this.updateState('clear');
      return false;
    });

    this.Name.find('input').val(this.MyName || '');

    this.Name.find('input').focus();
    this.Name.submit(() => false);
  }

  renderAverage(average) {
    average = average == 'NotDone' ? '🤔' : average;
    this.Average.find('span').html(average);
  }

  renderState(state, forceShow) {
    var cloned = this.Voters.clone(true);
    cloned.empty(); // kill the obsolete rows

    // update the question but only if not focused(==has cursor)
    this.Question.find('input:not(:focus)').val(state.Question);

    var average = this.computeAverage(state);
    this.renderAverage(average);

    var showVotes = forceShow || (average != 'NotDone');

    var votes = [];
    for(var k in state.Voters) {
      var voteri = state.Voters[k];
      votes.push(voteri.Vote);

      var row = this.rowTemplate.clone(true);
      row.find('.Name').html(voteri.Name);

      var label = this.buttonPointToLabel[voteri.Vote];

      if(!showVotes && (this.MyName !== voteri.Name)) {
        label = !_.isUndefined(voteri.Vote) ? '🙈' : '🤔';
      }
      row.find('.Vote').html(label);

      cloned.append(row);
    }

    // std::swap exists in jQuery
    this.Voters.replaceWith(cloned);
    this.Voters = cloned;

    if (!showVotes || votes.size == 0) {
      this.MaybeIceCream.html('');
    } else if (_.every(votes, (v) => v === votes[0])) {
      this.MaybeIceCream.html('🍦');
    } else {
      this.MaybeIceCream.html('😼');
    }
  }

  updateState(part, params) {
    part   = part   || 'state';
    params = params || {};

    var self = this;
    return request(part, params).done(resp => {
      self.renderState(resp);
    });
  }

  computeAverage(state) {
    var sum = 0.0;
    var n = 0.0;

    var allDone = true;
    var allNumbers = true;
    for(var k in (state.Voters || [])) {
      if (_.isUndefined(state.Voters[k].Vote)) {
        allDone = false;
      }
      var points = parseInt(state.Voters[k].Vote);
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