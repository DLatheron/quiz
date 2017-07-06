(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
/* globals gameServerAddress, gameServerPort, gameId */
'use strict';

const SocketReceiver = require('../common/SocketReceiver');

const socketReceiver = new SocketReceiver({
    gameServerAddress,
    gameServerPort,
    gameId
});

socketReceiver.start();

socketReceiver.on('open', () => {
    console.log('SocketReceiver is open');
});

socketReceiver.on('closed', () => {
    console.log('SocketReceiver is closed');
});

socketReceiver.on('error', (error) => {
    console.log(`SocketReceiver has errored ${error}`);
});

socketReceiver.on('text', (text) => {
    console.log(`SocketReceiver received message '${text}'`);
});

/*

// Wrapper to allow use of NetEvents on the client and server.
ws.on = (type, data) => { 
    console.log(`ws.on [${type}] ${data}`);
};

ws.onopen = (event) => {
    console.log('WebSocket connection opened');

    netEvents.add(ws);

    netEvents.on('JOINED', (connection) => {
        console.log('NET EVENTS FIRED!!!');
        const playerName = `Player_${connection.name}`;
        connection.send(`NAME ${playerName}`);
    });

    ws.send(`JOIN ${gameId}`);
};

ws.onmessage = (event) => {
    console.log(`ws.onmessage ${event.data}`);
    ws.on('text', event.data);
};

ws.onerror = (event) => {
    console.log(`WebSocket connection error: ${event.error}`);
    ws.on('error', event.error);
};

ws.onclose = (event) => {
    console.log('WebSocket connection closed');
};
*/
},{"../common/SocketReceiver":4}],3:[function(require,module,exports){
/* globals require, module */
'use strict';

const EventEmitter = require('events');

class NetEvents extends EventEmitter {
    constructor() {
        super();

        this._connections = [];
    }

    get connections() {
        return this._connections;
    }

    add(connection) {
        if (!this._connections.find((conn) => conn === connection)) {
            this._registerConnection(connection);
            return true;
        } else {
            return false;
        }
    }

    remove(connection) {
        const index = this._connections.findIndex((conn) => conn === connection);

        if (index !== -1) {
            this._unregisterConnection(connection, index);
            return true;
        } else {
            return false;
        }
    }

    splitPhrases(str) {
        return str.split(/\s*;\s*/);
    }

    splitWords(str) {
        // Match quoted string or individual words.
        const regex = /'(.*)'|"(.*)"|(\S+)/g;

        let words = [];
        let match = regex.exec(str);

        while (match !== null) {
            // Choose whichever matcher succeeds in extracting something.
            const word = match[1] || match[2] || match[3];
            words.push(word);
            match = regex.exec(str);
        }        

        return words;
    }

    parse(connection, str) {
        this.splitPhrases(str).forEach((phrase) => {
            const words = this.splitWords(phrase);

            if (words.length >= 1) {
                // Insert the connection as the first command argument.
                words.splice(1, 0, connection);
                this.emit.apply(this, words);
            }
        });
    }

    _registerConnection(connection) {
        const self = this;
        connection._netEventListener = (text) => {
            //console.info(`Parsing ${text}...`);
            self.parse(connection, text);
        };
        connection.on('text', connection._netEventListener);
        this._connections.push(connection);
    }

    _unregisterConnection(connection, index) {
        connection.removeListener('text', connection._netEventListener);
        delete connection._netEventListener;
        this._connections.splice(index, 1);
    }    
}


module.exports = NetEvents;

},{"events":1}],4:[function(require,module,exports){
/* globals module, WebSocket */
'use strict';

const EventEmitter = require('events');
const NetEvents = require('./NetEvents');


class SocketReceiver extends EventEmitter {
    constructor(options) {
        super();

        options = Object.assign(
            {},
            options
        );
        this._options = options;
        this._netEvents = new NetEvents();
    }

    start() {
        this._ws = new WebSocket(
            `ws://${this._options.gameServerAddress}:${this._options.gameServerPort}`
        );
        this._ws.onopen = this._onOpen.bind(this);
        this._ws.onmessage = this._onMessage.bind(this);
        this._ws.onerror = this._onError.bind(this);
        this._ws.onclose = this._onClose.bind(this);
    }

    send(message) {
        this._ws.send(message);
    }

    _onOpen(event) {
        console.log('WebSocket connection opened');

        this._netEvents.add(this);

        this._netEvents.on('JOINED', (connection) => {
            this.log('log', 'NET EVENTS FIRED!!!');
            const playerName = `Player_${connection.name}`;
            connection.send(`NAME ${playerName}`);
        });

        this.send(`JOIN ${this._options.gameId}`);

        this.emit('open');
    }

    _onMessage(event) {
        this.log('log', `ws.onmessage ${event.data}`);
        this.emit('text', event.data);
    }

    _onError(event) {
        this._ws.onerror = (event) => {
            this.log('log', `WebSocket connection error: ${event.error}`);
            this.emit('error', event.error);
        };
    }

    _onClose(event) {
        this._ws.onclose = (event) => {
            this.log('log', 'WebSocket connection closed');
            this.emit('closed');
        };    
    }

    log(type) {
        console[type].call(Array.prototype.slice.call(arguments, 1));
    }    
}

module.exports = SocketReceiver;

},{"./NetEvents":3,"events":1}]},{},[2]);
