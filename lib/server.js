const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

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
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' :  queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : helpers.parseJsonToObject(buffer)
		};

		chosenHandler(data, function(statusCode, payload) {
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
			payload = typeof(payload) == 'object' ? payload : {};

			var payloadString = JSON.stringify(payload);

			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			console.log('Response: ', statusCode, payloadString);
		});

		// console.log('Request received on path: ' + trimmedPath + ' with method: ' + method + ' and with these query string parameters', queryStringObject);
		// console.log('Request received with these headers: ', headers);
		// console.log('Request received with these payload: ', buffer);
	});
}

server.router = {
	'ping' : handlers.ping,
	'notFound' : handlers.notFound,
	'users' : handlers.users,
	'tokens' : handlers.tokens,
	'checks' : handlers.checks
};

server.init = function() {
	// Start the http server
	server.httpServer.listen(config.httpPort, function() {
		console.log("This server is listening on port "+config.httpPort+" in "+config.envName+" mode.");
	});

	// Start the https server
	server.httpsServer.listen(config.httpsPort, function() {
		console.log("This server is listening on port "+config.httpsPort+" in "+config.envName+" mode.");
	});
}

// Export the server
module.exports = server;