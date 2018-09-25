const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

var server = http.createServer(function(req, res) {
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
});

server.listen(config.port, function() {
	console.log("This server is listening on port "+config.port+" in "+config.envName+" mode.");
});

var handlers = {};

handlers.sample = function(data, callback) {
	callback(406, {'name' : 'sample handler'});
};

handlers.notFound = function(data, callback) {
	callback(404);
};

var router = {
	'sample' : handlers.sample,
	'notFound' : handlers.notFound,
};