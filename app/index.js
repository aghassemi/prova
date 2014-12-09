var layout = require("./layout");
var run = require("./run");
var socket = require("./socket");
var options = require("./options");

socket(function (update) {
  if (!update || !update.message) return;
  if (update.message.start) {
    run(update.message.url);
  }

  if (update.message.restart) run();
});
