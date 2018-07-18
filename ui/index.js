(function(win){
    win.cookies = {
        get: function(cname) {
          var ca = decodeURIComponent(document.cookie || '').split(';');
          for(var i = 0; i <ca.length; i++) {
              var pair = ca[i].split('=');
              if (pair[0].trim() == cname) { return pair[1].trim(); }
          }
          return "";
        },
        set: function(cname, cvalue) {
          var d = new Date();
          d.setTime(d.getTime() + (365*24*60*60*1000));
          document.cookie = cname + "=" + cvalue.trim() + ";" + "expires="+ d.toUTCString(); + ";path=/";
        },
    };
})(window);


$(function(){

  // TODO: #Container wrapper
  var ui = new UI({
    container: $('#Container'),
  });

  // hook things up

  setInterval(() => ui.updateState(), 1000);

  // need to use this versus .each cuz we create new a.kicks via .clone()
  ui.Voters.on('click', 'a.kick', function(){
    // ohgod it's hard to be a parent these days
    ui.updateState('kick',{Name: $(this).parent().parent().parent().find('.Name').html().trim()});
    return false;
  });

  $('#Buttons button').each(function(){
    var self = $(this); // prolly too pedantic
    self.click(() => {
      if (_.isUndefined(ui.MyName) || ui.MyName === '') {
        ui.Name.find('input').focus();
        return false;
      }
      ui.updateState('set', {Vote: ui.buttonLabelToPoint[self.html().trim()], Name: ui.MyName});
      return false;
    });
  });

  var onNameChange = function(){
    ui.MyName = $(this).val();
    window.cookies.set('Name', ui.MyName);
    ui.updateState('set', {Name: ui.MyName});

    return false;
  };

  // 😹
  ui.Name.find('input')
    .blur(onNameChange)
    .submit(onNameChange)
    .keyup(function(e){
      var code = e.which;
      if (code == 13) {
        return $(this).blur();
      }
    });

  // DRY mucho, vos?

  ui.Question.find('input').keyup(function(){
    ui.updateState('set', {Question: $(this).val()});
    return false;
  });

  ui.Reset.click(function(){
    ui.updateState('reset').then(() => {
      window.location.reload();
    });
    return false;
  });

  ui.Clear.click(function(){
    ui.updateState('clear');
    return false;
  });

  ui.Name.find('input').val(ui.MyName || '');

  ui.Name.find('input').focus();
  ui.Name.submit(() => false);

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