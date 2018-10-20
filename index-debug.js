const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');


var app = {};

// init function
app.init = function() {
	debugger;
	// start the server
	server.init();
	debugger;

	debugger;
	// start the workers
	workers.init();
	debugger;

	debugger;
	// start the CLI but make sure it starts last
	setTimeout(function() {
		cli.init();
	}, 50);
	debugger;

	debugger;
	var foo = 2;
	debugger;

	debugger;
	foo += 1;
	debugger;

	debugger;
	foo = foo * foo;
	debugger;

	debugger;
	// Call the init script that will throw
	exampleDebuggingProblem.init();
	debugger;
};

// execute init
app.init();

// export the app
module.exports = app;