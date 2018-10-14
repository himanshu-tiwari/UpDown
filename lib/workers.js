const path = require('path');
const fs = require('fs');
const _data = require('./data');
const _logs = require('./logs');
const https = require('https');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');



// Instantiate the worker object
var workers = {};

// Lookup all checks, get their data, send to a validator
workers.gatherAllChecks = function() {
	// get all checks
	_data.list('checks', function(err, checks) {
		if (!err && checks && checks.length > 0) {
			checks.forEach(function(check) {
				// Read in the check data
				_data.read('checks', check, function(err, originalCheckData) {
					if (!err && originalCheckData) {
						// Pass it on to the check validator and let that function continue or log errors as needed
						workers.validateCheckData(originalCheckData);
					} else {
						console.log("Error reading one of the check's data!");
					}
				});
			});
		} else {
			console.log("Error: Could not find any checks to process!");
		}
	});
};

// Sanity checking the check data
workers.validateCheckData = function(originalCheckData) {
	originalCheckData = typeof(originalCheckData) === "object" && originalCheckData !== null ? originalCheckData : {};
	originalCheckData.id = typeof(originalCheckData.id) === "string" && originalCheckData.id.trim().length === 20 ? originalCheckData.id.trim() : false;
	originalCheckData.userPhone = typeof(originalCheckData.userPhone) === "string" && originalCheckData.userPhone.trim().length === 10 ? originalCheckData.userPhone.trim() : false;
	originalCheckData.protocol = typeof(originalCheckData.protocol) === "string" && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
	originalCheckData.url = typeof(originalCheckData.url) === "string" && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
	originalCheckData.method = typeof(originalCheckData.method) === "string" && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
	originalCheckData.successCodes = typeof(originalCheckData.successCodes) === "object" && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
	originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) === "number" && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

	// Set the keys that may not be set (if the workers have never seen this check before)
	originalCheckData.state = typeof(originalCheckData.state) === "string" && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
	originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) === "number" && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

	// If all the checks pass, pass the data along to the next step in the process
	if (originalCheckData.id &&
		originalCheckData.userPhone &&
		originalCheckData.protocol &&
		originalCheckData.url &&
		originalCheckData.method &&
		originalCheckData.successCodes &&
		originalCheckData.timeoutSeconds
	) {
		workers.performCheck(originalCheckData);
	} else {
		console.log("Error: One of the checks is not properly formatted! Skipping it!");
	}
};

// Perform the check, send the original check data and the outcome of the process to the next step
workers.performCheck = function(originalCheckData) {
	// Prepare the initial check outcome
	var checkOutcome = {
		'error' : false,
		'responseCode' : false
	};

	// Mark that the outcome has not been sent yet
	var outcomeSent = false;

	// Parse the hostname and path out of the original check data
	var parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
	var hostname = parsedUrl.hostname;
	var path = parsedUrl.path; // Using path and not pathname because we want the whole querystring

	// Construct the request
	var requestDetails = {
		'protocol' : originalCheckData.protocol+':',
		'hostname' : hostname,
		'method' : originalCheckData.method.toUpperCase(),
		'timeout' : originalCheckData.timeoutSeconds * 1000
	}

	// Instantiate the request object (using the http or https module)
	var _moduleToUse = originalCheckData.protocol === 'http' ? http : https;
	var req = _moduleToUse.request(requestDetails, function(res) {
		// Grab the status of the sent request
		var status = res.statusCode;

		// Update the check outcome and pass the data along
		checkOutcome.responseCode = status;
		if (!outcomeSent) {
			workers.processCheckOutcome(originalCheckData, checkOutcome);
			outcomeSent = true;
		}
	});

	// Bind to the error event so it does not get thrown
	req.on('err', function(e) {
		// Update the check outcome and pass the data along
		checkOutcome.error = {
			'error' : true,
			'value' : e
		};
		
		if (!outcomeSent) {
			workers.processCheckOutcome(originalCheckData, checkOutcome);
			outcomeSent = true;
		}
	});

	// Bind to the timeout event
	req.on('err', function(e) {
		// Update the check outcome and pass the data along
		checkOutcome.error = {
			'error' : true,
			'value' : 'timeout'
		};
		
		if (!outcomeSent) {
			workers.processCheckOutcome(originalCheckData, checkOutcome);
			outcomeSent = true;
		}
	});

	// End the request
	req.end();
};

// process the check outcome, update the check data as needed, trigger an alert to the user if needed
// special logic for a check that has never been tested before (don't want to alert on that one)
workers.processCheckOutcome = function(originalCheckData, checkOutcome){
	// Decide if the check state is considered up or down
	var state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

	// Decide if an alert is warranted
	var alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state;

	// Log the outcome
	var timeOfCheck = Date.now();
	workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck);

	// Update the check data
	var newCheckData = originalCheckData;
	newCheckData.state = state;
	newCheckData.lastChecked = timeOfCheck;

	// Save the updates
	_data.update('checks', newCheckData.id, newCheckData, function(err) {
		if (!err) {
			// Send the new check data to the next phase of the process if needed
			if (alertWarranted) {
				workers.alertUserToStatusChange(newCheckData);
			} else {
				console.log('Check outcome has not changed, no alert needed!');
			}
		} else {
			console("Error trying to save updates to one of the checks!");
		}
	});
};

// Alert the user as to the change in their check status
workers.alertUserToStatusChange = function(newCheckData) {
	var msg = 'Alert: Your check for ' + newCheckData.method.toUpperCase() + ' ' + newCheckData.protocol + '://' + newCheckData.url + ' is currently ' + newCheckData.state;

	helpers.sendTwilioSms(newCheckData.userPhone, msg, function(err) {
		if (!err) {
			console.log("Success: User was alerted of a state change in their check via SMS: " + msg);
		} else {
			console.log("Error: Could not send an SMS alert to the user who had a state change in their check!");
		}
	});
};

workers.log = function(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) {
	// form the log data
	var logData = {
		"check" : originalCheckData,
		"outcome" : checkOutcome,
		"state" : state,
		"alert" : alertWarranted,
		"time" : timeOfCheck,
	};

	// Convert log data object to a string
	var logString = JSON.stringify(logData);

	// Determine the name of the log file
	var logFileName = originalCheckData.id;

	// Append the log string to the file
	_logs.append(logFileName, logString, function(err) {
		if (!err) {
			console.log('Successfully logged into file!');
		} else {
			console.log('Could not log into file!');
		}
	});

};


// Timer to execute the worker-process once per minute
workers.loop = function() {
	setInterval(function() {
		workers.gatherAllChecks();
	}, 60 * 1000);
};

// Rotate (compress) the log files
workers.rotateLogs = function() {
	// List all the non-compressed log files
	_logs.list(false, function(err, logs) {
		if (!err && logs) {
			logs.forEach(function(logName) {
				// compress the data to a different file
				var logId = logName.replace('.log', '');
				var newFileId = logId + '-' + Date.now();
				_logs.compress(logId, newFileId, function(err) {
					if (!err) {
						// Truncate the log
						_logs.truncate(logId, function(err) {
							if (!err) {
								console.log("Successfully truncated logFile!");
							} else {
								console.log("Error truncating logFile!");
							}
						});
					} else {
						console.log("Error compressing one of the log files!");
					}
				});
			});
		} else {
			console.log("Error: Could not find any logs to rotate!");
		}
	});
};

// Timer to execute the log rotation process once per day
workers.logRotationLoop = function() {
	setInterval(function() {
		workers.rotateLogs();
	}, 24 * 60 * 60 * 1000);
};

// init script
workers.init = function() {
	// execute all the checks as soon as this starts up
	workers.gatherAllChecks();

	// call the loop so the checks are executed on their own
	workers.loop();

	// compress all the logs immediately
	workers.rotateLogs();

	// call the compression loop so logs would be compressed later on
	workers.logRotationLoop();
};

// export the object
module.exports = workers;