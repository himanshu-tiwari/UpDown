/*
* API tests
*
*/

// Dependencies
const app = require('./../index');
const assert = require('assert');
const http = require('http');
const config = require('./../lib/config');

// Holder for the tests
var api = {};

// helpers
var helpers = {};

helpers.makeGetRequest = function(path, callback) {
	// Configure the request details
	var requestDetails = {
		'protocol' : 'http:',
		'hostname' : 'localhost',
		'port' : config.httpPort,
		'method' : 'GET',
		'path' : path,
		'headers' : {
			'Content-Type' : 'application/json'
		}
	};

	// Send the request
	var req = http.request(requestDetails, function(res) {
		callback(res);
	});

	req.end();
};

// The main init() should be able to run without throwing
api['app.init should be able to run without throwing'] = function(done) {
	assert.doesNotThrow(function() {
		app.init(function(err) {
			done();
		});
	}, TypeError);
};

// Make a request to /ping
api['/ping should respond to GET with 200'] = function(done) {
	helpers.makeGetRequest('/ping', function(res) {
		assert(res.statusCode, 200);
		done();
	});
};

// Make a request to /api/users
api['/api/users should respond to GET with 400'] = function(done) {
	helpers.makeGetRequest('/api/users', function(res) {
		assert(res.statusCode, 400);
		done();
	});
};

// Make a request to a random path
api['a random path should respond to GET with a 404'] = function(done) {
	helpers.makeGetRequest('/random/path', function(res) {
		assert(res.statusCode, 404);
		done();
	});
};

// Export the tests to the runner
module.exports = api;