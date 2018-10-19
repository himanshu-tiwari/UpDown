/*
* CLI related tasks
*
*/

// dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');

class _events extends events{};
var e = new _events();

// Instantiate the CLI module object
var cli = {};

// Input handlers
e.on('man', function(str) {
	cli.responders.help();
});

e.on('help', function(str) {
	cli.responders.help();
});

e.on('exit', function(str) {
	cli.responders.exit();
});

e.on('stats', function(str) {
	cli.responders.stats();
});

e.on('list users', function(str) {
	cli.responders.listUsers();
});

e.on('more user info', function(str) {
	cli.responders.moreUserInfo(str);
});

e.on('list checks', function(str) {
	cli.responders.listChecks(str);
});

e.on('more check info', function(str) {
	cli.responders.moreCheckInfo(str);
});

e.on('list logs', function(str) {
	cli.responders.listLogs();
});

e.on('more log info', function(str) {
	cli.responders.moreLogInfo(str);
});

// Responders object
cli.responders = {};

// help/man
cli.responders.help = function() {
	console.log("You asked for help!");
};

// exit
cli.responders.exit = function() {
	process.exit(0);
};

// stats
cli.responders.stats = function() {
	console.log("You asked for stats!");
};

// list users
cli.responders.listUsers = function() {
	console.log("You asked to list users!");
};

// more user info
cli.responders.moreUserInfo = function(str) {
	console.log("You asked for more user info!", str);
};

// list checks
cli.responders.listChecks = function(str) {
	console.log("You asked for list checks!", str);
};

// more check info
cli.responders.moreCheckInfo = function(str) {
	console.log("You asked for more check info!", str);
};

// list logs
cli.responders.listLogs = function() {
	console.log("You asked to list logs!");
};

// more log info
cli.responders.moreLogInfo = function(str) {
	console.log("You asked for more log info!", str);
};

// Input processor
cli.processInput = function(str) {
	var str = typeof(str) === "string" && str.trim().length > 0 ? str.trim() : false;

	// Only process the input if the user actually wrote something, otherwise continue
	if (str) {
		// Codify the unique strings that identify the unique questions allowed to be asked
		var uniqueInputs = [
			'man',
			'help',
			'exit',
			'stats',
			'list users',
			'more user info',
			'list checks',
			'more check info',
			'list logs',
			'more log info'
		];

		// Go through the possible inputs, and emit an event when a match is found
		var matchFound = false;
		var counter = 0;

		uniqueInputs.some(function(input) {
			if (str.toLowerCase().indexOf(input) > -1) {
				matchFound = true;

				// Emit an event matching the unique input, and include the full string given by the user
				e.emit(input, str);
				return true;
			}
		});

		// If no match is found, tell the user to try again
		if (!matchFound) {
			console.log('Sorry. Try again!');
		}
	}
};

// init script
cli.init = function(argument) {
	// Send the start message to the console in dark blue
	console.log("\x1b[34m%s\x1b[0m", "This CLI is running!");

	// Start the interface
	var _interface = readline.createInterface({
		input : process.stdin,
		output : process.stdout,
		prompt : '>_ '
	});

	// create an initial prompt
	_interface.prompt(); 

	// handle each line of input separately
	_interface.on('line', function(str) {
		// Send to the input processor
		cli.processInput(str);

		// Re-initialise the promopt afterwards
		_interface.prompt();
	});

	// If the user stops the CLI, kill the associated process
	_interface.on('close', function() {
		process.exit(0);
	});
}


// export the module
module.exports = cli;