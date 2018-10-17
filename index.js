const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');


var app = {};

// init function
app.init = function() {
	// start the server
	server.init();

	// start the workers
	workers.init();

	// start the CLI but make sure it starts last
	setTimeout(function() {
		cli.init();
	}, 50);
};

// execute init
app.init();

// export the app
module.exports = app;