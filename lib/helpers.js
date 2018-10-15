const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

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
				console.log(status);
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

// Get the string content of a template
helpers.getTemplate = function(templateName, data, callback) {
	templateName = typeof(templateName) === "string" && templateName.length > 0 ? templateName : false;
	data = typeof(data) === "object" && data !== null ? data : {};

	if (templateName) {
		var templatesDir = path.join(__dirname, '/../templates/');

		fs.readFile(templatesDir + templateName + '.html', 'utf8', function(err, str) {
			if (!err && str && str.length > 0) {
				// Do interpolation on the string
				var finalString = helpers.interpolate(str, data);

				callback(false, finalString);
			} else {
				callback('No template named could be found!');
			}
		});
	} else {
		callback('A valid template name was not specified!');
	}
};

// Add the universal header and footer to a string, and pass the provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = function(str, data, callback) {
	str = typeof(str) === "string" && str.length > 0 ? str : '';
	data = typeof(data) === "object" && data !== null ? data : {};

	// Get the header
	helpers.getTemplate("_header", data, function(err, headerString) {
		if (!err && headerString) {
			// Get the footer
			helpers.getTemplate("_footer", data, function(err, footerString) {
				// Add them all together
				var fullString = headerString + str + footerString;
				callback(false, fullString);
			});
		} else {
			callback('Could not find the header template!');
		}
	});
};

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = function(str, data) {
	str = typeof(str) === "string" && str.length > 0 ? str : '';
	data = typeof(data) === "object" && data !== null ? data : {};

	// Add the template globals to the data object, prepending their key name with "global"
	for (var keyName in config.templateGlobals) {
		if (config.templateGlobals.hasOwnProperty(keyName)) {
			data['global.'+keyName] = config.templateGlobals[keyName];
		}
	}

	// For each key in the data object, insert its value into the string at the corresponding placeholder
	for (var key in data) {
		if (data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
			var replace = data[key];
			var find = '{' + key + '}';
			str = str.replace(find, replace);
		}
	}

	return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = function(fileName, callback) {
	fileName = typeof(fileName) === "string" && fileName.length > 0 ? fileName : false;

	if (fileName) {
		var publicDir = path.join(__dirname, '/../public/');

		fs.readFile(publicDir + fileName, function(err, data) {
			if (!err && data) {
				callback(false, data);
			} else {
				callback('Could not read data from specified file!');
			}
		});
	} else {
		callback('A valid file name was not specified!');
	}
};


module.exports = helpers;