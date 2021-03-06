var debug = require("local-debug")('launch');
var style = require("style-format");
var exec = require('child_process').exec;

module.exports = launch;
module.exports.list = list;

function list () {
  launcher.detect(function (avail) {
    console.log(style('\n  {bold}Available Browsers:{reset} %s\n'), avail.map(function (b) {
      return b.name + ' v' + b.version;
    }).join(', '));
  });
}

function launch (url, options) {

  var defaultConfig = (process.env.HOME || process.env.USERDIR)
    + '/.config/browser-launcher';

  exec('rm -rf ' + defaultConfig, function() {
    var launcher = require("browser-launcher");
    launcher(function (error, start) {
      if (error) return console.error(error);

      start(url, options, function (error, ps) {
        if (error) return console.error(error);

        process.on('exit', function(code) {
          ps.kill('SIGTERM');
        });

        var extras = '';
        if (options.headless) extras += ' headlessly';
        if (options.proxy) extras += ' through ' + options.proxy;

        if (options.log) {
          var logStream = require('fs').createWriteStream(options.log, {flags: 'a'});
          ps.stdout.pipe(logStream);
          ps.stderr.pipe(logStream);
          extras += ' logging to ' + options.log
        }

        debug('Launched %s to visit %s%s.', options.browser, url, extras);
      });
    });
  });
}
