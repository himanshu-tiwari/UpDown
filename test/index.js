/*
* Test runner
*
*/

// Dependencies
const helpers = require('./../lib/helpers');
const assert = require('assert');

// Application logic for the test runner
_app = {};

// Container for the tests
_app.tests = {
	'unit' : {}
};

// Assert that the getANumber function is returning a number
_app.tests.unit['helpers.getANumber should return number'] = function(done) {
	var val = helpers.getANumber();
	assert.equal(typeof(val), 'number');
	done();
};

// Assert that the getANumber function is returning 1
_app.tests.unit['helpers.getANumber should return 1'] = function(done) {
	var val = helpers.getANumber();
	assert.equal(val, 1);
	done();
};

// Assert that the getANumber function is returning 2
_app.tests.unit['helpers.getANumber should return 2'] = function(done) {
	var val = helpers.getANumber();
	assert.equal(val, 2);
	done();
};

// Count all the tests
_app.countTests = function() {
	var counter = 0;
	for (var key in _app.tests) {
		if (_app.tests.hasOwnProperty(key)) {
			var subTests = _app.tests[key];
			for (var testName in subTests) {
				if (subTests.hasOwnProperty(testName)) {
					counter++;
				}
			}
		}
	}

	return counter;
};

// Produce a test outcome report
_app.produceTestReport = function(limit, successes, errors) {
	console.log("");
	console.log("------------BEGIN TEST REPORT------------");
	console.log("");
	console.log("Total tests: ", limit);
	console.log("Pass: ", successes);
	console.log("Errors: ", errors.length);
	console.log("");

	// if there are errors, print them in detail
	if (errors.length > 0) {
		console.log("------------BEGIN ERROR DETAILS------------");
		console.log("");

		errors.forEach(function(testError) {
			console.log('\x1b[31m%s\x1b[0m', testError.name);
			console.log(testError.error);
			console.log("");
		});

		console.log("");
		console.log("------------END ERROR DETAILS------------");
	}

	console.log("");
	console.log("------------END TEST REPORT------------");
};

//  Run all the tests, collecting the errors and successes from the tests
_app.runTests = function() {
	var errors = [];
	var successes = 0;
	var limit = _app.countTests();
	var counter = 0;

	for (var key in _app.tests) {
		if (_app.tests.hasOwnProperty(key)) {
			var subTests = _app.tests[key];

			for (var testName in subTests) {
				if (subTests.hasOwnProperty(testName)) {
					(function() {
						var tmpTestName = testName;
						var testValue = subTests[testName];

						// call the test
						try {
							testValue(function() {
								// If the logic reaches here then we succeeded
								// Log it in green
								console.log('\x1b[32m%s\x1b[0m', tmpTestName);
								counter++;
								successes++;
								if (counter == limit) {
									_app.produceTestReport(limit, successes, errors);
								}
							});
						} catch(e) {
							// capture the error thrown and log it in red
							errors.push({
								'name' : tmpTestName,
								'error' : e
							});
							console.log('\x1b[31m%s\x1b[0m', tmpTestName);
							counter++;
							if (counter == limit) {
								_app.produceTestReport(limit, successes, errors);
							}
						}
					})();
				}
			}
		}
	}
};

// Run the tests
_app.runTests();