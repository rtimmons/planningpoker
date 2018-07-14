$(function(){
  var url = function(part) {
    return 'http://localhost:3000' + '/' + part + '.json';
  };

  var request = function(part, params) {
    return $.get({
      url: url(part),
      data: params,
      dataType: 'json',
    });
  };

  var updateState = function(part, params) {
    part = part || 'state';
    return request(part, params).done(function(resp){
      renderState(resp);
    });
  };

  var Question = $('#Question');
  var Name = $('#Name');
  var Voters = $('#Voters');

  var rowTemplate = Voters.find('.template').clone(true);

  var renderState = function(state) {
    var cloned = Voters.clone(true);
    cloned.empty();

    Question.find('input:not(:focus)').val(state.Question);

    for(var k in state.Voters) {
      var voteri = state.Voters[k];
      var row = rowTemplate.clone(true);
      row.find('.Name').html(voteri.Name);
      row.find('.Vote').html(voteri.Vote);
      cloned.append(row);
    }

    Voters.replaceWith(cloned);
    Voters = cloned;

    console.log(state);
  };

  setInterval(updateState, 1000);

});