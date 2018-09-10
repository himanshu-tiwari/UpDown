const http = require('http');

var server = http.createServer(function(req, res) {
	res.end('Hello World!\n');
});

server.listen(3000, function() {
	console.log("This server is listening to port 3000 now.");
});