const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

var httpServer = http.createServer(function(req, res) {
	unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function() {
	console.log("This server is listening on port "+config.httpPort+" in "+config.envName+" mode.");
});

var httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
	unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, function() {
	console.log("This server is listening on port "+config.httpsPort+" in "+config.envName+" mode.");
});

var unifiedServer = function(req, res) {
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

		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router['notFound'];
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' :  queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
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

var handlers = {};

handlers.ping = function(data, callback) {
	callback(200);
	// callback(406, {'name' : 'ping handler'});
};

handlers.notFound = function(data, callback) {
	callback(404);
};

var router = {
	'ping' : handlers.ping,
	'notFound' : handlers.notFound,
};