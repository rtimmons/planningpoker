$(function(){

  var Question = $('#Question');
  var Name = $('#Name');
  var Voters = $('#Voters');
  var Clear = $('#Clear');
  var Reset = $('#Reset');
  var rowTemplate = Voters.find('.template').clone(true);

  var MyName = 'Ryan'; // TODO


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

  var renderState = function(state) {
    var cloned = Voters.clone(true);
    cloned.empty(); // kill the obsolete rows

    // update the question but only if not focused(==has cursor)
    Question.find('input:not(:focus)').val(state.Question);

    for(var k in state.Voters) {
      var voteri = state.Voters[k];
      var row = rowTemplate.clone(true);
      row.find('.Name').html(voteri.Name);
      row.find('.Vote').html(voteri.Vote);
      cloned.append(row);
    }

    // std::swap exists in jQuery
    Voters.replaceWith(cloned);
    Voters = cloned;
  };

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
      updateState('set', {Vote: self.html(), Name: MyName});
      return false;
    });
  });

  // 😹
  Name.find('input').focusout(function(){
    MyName = $(this).val();
    updateState('set', {Name: MyName});
    return false;
  });

  // DRY mucho, vos?

  Question.find('input').keyup(function(){
    updateState('set', {Question: $(this).val()});
    return false;
  });

  Reset.click(function(){
    updateState('reset');
    return false;
  });

  Clear.click(function(){
    updateState('clear');
    return false;
  });

  Name.find('input').val('');
  Name.find('input').focus();
  Name.submit(() => false);
});