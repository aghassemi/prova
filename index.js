var tape = require('tape');
var isNode = require("is-node");
var refine = require("./lib/refine");
var command = require('./lib/command');
var isProvaFrame = !isNode && document;
var nodeRequire = require;
var view, tests;

empty.skip = empty;
empty.only = empty;

if (command.launch === true) {
  nodeRequire('./lib/cli').launch();
  module.exports = empty;
  return;
}

if (command.examples) {
  nodeRequire('./lib/cli').examples();
  module.exports = empty;
  return;
}

if (command.browser) {
  nodeRequire('./lib/cli').launch();
  nodeRequire('./lib/browser')([require.main.filename], command);
} else if (isNode && !command.tap) {
  view = nodeRequire('./lib/node-reporter');
  tape.createStream({ objectMode: true }).pipe(refine()).pipe(view());
} else if (isProvaFrame) {
  htape = tape.createHarness();
  htape.skip = tape.skip;
  tape = htape;
  view = require('./lib/browser-reporter');
  tape.createStream({ objectMode: true }).pipe(refine()).pipe(view(tape._results._stream));
}

if (isNode) {
  tests = require('./lib/tests');
}

module.exports = prova;
module.exports.skip = skip;
module.exports.only = only;
module.exports.timeout = timeout;

function prova (title, fn) {
  if (command.browser) return;
  if (command.grep && title.indexOf(command.grep) == -1) return skip(title, fn);
  if (isNode) tests.add(title);
  return tape(title, function (t) {
    t.test = function() {
      // many reasons for this including:
      // tap output does not really support grouping.
      // prova overrides test() with prova() but t.test creates
      // a test() internally which is not the Prova version.
      throw 'Nested tests are not supported.';
    };
    t.timeout = function(ms) {
      t._timeout = ms;
    };

    try {
      fn.apply(this, arguments);
      _setupTestTimeout(t);
    } catch (err) {
      t.error(err);
      t.end();
      return;
    }
  });
}

function skip (title, fn) {
  tape(title + ' - skipped ', function(t) {
    t.skip(title);
    t.end();
  });
  return tape.skip(title, fn);
}

function only (title, fn) {
  return tape.only(title, fn);
}

var globalTimeout = 2000;
function timeout(ms) {
  globalTimeout = ms;
}

function empty () {}

function _setupTestTimeout(t) {
  var timeout = t._timeout || globalTimeout;
  if(timeout) {
    setTimeout(function failTestWhenTimedout() {
      if( t.ended ) {
        return;
      }
      t.end('Timeout, test did not finish in ' + timeout + 'ms');
      // prevents "end was called twice errors"
      t.end = function() {}
    }, timeout);
  }
}