const _data = require('./data');
const helpers = require('./helpers');

var handlers = {};

handlers.ping = function(data, callback) {
	callback(200);
	// callback(406, {'name' : 'ping handler'});
};

handlers.users = function(data, callback) {
	var acceptableMethods = ['post', 'get', 'put', 'delete'];

	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	} else {
		callback(405);
	}
};

handlers._users = {};

// Required Data: firstName, lastName, phone, password, tosAgreement
// Optional Data: none
handlers._users.post = function(data, callback) {
	var firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	var tosAgreement = typeof(data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false;

	if (firstName && lastName && phone && password && tosAgreement) {
		_data.read('users', phone, function(err, data) {
			// checking if the user already exists
			if (err) {
				var hashedPassword = helpers.hash(password);

				if (hashedPassword) {
					// creating the user object
					var userObject = {
						'firstName' : firstName,
						'lastName' : lastName,
						'phone' : phone,
						'hashedPassword' : hashedPassword,
						'tosAgreement' : true
					};

					// store the user
					_data.create('users', phone, userObject, function(err) {
						if (!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500, {'Error' : 'Could not create a new user!'});
						}
					});
				} else {
					callback(500, {'Error' : 'Could not hash the user\'s password!'});
				}
			} else {
				callback(400, {'Error' : 'A user with that phone number already exists!'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required fields!'});
	}
};

// Required Data: phone
// Optional Data: none
// @TODO: Only let an authenticated user access their own object. Don't let them access anyone else's object.
handlers._users.get = function(data, callback) {
	var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

	if(phone) {
		// Lookup the user
		_data.read('users', phone, function(err, data) {
			if(!err && data) {
				// don't return the hashed password
				delete data.hashedPassword;
				callback(200, data);
			} else {
				callback(404);
			}
		});
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};

// Required Data: phone
// Optional Data: firstName, lastName, password (at least one must be specified)
// @TODO: Only let an authenticated user update their own object. Don't let them update anyone else's object.
handlers._users.put = function(data, callback) {
	var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

	// Check for optional fields
	var firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if(phone) {
		// Error if nothing is sent to update
		if (firstName || lastName || password) {
			// Lookup the user
			_data.read('users', phone, function(err, data){
				if (!err && data) {
					// Update the required fields
					if (firstName) {
						data.firstName = firstName;
					}
					if (lastName) {
						data.lastName = lastName;
					}
					if (password) {
						data.hashedPassword = helpers.hash(password);
					}

					// Store the new updates to the system disk
					_data.update('users', phone, data, function(err) {
						if (!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500, {'Error': 'Could not update the specified user!'});
						}
					});
				} else {
					callback(404);
				}
			});
		} else {
			callback(400, {'Error': 'Missing fields to update!'})
		}
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};

// Required Data: phone
// @TODO: Only let an authenticated user delete their own object. Don't let them delete anyone else's object.
// @TODO: Cleanup (delete) any other data associated with this user
handlers._users.delete = function(data, callback) {
	var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

	if(phone) {
		// Lookup the user
		_data.read('users', phone, function(err, data) {
			if(!err && data) {
				// delete the specified user
				_data.delete('users', phone, function(err) {
					if (!err) {
						callback(200);
					} else {
						callback(500, {'Error': 'Could not delete the specified user!'});
					}
				});
			} else {
				callback(400, {'Error': 'Could not find the requested user!'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};


handlers.notFound = function(data, callback) {
	callback(404);
};


module.exports = handlers;