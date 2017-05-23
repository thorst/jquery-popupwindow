/*!
* Display popup window.
*
* Requires: jQuery v1.3.2
* IE >= 9
* 
*/
(function ($) {

    var defaults = {
        center: "screen", //true, screen || parent || undefined, null, "", false
        createNew: true,
        height: 500,
        left: 0,
        location: false,
        menubar: false,
        name: null,
        onUnload: null,
        resizable: false,
        scrollbars: false, // os x always adds scrollbars
        status: false,
        toolbar: false,
        top: 0,
        width: 500,
        forcerefresh: true,
        directories: false,
        titlebar: false,
        chromeHeight: window.innerHeight - window.outerHeight
    };

    $.popupWindow = function (url, opts) {
        if ($.isPlainObject(url)) {
            opts = url;
            url = opts.url;
        }
        var options = $.extend({}, defaults, opts);

        var screenLeft = (typeof window.screenLeft !== 'undefined') ? window.screenLeft : screen.left;
        var screenTop = (typeof window.screenTop !== 'undefined') ? window.screenTop : screen.top;
        //alert(screenLeft + " x " + screenTop);
        //ff 1680 x 0
        //ie8 1680 x 78

        // center the window
        if (options.center === "parent") {
            //alert(window.screenX);//1672, undefined
            //alert(window.screenLeft);//"", 1680
            //alert(screen.left);//1680, undefined


            //alert(window.screenY);//-8, undefined
            //alert(window.screenTop);//"", 78
            //alert(screen.top);//0, undefined

            options.top = Math.round(($(window).height() - options.height) / 2);
            options.left = screenLeft + Math.round(($(window).width() - options.width) / 2);
        } else if (options.center === true || options.center === "screen") {
            // 50px is a rough estimate for the height of the chrome above the
            // document area

            // take into account the current monitor the browser is on
            // this works in Firefox, Chrome, but in IE there is a bug
            // https://connect.microsoft.com/IE/feedback/details/856470/ie11-javascript-screen-height-still-gives-wrong-value-on-secondary-monitor

            // IE reports the primary monitor resolution. So, if you have multiple monitors IE will
            // ALWAYS return the resolution of the primary monitor. This is a bug, and there is an
            // open ticket with IE for it. In chrome and firefox it returns the monitor that the
            // browser is currently located on. If the browser spans multiple monitors, whichever
            // monitor the browser has the most real estate on, is the monitor it returns the size for.

            // What this means to the end users:
            // If they have multiple monitors, and their multiple monitors have different resolutions,
            // and they use internet explorer, and the browser is currently located on a secondary
            // monitor, the centering will not be perfect as it will be based on the primary monitors
            // resolution. As you can tell this is pretty edge case.
           

            options.top = ((screen.height - options.height) / 2) + options.chromeHeight;
            options.left = screenLeft + (screen.width - options.width) / 2;
        }

        // params
        var params = [];
        params.push('location=' + (options.location ? 'yes' : 'no'));
        params.push('menubar=' + (options.menubar ? 'yes' : 'no'));
        params.push('toolbar=' + (options.toolbar ? 'yes' : 'no'));
        params.push('directories=' + (options.directories ? 'yes' : 'no'));
        params.push('titlebar=' + (options.titlebar ? 'yes' : 'no'));
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

    $.popupWindow.repos = function (win, options) {
        // center the window
        if (options.center === "parent") {
            options.top = window.screenY + Math.round(($(window).height() - options.height) / 2);
            options.left = window.screenX + Math.round(($(window).width() - options.width) / 2);
        } else if (options.center === true || options.center === "screen") {
            // 50px is a rough estimate for the height of the chrome above the
            // document area

            // take into account the current monitor the browser is on
            // this works in Firefox, Chrome, but in IE there is a bug
            // https://connect.microsoft.com/IE/feedback/details/856470/ie11-javascript-screen-height-still-gives-wrong-value-on-secondary-monitor

            // IE reports the primary monitor resolution. So, if you have multiple monitors IE will
            // ALWAYS return the resolution of the primary monitor. This is a bug, and there is an
            // open ticket with IE for it. In chrome and firefox it returns the monitor that the
            // browser is currently located on. If the browser spans multiple monitors, whichever
            // monitor the browser has the most real estate on, is the monitor it returns the size for.

            // What this means to the end users:
            // If they have multiple monitors, and their multiple monitors have different resolutions,
            // and they use internet explorer, and the browser is currently located on a secondary
            // monitor, the centering will not be perfect as it will be based on the primary monitors
            // resolution. As you can tell this is pretty edge case.
            var screenLeft = (typeof window.screenLeft !== 'undefined') ? window.screenLeft : screen.left;

            options.top = ((screen.height - options.height) / 2) + options.chromeHeight;
            options.left = screenLeft + (screen.width - options.width) / 2;
        }
     
        win.resizeTo(options.width, options.height);
        win.moveTo(options.left, options.top);
    };
})(jQuery);
