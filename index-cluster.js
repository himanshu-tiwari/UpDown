const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const cluster = require('cluster');
const os = require('os');


var app = {};

// init function
app.init = function(callback) {
	// if we're on the master thread, start the background workers and the CLI
	if (cluster.isMaster) {
		// start the workers
		workers.init();

		// start the CLI but make sure it starts last
		setTimeout(function() {
			cli.init();
			callback();
		}, 50);

		// fork the process
		for (var i=0; i < os.cpus().length; i++) {
			cluster.fork();
		}
	} else {
		// if we're not on the master thread, start the server
		server.init();
	}
};

// Self-invoking only if required directly
if (require.main === module) {
	app.init(function(){});
}

// export the app
module.exports = app;