var layout = require("./layout");
var run = require("./run");
var socket = require("./socket");
var options = require("./options");

socket(function (update) {
  if (!update || !update.message) return;
  if (update.message.start) {
  	var values = JSON.parse(update.message.options);
  	//options.write(values);
    run(update.message.url);
  }

  if (update.message.restart) run();
});
