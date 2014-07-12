/**
 * forced-timeout.js - Enforce client-side session timeout.
 * Paul Duncan <pabs@pablotron.org>
 *
 * Usage
 * =====
 *
 * Enforce client-side session timeout of a web page.
 *
 * This script has no external dependencies and it should work in
 * browsers as old as IE7; in theory it should work as far back as IE5,
 * although I have not confirmed this.
 *
 * To use, simply include forced-timeout.js your page:
 *
 *     <script type='text/javascript' src='forced-timeout.js'></script>
 *
 * The session expiration time and message can be configured using
 * optional <meta> tags, like this:
 *
 *     <!-- set timeout to 5 minutes and message to "Later, Skater!" -->
 *     <meta id='x-forced-timeout-time' value='5'/>
 *     <meta id='x-forced-timeout-text' value='Later, Skater!'/>
 *
 *     <!-- load forced-timeout.js -->
 *     <script type='text/javascript' src='forced-timeout.js'></script>
 *
 * You can also use the x-forced-timeout-debug meta tag to set the
 * expiration time to 10 seconds (for debugging):
 *
 *     <!-- set session timeout to 10 seconds -->
 *     <meta id='x-forced-timeout-debug' value='1'/>
 *
 * If you need to do some cleanup or automatically redirect to an
 * authentication page, you can listen for a forcedtimeout event on the
 * document element:
 *
 *     // sample function
 *     function bye() {
 *       alert('bye!');
 *     }
 *
 *     // do something after forcedtimeout event
 *     if (document.addEventListener) {
 *       // modern browsers, ie9+
 *       document.addEventListener('forcedtimeout', bye, false);
 *     } else {
 *       // ie8 and earlier (ie7 and earlier, in particular, do not
 *       // support "fake" events)
 *       document.onforcedtimeout = bye;
 *     }
 *
 * By design, the forcedtimeout event triggers _after_ the session
 * timeout has occurred, so stopping the event will not prevent the
 * timeout.
 *
 * License
 * =======
 * Copyright (C) 2014 Paul Duncan <pabs@pablotron.org>
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *   * The names of contributors may not be used to endorse or promote
 *     products derived from this software without specific prior written
 *     permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
(function(D, P) {
  "use strict";

  // version string
  var VERSION = '0.1.0';

  /**
   * DEFAULTS - default settings
   *
   * Can be overridden by x-forced-timeout-KEY tags.
   *
   */
  var DEFAULTS = {
    // time (in minutes) before session expiration
    time:   30,

    // message to replace page contents with on expiration
    text:   'Session Expired.',

    // space-delimited list of events to watch for
    events: 'mousemove keyup',

    // set to '1' to force expiration time to 10 seconds and polling
    // interval to 5 seconds
    debug:  ''
  };

  // internal state
  var ival = 0, last = 0, init = false;

  /**
   * now() - get current timestamp in milliseconds
   */
  function now() {
    return (new Date()).getTime();
  }

  /**
   * on() - register document event handler
   */
  function on(name, fn) {
    if (D.addEventListener) {
      try {
        D.addEventListener(name, fn, false);
      } catch (e) {
        D.addEventListener(name, fn);
      }
    } else if (D.attachEvent) {
      // support ie<9
      D.attachEvent('on' + name, fn);
    } else {
      // we could chain onload here for really pathologically old
      // and/or broken browsers, but instead just throw an error

      throw 'on(): unsupported browser';
    }
  }

  /**
   * make_event() - create new event object
   */
  function make_event(type) {
    var r;

    if (D.createEvent) {
      // modern browsers
      r = D.createEvent("HTMLEvents");
      r.initEvent(type, true, false);
    } else if (D.createEventObject) {
      // ie<9
      r = D.createEventObject();
    } else {
      // pathological and/or old browser
      throw 'make_event(): unsupported browser';
    }

    return r;
  }

  /**
   * can_fake_events() - can this browser handle non-DOM events?
   */
  var can_fake_events = (function() {
    var cached = false, r = null;

    function test() {
      var type = 'forcedtimeoutfakeevent',
          e = make_event(type);

      try {
        if (D.dispatchEvent) {
          // modern browsers
          D.dispatchEvent(e);
        } else if (D.fireEvent) {
          // ie<9
          D.fireEvent('on' + type);
        } else {
          // pathological and/or old browser
          return false;
        }

        // browser supports synthesized events
        return true;
      } catch (err) {
        // browser doesn't support synthesized events
        return false;
      }
    }

    return function() {
      if (!cached) {
        // don't run more than once
        cached = true;

        // cache result
        r = test();
      }

      // return result
      return r;
    };
  })();

  /**
   * fire() - fire event on document object
   */
  function fire(type) {
    if (can_fake_events()) {
      var e = make_event(type);

      if (D.dispatchEvent) {
        // modern browsers
        D.dispatchEvent(e);
      } else if (D.fireEvent) {
        // ie<9
        D.fireEvent('on' + type);
      } else {
        // pathological and/or old browser
        throw 'fire(): unsupported browser';
      }
    } else if (D['on' + type]) {
      // browser does not support fake events, but it does have
      // a handler defined on the document, so call that instead
      D['on' + type]();
    } else {
      // don't do anything
    }
  }

  /**
   * ready() - register document ready handler
   */
  function ready(fn) {
    if (D.addEventListener) {
      // modern browsers
      on('DOMContentLoaded', fn);
    } else if (D.attachEvent) {
      // handle ie<9
      on('readystatechange', function() {
        if (D.readyState == 'complete')
          fn();
      });
    } else {
      // we could chain onreadystatechange here for really
      // pathologically old and/or broken browsers, but instead just
      // throw an error

      throw 'ready(): unsupported browser';
    }
  }

  /**
   * get() - get configuration value
   */
  function get(id) {
    var e = D.getElementById(P + id);
    return e ? e.getAttribute('value') : DEFAULTS[id];
  }

  /**
   * reset() - reset timeout
   */
  function reset() {
    // reset timestamp
    last = now();
  }

  /**
   * expire() - replace page with session expired text
   */
  function expire(text) {
    // clear interval
    clearInterval(ival);

    // clear page
    D.body.innerText = text;

    // fire event after page has been cleared
    fire('forcedtimeout');
  }

  // init
  ready(function() {
    // prevent double-init
    if (init)
      return;
    init = true;

    // get debug, delay, expiration text, user events, and poll interval
    var debug = !!get('debug'), // coerce to boolean
        time  = parseInt(get('time'), 10) * 60000,
        text  = get('text'),
        evs   = get('events').split(/\s+/),
        poll  = 60000;

    // is debugging enabled?
    if (debug) {
      // set timeout to 10 seconds
      time = 10000;

      // set polling interval to 5 seconds
      poll = 5000;
    }

    // watch for user activity
    for (var i = 0, l = evs.length; i < l; i++)
      on(evs[i], reset);

    // init timestamp
    reset();

    // poll once a minute for timeout
    ival = setInterval(function() {
      if (now() - time > last)
        expire(text);
    }, poll);
  });
})(document, 'x-forced-timeout-');
