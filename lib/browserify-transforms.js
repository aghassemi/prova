var debug = require("local-debug")('browserify');
var path = require('path');
var extname = require('path').extname;
var watchify = require('watchify');
var through = require('through');

var transformMap = {
  '.coffee': 'coffeeify',
  '.gs': 'gorillaify',
  '.iced': 'icsify',
  '.ls': 'liveify',
  '.coco': 'cocoify',
  '.ts': 'typescriptifier'
};

module.exports = function(files, command) {
  var ext = extname(files[0]);
  var transform = ext != '.js';
  var ret;
  if (transform) {
    ret = watchify(files, {
      extensions: [ext, '.js', '.json']
    });
  } else {
    ret = watchify(files);
  }

  if (transform) ret.transform(transformMap[ext]);

  if (command.transform && command.transform.length) {
    command.transform.split(',').forEach(function(name) {
      if (!name) return;
      debug('Transform "%s" enabled', name);
      ret.transform(name);
    });
  }

  ret.transform(function addFileName(file) {
    return through(write);

    function write(data) {
      if (files.indexOf(file) >= 0) {
        var filepath = path.relative(process.cwd(), file);
        if (command.includeFilenameAsPackage) {
          this.queue(';global._prova_includeFilenameAsPackage=' + true + ';');
          this.queue(';global._prova_filename=' + JSON.stringify(filepath) + ';');
        }

        if (command.stopOnFirstFailure) {
          this.queue(';global._prova_stopOnFirstFailure=' + true + ';');
        }
      }
      this.queue(data);
    }
  });


  if (command.plugin && command.plugin.length) {
    command.plugin.split(',').forEach(function(name) {
      if (!name) return;
      debug('Plugin "%s" enabled', name);
      ret.plugin(require(path.join(process.cwd(), 'node_modules', name)));
    });
  }

  return ret;
};