const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

var helpers = {};

helpers.hash = function (str) {
	if (typeof(str) == 'string' && str.length > 0) {
		var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	} else {
		return false;
	}
};

// parse a json string into an object in all cases
helpers.parseJsonToObject = function(str) {
	try {
		var obj = JSON.parse(str);
		return obj;
	} catch(e) {
		return {};
	}
}

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = function(strLength) {
	strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;

	if (strLength) {
		// Define all possible characters that could go into a string
		var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

		// Start the final string
		var str = '';

		for (var i = 0; i < strLength; i++) {
			// Get a random character from the possible characters string
			var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

			// Append this character to the final string
			str += randomCharacter;
		}

		return str;
	} else {
		return false;
	}
}

// Send an SMS message via Twilio
helpers.sendTwilioSms = function(phone, msg, callback) {
	// Validate parameters
	phone = typeof(phone) === "string" && phone.trim().length === 10 ? phone.trim() : false;
	msg = typeof(msg) === "string" && phone.trim().length > 0 && phone.trim().length <= 1600 ? msg.trim() : false;

	if (phone && msg) {
		// Configure the request payload to send the SMS
		var payload = {
			'From' : config.twilio.fromPhone,
			'To' : '+1'+phone,
			'Body' : msg
		};

		// Stringify the payload
		var stringPayload = querystring.stringify(payload);
		console.log(stringPayload);

		// Configure the request details
		var requestDetails = {
			'protocol' : 'https:',
			'hostname' : 'api.twilio.com',
			'method' : 'POST',
			'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
			'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
			'headers' : {
				'Content-Type' : 'application/x-www-form-url-encoded',
				'Content-Length' : Buffer.byteLength(stringPayload)
			}
		}

		// Instantiate the request object
		var req = https.request(requestDetails, function(res) {
			// Grab the status of the sent request
			var status = res.statusCode;
			// Callback successfully if the request went through
			if (status == 200 || status == 201) {
				callback(false);
			} else {
				callback('Status code returned was: ' + status + '!');
			}
		});

		// Bind to the error event so it doesn't get thrown
		req.on('error', function(e) {
			callback(e);
		});

		// Add the payload
		req.write(stringPayload);

		// End request
		req.end();
	} else {
		callback('Given parameters were missing or invalid!');
	}
};

module.exports = helpers;