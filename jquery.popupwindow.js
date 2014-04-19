/*!
* Display popup window.
*
* Requires: jQuery v1.3.2
*/
(function($) {
  var defaults = {
    center:      true,
    createNew:   true,
    height:      500,
    left:        0,
    location:    false,
    menubar:     false,
    name:        null,
    onUnload:    null,
    resizable:   false,
    scrollbars:  false, // os x always adds scrollbars
    status:      false,
    toolbar:     false,
    top:         0,
    width:       500,
    forcerefresh:true
  };

  $.popupWindow = function(url, opts) {
    var options = $.extend({}, defaults, opts);

    // center the window
    if (options.center) {
      // 50px is a rough estimate for the height of the chrome above the
      // document area
      options.top = ((screen.height - options.height) / 2) - 50;
      options.left = (screen.width - options.width) / 2;
    }

    // params
    var params = [];
    params.push('location=' + (options.location ? 'yes' : 'no'));
    params.push('menubar=' + (options.menubar ? 'yes' : 'no'));
    params.push('toolbar=' + (options.toolbar ? 'yes' : 'no'));
    params.push('scrollbars=' + (options.scrollbars ? 'yes' : 'no'));
    params.push('status=' + (options.status ? 'yes' : 'no'));
    params.push('resizable=' + (options.resizable ? 'yes' : 'no'));
    params.push('height=' + options.height);
    params.push('width=' + options.width);
    params.push('left=' + options.left);
    params.push('top=' + options.top);

    // define name
    var random = new Date().getTime();
    var name = options.name || (options.createNew ? 'popup_window_' + random : 'popup_window');

    // setup list of handles if needed, and check if win handle exists
    var winPOS = -1;
    if (!$.popupWindow.win) { $.popupWindow.win = []; }
    for (var i = 0, len = $.popupWindow.win.length; i < len; i++) {
      if ($.popupWindow.win[i].name === name) { winPOS = i; break; }
    }      

    // add to list of handles if it didnt already exist
    var winHref;
    if (winPOS === -1) {
      $.popupWindow.win.push({ name: name, win: { closed: true } });
      winPOS = $.popupWindow.win.length - 1;
      
      // try regaining access to the handle, if user refreshed but didnt close all popups
      // this will fail if its of a different origin
      $.popupWindow.win[winPOS].win = window.open("", name, params.join(','));
      try { winHref = $.popupWindow.win[winPOS].win.location.href; } catch (e) { }
    }
        
    // determine whether to open window
    // the user wants to always refresh, the handle says its closed, the href is a new page
    // winHref could be 3 possible values
    // 1. undefined - this failed the assignment above, due to different origin - dont reload url
    // 2. some url - this passed the assignment above, must be same origin - dont reload url
    // 3. about:blank - the window didnt exist and the user now has a blank window - reload url
    if (options.forcerefresh || $.popupWindow.win[winPOS].win.closed || winHref === "about:blank") {
      $.popupWindow.win[winPOS].win = window.open(url, name, params.join(','));
    }

    // unload handler
    if (options.onUnload && typeof options.onUnload === 'function') {
      var unloadInterval = setInterval(function () {
        if (!$.popupWindow.win[winPOS].win || $.popupWindow.win[winPOS].win.closed) {
          clearInterval(unloadInterval);
          options.onUnload();
        }
      }, 50);
    }

    // focus window
    if ($.popupWindow.win[winPOS].win && $.popupWindow.win[winPOS].win.focus) {
      $.popupWindow.win[winPOS].win.focus();
    }       

    // return handle to window
    return $.popupWindow.win[winPOS].win;
  };
})(jQuery);
