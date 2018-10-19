/*
* CLI related tasks
*
*/

// dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
const os = require('os');
const v8 = require('v8');
const _data = require('./data');

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
	var commands = {
		'exit' : 'Kill the CLI (and the rest of the application)',
		'man' : 'Show this help page (This is what you did just now.)',
		'help' : 'Alias of the "man" command',
		'stats' : 'Get statistics on the underlying operating system and resources utilisation',
		'list users' : 'Show a list of all the registered (undeleted) users of the system',
		'more user info --{userId}' : 'Show details of a specific user',
		'list checks --up --down' : 'Show a list of all the active checks in the system. The "--up" and the "--down" flags are bothe optional',
		'more check info --{checkId}' : 'Show details of a specific check',
		'list logs' : 'Show a list of all the log files available to be read (compressed and uncompressed)',
		'more log info --{fileName}' : 'Show details of a specific log file'
	};

	// Show a header for the help page that is as wide as the screen
	cli.horizontalLine();
	cli.centered('CLI MANUAL');
	cli.horizontalLine();
	cli.verticalSpace(2);

	// Show each command followed by its explanaiton in white and yellow respectively
	for (var key in commands) {
		if (commands.hasOwnProperty(key)) {
			var value = commands[key];
			var line = '\x1b[33m'+key+'\x1b[0m';
			var padding = 60 - line.length;

			for (var i = 0; i < padding; i++) {
				line += ' ';
			}
			line += value;
			console.log(line);
			cli.verticalSpace(1);
		}
	}

	cli.verticalSpace(1);
	cli.horizontalLine();
};

// Create a vertical space
cli.verticalSpace = function(lines) {
	lines = typeof(lines) === "number" && lines > 0 ? lines : 1;

	for (var i = 0; i < lines; i++) {
		console.log('');
	}
};

// Create a horizontal line across the screen
cli.horizontalLine = function() {
	// Get the available screen size
	var width = process.stdout.columns;

	var line = '';
	for (var i = 0; i < width; i++) {
		line += '-';
	}
	console.log(line);
};

// Create centered text on the screen
cli.centered = function(str) {
	str = typeof(str) === "string" && str.trim().length > 0 ? str.trim() : '';
	// Get the available screen size
	var width = process.stdout.columns;

	// calculate the left padding there should be
	var leftPadding = Math.floor((width - str.length) / 2);

	// put the left padding before the string itself
	var line = '';
	for (var i = 0; i < leftPadding; i++) {
		line += ' ';
	}
	line += str;
	console.log(line);
};

// exit
cli.responders.exit = function() {
	process.exit(0);
};

// stats
cli.responders.stats = function() {
	// compile an object of stats
	var stats = {
		'Load Average' : os.loadavg().join(' '),
		'CPU Count' : os.cpus().length,
		'Free Memory' : os.freemem(),
		'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
		'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
		'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
		'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
		'Uptime' : os.uptime() + ' Seconds'
	};

	// Show a header for the stats page that is as wide as the screen
	cli.horizontalLine();
	cli.centered('SYSTEM STATISTICS');
	cli.horizontalLine();
	cli.verticalSpace(2);

	// Show each stat
	for (var key in stats) {
		if (stats.hasOwnProperty(key)) {
			var value = stats[key];
			var line = '\x1b[33m'+key+'\x1b[0m';
			var padding = 60 - line.length;

			for (var i = 0; i < padding; i++) {
				line += ' ';
			}
			line += value;
			console.log(line);
			cli.verticalSpace(1);
		}
	}

	cli.verticalSpace(1);
	cli.horizontalLine();
};

// list users
cli.responders.listUsers = function() {
	_data.list('users', function(err, userIds) {
		if (!err && userIds && userIds.length > 0) {
			cli.verticalSpace();
			userIds.forEach(function(userId) {
				_data.read('users', userId, function(err, userData) {
					if (!err && userData) {
						var line = 'Name: ' + userData.firstName + ' ' + userData.lastName + ' Phone: ' + userData.phone + ' Checks: ';
						var numberOfChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;
						line += numberOfChecks;
						console.log(line);

						cli.verticalSpace();
					}
				});
			});
		}
	});
};

// more user info
cli.responders.moreUserInfo = function(str) {
	// get the id from the str variable
	var arr = str.split('--');
	var userId = typeof(arr[1]) === "string" && arr[1].trim().length > 0 ? arr[1].trim() : false;

	if (userId) {
		// Lookup the user
		_data.read('users', userId, function(err, userData) {
			if (!err && userData) {
				// Remove the hashed password
				delete userData.hashedPassword;

				// Print the JSON object of that user with text highlighting
				cli.verticalSpace();
				console.dir(userData, {'colors' : true});
				cli.verticalSpace();
			}
		});
	}
};

// list checks
cli.responders.listChecks = function(str) {
	_data.list('checks', function(err, checkIds) {
		if (!err && checkIds && checkIds.length > 0) {
			cli.verticalSpace();
			checkIds.forEach(function(checkId) {
				_data.read('checks', checkId, function(err, checkData) {
					if (!err && checkData) {
						var includeCheck = false;
						var lowerString = str.toLowerCase();

						// get the state, default to down
						var state = typeof(checkData.state) === 'string' ? checkData.state : 'down';

						// get the state, default to unknown
						var stateOrUnknown = typeof(checkData.state) === 'string' ? checkData.state : 'unknown';

						// if the user has specified the state, or hasn't specified any state, include the check accordingly
						if (lowerString.indexOf('--'+state) > -1 || (lowerString.indexOf('--down') == -1 && lowerString.indexOf('--up') == -1)) {
							var line = 'ID: ' + checkData.id + ' ' + checkData.method.toUpperCase() + ' ' + checkData.protocol + '://' + checkData.url + ' State: ' + stateOrUnknown;
							console.log(line);
							cli.verticalSpace();
						}
					}
				});
			});
		}
	});
};

// more check info
cli.responders.moreCheckInfo = function(str) {
	// get the id from the str variable
	var arr = str.split('--');
	var checkId = typeof(arr[1]) === "string" && arr[1].trim().length > 0 ? arr[1].trim() : false;

	if (checkId) {
		// Lookup the check
		_data.read('checks', checkId, function(err, checkData) {
			if (!err && checkData) {
				// Print the JSON object of that check with text highlighting
				cli.verticalSpace();
				console.dir(checkData, {'colors' : true});
				cli.verticalSpace();
			}
		});
	}
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
		prompt : ''
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