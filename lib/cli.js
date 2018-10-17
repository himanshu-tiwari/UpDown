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