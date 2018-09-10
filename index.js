const http = require('http');
const url = require('url');

var server = http.createServer(function(req, res) {
	var parsedUrl = url.parse(req.url, true);

	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');
	console.log('Request received on path: ' + trimmedPath);

	res.end('Hello World!\n');
});

server.listen(3000, function() {
	console.log("This server is listening to port 3000 now.");
});