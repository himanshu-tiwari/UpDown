const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');


var app = {};

// init function
app.init = function(callback) {
	// start the server
	server.init();

	// start the workers
	workers.init();

	// start the CLI but make sure it starts last
	setTimeout(function() {
		cli.init();
		callback();
	}, 50);
};

// Self-invoking only if required directly
if (require.main === module) {
	app.init(function(){});
}

// export the app
module.exports = app;