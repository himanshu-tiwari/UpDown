const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');

// Instantiate the server module object
var server = {};


server.httpServer = http.createServer(function(req, res) {
	server.unifiedServer(req, res);
});

server.httpsServerOptions = {
	'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
	'cert' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem')),
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
	server.unifiedServer(req, res);
});

server.unifiedServer = function(req, res) {
	var parsedUrl = url.parse(req.url, true);

	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	var queryStringObject = parsedUrl.query;
	var headers = req.headers;

	var method = req.method.toLowerCase();

	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data', function(data){
		buffer += decoder.write(data);
	});
	req.on('end', function(){
		buffer += decoder.end();

		var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : server.router['notFound'];

		// If the request is within the public directory, use the public handler instead
		chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' :  queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : helpers.parseJsonToObject(buffer)
		};

		try {
			chosenHandler(data, function(statusCode, payload, contentType) {
				server.processHandlerResponse(res, method, trimmedPath, statusCode, payload, contentType);
			});
		} catch(e) {
			server.processHandlerResponse(res, method, trimmedPath, 500, {'Error' : 'An unknown error has occured!'}, 'json');
		}

		// debug('Request received on path: ' + trimmedPath + ' with method: ' + method + ' and with these query string parameters', queryStringObject);
		// debug('Request received with these headers: ', headers);
		// debug('Request received with these payload: ', buffer);
	});
}

// Process the response form the handler
server.processHandlerResponse = function(res, method, trimmedPath, statusCode, payload, contentType) {
	// Determine the type of response (fallback to json)
	contentType = typeof(contentType) == 'string' ? contentType : 'json';

	// Use the status code called back by the handler or default to 200
	statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

	// Return the response parts that are content specific
	var payloadString = '';
	if (contentType === 'json') {
		res.setHeader('Content-Type', 'application/json');

		payload = typeof(payload) == 'object' ? payload : {};
		payloadString = JSON.stringify(payload);
	}
	if (contentType === 'html') {
		res.setHeader('Content-Type', 'text/html');

		payloadString = typeof(payload) == 'string' ? payload : '';
	}
	if (contentType === 'favicon') {
		res.setHeader('Content-Type', 'image/x-icon');

		payloadString = typeof(payload) !== 'undefined' ? payload : '';
	}
	if (contentType === 'css') {
		res.setHeader('Content-Type', 'text/css');

		payloadString = typeof(payload) !== 'undefined' ? payload : '';
	}
	if (contentType === 'png') {
		res.setHeader('Content-Type', 'image/png');

		payloadString = typeof(payload) !== 'undefined' ? payload : '';
	}
	if (contentType === 'jpeg') {
		res.setHeader('Content-Type', 'image/jpeg');

		payloadString = typeof(payload) !== 'undefined' ? payload : '';
	}
	if (contentType === 'jpg') {
		res.setHeader('Content-Type', 'image/jpg');

		payloadString = typeof(payload) !== 'undefined' ? payload : '';
	}
	if (contentType === 'plain') {
		res.setHeader('Content-Type', 'text/plain');

		payloadString = typeof(payload) !== 'undefined' ? payload : '';
	}

	// Return the response parts that are common to all the content types
	res.writeHead(statusCode);
	res.end(payloadString);

	// if the response is 200, print green, otherwise print red
	if (statusCode == 200) {
		debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + '/' + trimmedPath + ' ' + statusCode);
	} else {
		debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + '/' + trimmedPath + ' ' + statusCode);
	}
};

server.router = {
	'' : handlers.index,
	'account/create' : handlers.accountCreate,
	'account/edit' : handlers.accountEdit,
	'account/deleted' : handlers.accountDeleted,
	'session/create' : handlers.sessionCreate,
	'session/deleted' : handlers.sessionDeleted,
	'checks/all' : handlers.checksList,
	'checks/create' : handlers.checksCreate,
	'checks/edit' : handlers.checksEdit,
	'ping' : handlers.ping,
	'notFound' : handlers.notFound,
	'api/users' : handlers.users,
	'api/tokens' : handlers.tokens,
	'api/checks' : handlers.checks,
	'favicon' : handlers.favicon,
	'public' : handlers.public,
	'examples/error' : handlers.exampleError
};

server.init = function() {
	// Start the http server
	server.httpServer.listen(config.httpPort, function() {
		console.log("\x1b[36m%s\x1b[0m", "This server is listening on port "+config.httpPort+" in "+config.envName+" mode.");
	});

	// Start the https server
	server.httpsServer.listen(config.httpsPort, function() {
		console.log("\x1b[35m%s\x1b[0m", "This server is listening on port "+config.httpsPort+" in "+config.envName+" mode.");
	});
}

// Export the server
module.exports = server;