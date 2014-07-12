forced-timeout.js
=================

Links
-----
* Contact: Paul Duncan (<pabs@pablotron.org>)
* Home Page: <http://pablotron.org/forced-timeout/>
* Mercurial Repository: <http://hg.pablotron.org/forced-timeout/>

Overview
--------
Tiny JavaScript library to force client-side session timeout of a web
page.

After a set amount of inactivity the web page is cleared and the user
must reload in order to continue working.  Useful for complying with
baroque security requirements.

Why?  This script is:

  * less than 2k minified (see `forced-timeout.min.js`),

  * has no external dependencies (no jQuery/YUI/Sensha),

  * works in browsers as old as IE5, and

  * MIT licensed (use for whatever, I don't care)

Usage
-----
To use forced-timeout.js, simply add the following to your page:

    <script type='text/javascript' src='forced-timeout.min.js'></script>

See `test.html` for a complete example, or read on for additional
instructions.

The session expiration time and message can be configured using
optional `<meta>` tags, like this:

    <!-- set timeout to 5 minutes and message to "Later, Skater!" -->
    <meta id='x-forced-timeout-time' value='5'/>
    <meta id='x-forced-timeout-text' value='Later, Skater!'/>

    <!-- load forced-timeout.js -->
    <script type='text/javascript' src='forced-timeout.js'></script>

You can also use the x-forced-timeout-debug meta tag to set the
expiration time to 10 seconds (for debugging):

    <!-- set session timeout to 10 seconds -->
    <meta id='x-forced-timeout-debug' value='1'/>

If you need to do some cleanup or automatically redirect to an
authentication page, you can listen for a `forcedtimeout` event on
the document element:

    // sample function
    function bye() {
      alert('bye!');
    }

    // do something after forcedtimeout event
    if (document.addEventListener) {
      // modern browsers, ie9+
      document.addEventListener('forcedtimeout', bye, false);
    } else {
      // older browser fallback
      document.onforcedtimeout = bye;
    }

By design, the `forcedtimeout` event triggers _after_ the session
timeout has occurred, so stopping the event will not prevent the
timeout.

Configuration Options
---------------------
All configuration is optional.  That said, below is a full list of
configuration options that can be specified via `<meta>` tags:

 * x-forced-timeout-time: Time (in minutes) before session
   expiration.  Defaults to "30" if unspecified.  Example:

     `<meta id='x-forced-timeout-time' value='10'/>`

 * x-forced-timeout-text: Text to replace page contents with on
   session expiration.  Defaults to "Session Expired." if
   unspecified.  Example:

     `<meta id='x-forced-timeout-text' value='Later, Skater!'/>`

 * x-forced-timeout-events: Space-delimited list of events to watch
   for.  Defaults to "mousemove keyup" if unspecified.

     `<meta id='x-forced-timeout-events' value='mousemove scroll'/>`

 * x-forced-timeout-debug:  Set to '1' to force expiration time to 10
   seconds and polling interval to 5 seconds.  Useful for debugging.
   Defaults to "" if unspecified.  Example:

     `<meta id='x-forced-timeout-debug' value='1'/>`

Notes
-----
* Follow the instructions at the bottom of `forced-timeout.js`, to
  generate the minified version and documentation.

License
-------
Copyright (c) 2014 Paul Duncan <pabs@pablotron.org>

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.

  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

  * The names of contributors may not be used to endorse or promote
    products derived from this software without specific prior written
    permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.