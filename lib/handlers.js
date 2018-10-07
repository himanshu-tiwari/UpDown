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
handlers._users.get = function(data, callback) {
	var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

	if(phone) {
		// Get the token from the headers
		var token  = typeof(data.headers.token) == "string" ? data.headers.token : false;
		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if (tokenIsValid) {
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
				callback(403, {'Error' : 'Missing required token in the header or expired token'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};

// Required Data: phone
// Optional Data: firstName, lastName, password (at least one must be specified)
handlers._users.put = function(data, callback) {
	var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

	// Check for optional fields
	var firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if(phone) {
		// Get the token from the headers
		var token  = typeof(data.headers.token) == "string" ? data.headers.token : false;
		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if (tokenIsValid) {
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
				callback(403, {'Error' : 'Missing required token in the header or expired token'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};

// Required Data: phone
// @TODO: Cleanup (delete) any other data associated with this user
handlers._users.delete = function(data, callback) {
	var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

	if(phone) {
		// Get the token from the headers
		var token  = typeof(data.headers.token) == "string" ? data.headers.token : false;
		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if (tokenIsValid) {
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
				callback(403, {'Error' : 'Missing required token in the header or expired token'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};


// tokens
handlers.tokens = function(data, callback) {
	var acceptableMethods = ['post', 'get', 'put', 'delete'];

	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback);
	} else {
		callback(405);
	}
};

// container for all token methods
handlers._tokens = {};

// Required Data: phone, password
// Optional Data: none
handlers._tokens.post = function(data, callback) {
	var phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if (phone && password) {
		// Lookup the user who matches with that phone number
		_data.read('users', phone, function(err, userData) {
			if (!err && userData) {
				// Hash the sent password, and then compare it to the password stored
				var hashedPassword = helpers.hash(password);
				if (hashedPassword === userData.hashedPassword) {
					// If valid, create a token with a random name. Set expiration dates one hour in the future
					var tokenId = helpers.createRandomString(20);

					var expires = Date.now() + 60 * 60 * 1000;
					var tokenObject = {
						'phone' : phone,
						'id' : tokenId,
						'expires' : expires
					};

					// store the token
					_data.create('tokens', tokenId, tokenObject, function(err) {
						if (!err) {
							callback(200, tokenObject);
						} else {
							callback(500, {'Error' : 'Could not create the new token!'})
						}
					});
				} else {
					callback(400, {'Error': 'The password did not match the specified user\'s stored password!'});
				}
			} else {
				callback(400, {'Error': 'Could not find the specified user!'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required fields!'});
	}
};

// Required Data: id
// Optional Data: none
handlers._tokens.get = function(data, callback) {
	var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

	if(id) {
		// Lookup the token
		_data.read('tokens', id, function(err, data) {
			if(!err && data) {
				callback(200, data);
			} else {
				callback(404);
			}
		});
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};

// Required Data: id, extend
// Optional Data: none
handlers._tokens.put = function(data, callback) {
	var id = typeof(data.payload.id) == "string" && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
	var extend = typeof(data.payload.extend) == "boolean" && data.payload.extend == true ? data.payload.extend : false;

	if (id && extend) {
		// Lookup the token
		_data.read('tokens', id, function(err, tokenData) {
			if (!err && tokenData) {
				// Check to make sure the token is not already expired
				if (tokenData.expires > Date.now()) {
					// set the expiration an hour from now
					tokenData.expires = Date.now() + 60 * 60 * 1000;

					// Store the new updates
					_data.update('tokens', id, tokenData, function(err) {
						if (!err) {
							callback(200);
						} else {
							callback(500, {'Error' : 'Could not update the token\'s expiration!' })
						}
					});
				} else {
					callback(400, {'Error' : 'The token has already expired and cannot be extended!'})
				}
			} else {
				callback(400, {'Error': 'Specified token does not exist!'});
			}
		})
	} else {
		callback(400, {'Error': 'Missing required field(s) or field(s) are invalid!'});
	}
};

// Required Data: id
// Optional Data: none
handlers._tokens.delete = function(data, callback) {
	// check that the id is valid
	var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

	if(id) {
		// Lookup the token
		_data.read('tokens', id, function(err, data) {
			if(!err && data) {
				// delete the specified token
				_data.delete('tokens', id, function(err) {
					if (!err) {
						callback(200);
					} else {
						callback(500, {'Error': 'Could not delete the specified token!'});
					}
				});
			} else {
				callback(400, {'Error': 'Could not find the requested token!'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback) {
	// Lookup the token
	_data.read('tokens', id, function(err, tokenData) {
		if (!err && tokenData) {
			// Check that the token is for the given user and has not expired
			if (tokenData.phone == phone && tokenData.expires > Date.now()) {
				callback(true);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	});
}

handlers.notFound = function(data, callback) {
	callback(404);
};


module.exports = handlers;