/*
* Front-end logic for the application
*
*/

// The container fro the front end application
var app = {};

// config
app.config = {
	'sessionToken' : false
};

// Ajax client (for the restful API)
app.client = {};

app.client.request = function(headers, path, method, queryStringObject, payload, callback) {
	headers = typeof(headers) === "object" && headers !== null ? headers : {};
	path = typeof(path) === "string" ? path : '/';
	method = typeof(method) === "string" && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toupperCase() : 'GET';
	queryStringObject = typeof(queryStringObject) === "object" && queryStringObject !== null ? queryStringObject : {};
	payload = typeof(payload) === "object" && payload !== null ? payload : {};
	callback = typeof(callback) === "function" ? callback : false;

	// For each querystring parameter sent, add it to the path
	var requestURL = path + '?';
	var counter = 0;
	for (var queryKey in queryStringObject) {
		if (queryStringObject.hasOwnProperty(queryKey)) {
			counter++;
			// If at least one query string parameter has already been added, prepend new ones with an ampersand
			if (counter > 1) {
				requestURL += '&';
			}
			// Add the key and value
			requestURL += queryKey + '=' + queryStringObject[queryKey];
		}
	}

	// Form the http request as a JSON type
	var xhr = new XMLHttpRequest();
	xhr.open(method, requestURL, true);
	xhr.setRequestHeader("Content-type", "application/json");

	// For each additional header sent, add it to the request
	for (var headerKey in headers) {
		if (headers.hasOwnProperty(headerKey)) {
			xhr.setRequestHeader(headerKey, headers[headerKey]);
		}
	}

	// if there is a current session token set, add that as a header
	if (app.config.sessionToken) {
		xhr.setRequestHeader("token", app.config.sessionToken.id);
	}

	// When the request comes back, handle the response
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			var statusCode = xhr.status;
			var responseReturned = xhr.responseText;

			// Callback if requested
			if (callback) {
				try {
					var parsedResponse = JSON.parse(responseReturned);
					callback(statusCode, parsedResponse);
				} catch(e) {
					callback(statusCode, false);
				}
			}
		}
	};

	// Send the payload as JSON
	var payloadString = JSON.stringify(payload);
	xhr.send(payloadString);
};