$(function(){

  var Buttons = $('#Buttons');
  var Question = $('#Question');
  var Name = $('#Name');
  var Voters = $('#Voters');
  var Clear = $('#Clear');
  var Reset = $('#Reset');
  var Average = $('#Average');

  var rowTemplate = Voters.find('.template').clone(true);

  var MyName;

  var buttonLabelToPoint = {};
  var buttonPointToLabel = {};
  Buttons.find('button').each(function(){
    var t = $(this);
    var label = t.html().trim();
    var point = t.data('score');
    buttonLabelToPoint[label] = point;
    buttonPointToLabel[point] = label;
  });

  var url = function(part) {
    var loc = window.location.origin != "null" ? window.location.origin : 'http://localhost:3000';
    return loc + '/' + part + '.json';
  };

  var request = function(part, params) {
    return $.get({
      url: url(part),
      data: params,
      dataType: 'json',
    });
  };

  var updateState = function(part, params) {
    part   = part   || 'state';
    params = params || {};

    return request(part, params).done(function(resp){
      renderState(resp);
    });
  };

  var computeAverage = function(state) {
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

  var renderAverage = function(average) {
    average = average == 'NotDone' ? '🤔' : average;
    Average.find('span').html(average);
  };

  var renderState = function(state, forceShow) {
    var cloned = Voters.clone(true);
    cloned.empty(); // kill the obsolete rows

    // update the question but only if not focused(==has cursor)
    Question.find('input:not(:focus)').val(state.Question);

    var average = computeAverage(state);
    renderAverage(average);

    var showVotes = forceShow || (average != 'NotDone');

    for(var k in state.Voters) {
      var voteri = state.Voters[k];

      var row = rowTemplate.clone(true);
      row.find('.Name').html(voteri.Name);

      var label = buttonPointToLabel[voteri.Vote];
      if(!showVotes) {
        label = !_.isUndefined(voteri.Vote) ? '🙈' : '🤔';
      }
      row.find('.Vote').html(label);

      cloned.append(row);
    }

    // std::swap exists in jQuery
    Voters.replaceWith(cloned);
    Voters = cloned;
  };


  // hook things up

  setInterval(updateState, 1000);

  // need to use this versus .each cuz we create new a.kicks via .clone()
  Voters.on('click', 'a.kick', function(){
    // ohgod it's hard to be a parent these days
    updateState('kick',{Name: $(this).parent().parent().parent().find('.Name').html().trim()});
    return false;
  });

  $('#Buttons button').each(function(){
    var self = $(this); // prolly too pedantic
    self.click(() => {
      updateState('set', {Vote: buttonLabelToPoint[self.html().trim()], Name: MyName});
      return false;
    });
  });

  var onNameChange = function(){
    MyName = $(this).val();
    updateState('set', {Name: MyName});

    return false;
  };

  // 😹
  Name.find('input')
    .blur(onNameChange)
    .submit(onNameChange)
    .keyup(function(e){
      var code = e.which;
      if (code == 13) {
        return $(this).blur();
      }
    });

  // DRY mucho, vos?

  Question.find('input').keyup(function(){
    updateState('set', {Question: $(this).val()});
    return false;
  });

  Reset.click(function(){
    updateState('reset');
    window.location.reload();
    return false;
  });

  Clear.click(function(){
    updateState('clear');
    return false;
  });

  Name.find('input').val('');

  Name.find('input').focus();
  Name.submit(() => false);

  // TODO: support voting with keyboard
  // could just .click() the respective buttons
  // but this is capturing events when typing name 
  // (but not question for some reason)
  // so somebod with a C in their name would..like..clear the votes.
  // $('body').keyup(e => {
  //   if (e.which == 190) {} // .
  //   if (e.which == 48)  {} // 0
  //   if (e.which == 49)  {} // 1
  //   if (e.which == 50)  {} // 2
  //   if (e.which == 51)  {} // 3
  //   if (e.which == 53)  {} // 5
  //   if (e.which == 56)  {} // 8
  //   if (e.which == 67)  {} // c
  //   if (e.which == 81)  {} // q
  // })
});