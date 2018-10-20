/*
* Unit tests
*
*/

// Dependencies
const helpers = require('./../lib/helpers');
const assert = require('assert');
const logs = require('./../lib/logs');
const exampleDebuggingProblem = require('./../lib/exampleDebuggingProblem');

// Holder for these tests
var unit = {};

// Assert that the getANumber function is returning a number
unit['helpers.getANumber should return number'] = function(done) {
	var val = helpers.getANumber();
	assert.equal(typeof(val), 'number');
	done();
};

// Assert that the getANumber function is returning 1
unit['helpers.getANumber should return 1'] = function(done) {
	var val = helpers.getANumber();
	assert.equal(val, 1);
	done();
};

// Assert that the getANumber function is returning 2
unit['helpers.getANumber should return 2'] = function(done) {
	var val = helpers.getANumber();
	assert.equal(val, 2);
	done();
};

// logs.list should callback an array and a false error
unit['logs.list should callback an array of log file names and a false error'] = function(done) {
	logs.list(true, function(err, logFileNames) {
		assert.equal(err, false);
		assert.ok(logFileNames instanceof Array);
		assert.ok(logFileNames.length > 1);
		done();
	});
};

// logs.truncate should not throw if the log id does not exist
unit['logs.truncate should not throw if the log id does not exist. It should callback an error instead'] = function(done) {
	assert.doesNotThrow(function() {
		logs.truncate('i do not exist', function(err) {
			assert.ok(err);
			done();
		});
	}, TypeError);
};

// exampleDebuggingProblem.init should not throw (but it does)
unit['exampleDebuggingProblem.init should not throw when called'] = function(done) {
	assert.doesNotThrow(function() {
		exampleDebuggingProblem.init();
		done();
	}, TypeError);
};

// Export the tests to the runner
module.exports = unit;