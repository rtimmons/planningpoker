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
  var ui = new UI({
    container: $('#Container'),
  });

  setInterval(() => ui.updateState(), 1000);
});