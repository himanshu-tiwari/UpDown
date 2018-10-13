const server = require('./lib/server');
const workers = require('./lib/workers');


var app = {};

// init function
app.init = function() {
	// start the server
	server.init();

	// start the workers
	workers.init();
};

// execute init
app.init();

// export the app
module.exports = app;