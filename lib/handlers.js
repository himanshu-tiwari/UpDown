const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

var handlers = {};

handlers.ping = function(data, callback) {
	callback(200);
	// callback(406, {'name' : 'ping handler'});
};


/*
* HTML Handlers
*
*/

// Index handler
handlers.index = function(data, callback) {
	// Reject any request that is not a get
	if (data.method === 'get') {
		// prepare data for interpolation
		var templateData = {
			'head.title' : 'Uptime Monitoring - Made Simple',
			'head.description' : 'We offer free uptime monitoring service for all HTTP/HTTPs websites of all kinds. When your site goes down, we\'ll send you a text to let you know',
			'body.class' : 'index'
		};


		// read in a template as a string
		helpers.getTemplate('index', templateData, function(err, str) {
			if (!err && str) {
				// Add universal templates
				helpers.addUniversalTemplates(str, templateData, function(err, fullString) {
					if (!err && fullString) {
						// Return that page as an html
						callback(200, fullString, 'html');
					} else {
						callback(500, undefined, 'html');
					}
				});
			} else {
				callback(500, undefined, 'html');
			}
		});
	} else {
		callback(405, undefined, 'html');
	}
};

// Create Account
handlers.accountCreate = function(data, callback) {
	// Reject any request that is not a get
	if (data.method === 'get') {
		// prepare data for interpolation
		var templateData = {
			'head.title' : 'Create an Account',
			'head.description' : 'Signup is easy and only takes a few seconds',
			'body.class' : 'accountCreate'
		};

		// read in a template as a string
		helpers.getTemplate('accountCreate', templateData, function(err, str) {
			if (!err && str) {
				// Add universal templates
				helpers.addUniversalTemplates(str, templateData, function(err, fullString) {
					if (!err && fullString) {
						// Return that page as an html
						callback(200, fullString, 'html');
					} else {
						callback(500, undefined, 'html');
					}
				});
			} else {
				callback(500, undefined, 'html');
			}
		});
	} else {
		callback(405, undefined, 'html');
	}
};

// Create New Session
handlers.sessionCreate = function(data, callback) {
	// Reject any request that is not a get
	if (data.method === 'get') {
		// prepare data for interpolation
		var templateData = {
			'head.title' : 'Login to Your Account',
			'head.description' : 'Please enter phone number and password to access your account!',
			'body.class' : 'sessionCreate'
		};

		// read in a template as a string
		helpers.getTemplate('sessionCreate', templateData, function(err, str) {
			if (!err && str) {
				// Add universal templates
				helpers.addUniversalTemplates(str, templateData, function(err, fullString) {
					if (!err && fullString) {
						// Return that page as an html
						callback(200, fullString, 'html');
					} else {
						callback(500, undefined, 'html');
					}
				});
			} else {
				callback(500, undefined, 'html');
			}
		});
	} else {
		callback(405, undefined, 'html');
	}
};

// Session Deleted
handlers.sessionDeleted = function(data, callback) {
	// Reject any request that is not a get
	if (data.method === 'get') {
		// prepare data for interpolation
		var templateData = {
			'head.title' : 'Logged Out',
			'head.description' : 'You have been logged your account!',
			'body.class' : 'sessionDeleted'
		};

		// read in a template as a string
		helpers.getTemplate('sessionDeleted', templateData, function(err, str) {
			if (!err && str) {
				// Add universal templates
				helpers.addUniversalTemplates(str, templateData, function(err, fullString) {
					if (!err && fullString) {
						// Return that page as an html
						callback(200, fullString, 'html');
					} else {
						callback(500, undefined, 'html');
					}
				});
			} else {
				callback(500, undefined, 'html');
			}
		});
	} else {
		callback(405, undefined, 'html');
	}
};

// Edit Your Account
handlers.accountEdit = function(data, callback) {
	// Reject any request that is not a get
	if (data.method === 'get') {
		// prepare data for interpolation
		var templateData = {
			'head.title' : 'Account Settings',
			'body.class' : 'accountEdit'
		};

		// read in a template as a string
		helpers.getTemplate('accountEdit', templateData, function(err, str) {
			if (!err && str) {
				// Add universal templates
				helpers.addUniversalTemplates(str, templateData, function(err, fullString) {
					if (!err && fullString) {
						// Return that page as an html
						callback(200, fullString, 'html');
					} else {
						callback(500, undefined, 'html');
					}
				});
			} else {
				callback(500, undefined, 'html');
			}
		});
	} else {
		callback(405, undefined, 'html');
	}
};

// Account has been deleted
handlers.accountDeleted = function(data, callback) {
	// Reject any request that is not a get
	if (data.method === 'get') {
		// prepare data for interpolation
		var templateData = {
			'head.title' : 'Account Deleted',
			'head.description' : 'Your account has been deleted!',
			'body.class' : 'accountDeleted'
		};

		// read in a template as a string
		helpers.getTemplate('accountDeleted', templateData, function(err, str) {
			if (!err && str) {
				// Add universal templates
				helpers.addUniversalTemplates(str, templateData, function(err, fullString) {
					if (!err && fullString) {
						// Return that page as an html
						callback(200, fullString, 'html');
					} else {
						callback(500, undefined, 'html');
					}
				});
			} else {
				callback(500, undefined, 'html');
			}
		});
	} else {
		callback(405, undefined, 'html');
	}
};

// favicon handler
handlers.favicon = function(data, callback) {
	// Reject any request that is not a get
	if (data.method === 'get') {
		// Read in the favicon's data
		helpers.getStaticAsset('favicon.ico', function(err, data) {
			if (!err && data) {
				callback(200, data, 'favicon');
			} else {
				callback(500);
			}
		});
	} else {
		callback(405);
	}
};

// public assets handler
handlers.public = function(data, callback) {
	// Reject any request that is not a get
	if (data.method === 'get') {
		// get the file name being requested
		var trimmedAssetName = data.trimmedPath.replace('public/', '').trim();

		if (trimmedAssetName.length > 0) {
			// Read in the assert's data
			helpers.getStaticAsset(trimmedAssetName, function(err, data) {
				if (!err && data) {
					// Determine the content type (dafault to plain text)
					var contentType = 'plain';

					if (trimmedAssetName.indexOf('.css') > -1) {
						contentType = 'css';
					}

					if (trimmedAssetName.indexOf('.png') > -1) {
						contentType = 'png';
					}

					if (trimmedAssetName.indexOf('.jpeg') > -1) {
						contentType = 'jpeg';
					}

					if (trimmedAssetName.indexOf('.jpeg') > -1) {
						contentType = 'jpg';
					}

					if (trimmedAssetName.indexOf('.ico') > -1) {
						contentType = 'favicon';
					}
					
					// Callback the data
					callback(200, data, contentType);
				} else {
					callback(404, undefined, 'html');
				}
			});
		} else {
			callback(404, undefined, 'html');
		}
		
	} else {
		callback(405, undefined, 'html');
	}
};



/*
* JSON API Handlers
*
*/
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
handlers._users.delete = function(data, callback) {
	var phone = typeof(data.queryStringObject.phone) == "string" && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

	if(phone) {
		// Get the token from the headers
		var token  = typeof(data.headers.token) == "string" ? data.headers.token : false;
		// Verify that the given token is valid for the phone number
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if (tokenIsValid) {
				// Lookup the user
				_data.read('users', phone, function(err, userData) {
					if(!err && data) {
						// delete the specified user
						_data.delete('users', phone, function(err) {
							if (!err) {
								// Delete each of the checks associated with the user
								var userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
								var checksToDelete = userChecks.length;

								if (checksToDelete > 0) {
									var checksDeleted = 0;
									var deletionErrors = false;

									// Loop through the checks
									userChecks.forEach(function(checkId) {
										// Delete the check
										_data.delete('checks', checkId, function(err) {
											if (err) {
												deletionErrors = true;
											}
											checksDeleted += 1;

											if (checksDeleted === checksToDelete) {
												if (!deletionErrors) {
													callback(200);
												} else {
													callback(500, {'Error' : 'Errors encountered while attempting to delete all checks from the disk. All checks may not be deleted!'});
												}
											}
										});
									});
								} else {
									callback(200);
								}
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

// container for all tokens methods
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



// checks
handlers.checks = function(data, callback) {
	var acceptableMethods = ['post', 'get', 'put', 'delete'];

	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._checks[data.method](data, callback);
	} else {
		callback(405);
	}
};

// container for all checks methods
handlers._checks = {};

// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
handlers._checks.post = function(data, callback) {
	// Validate inputs
	var protocol = typeof(data.payload.protocol) == "string" && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
	var url = typeof(data.payload.url) == "string" && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
	var method = typeof(data.payload.method) == "string" && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
	var successCodes = typeof(data.payload.successCodes) == "object" && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
	var timeoutSeconds = typeof(data.payload.timeoutSeconds) == "number" && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

	if (protocol && url && method && successCodes && timeoutSeconds) {
		// Get the token from the headers
		var token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

		if (token) {
			// Lookup the user by reading the token
			_data.read('tokens', token, function(err, tokenData) {
				if (!err && tokenData) {
					var userPhone = tokenData.phone;

					// Lookup the user data
					_data.read('users', userPhone, function(err, userData) {
						if (!err && userData) {
							var userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];

							// Verify that the user has less than the number of max-checks-per-user
							if (userChecks.length < config.maxChecks) {
								// Create a random id for the checks
								var checkId = helpers.createRandomString(20);

								// Create the check object and include the user's phone
								var checkObject = {
									'id' : checkId,
									'userPhone' : userPhone,
									'protocol' : protocol,
									'url' : url,
									'method' : method,
									'successCodes' : successCodes,
									'timeoutSeconds' : timeoutSeconds
								};

								// Save the checkObject to the disk
								_data.create('checks', checkId, checkObject, function(err) {
									if (!err) {
										// Add the check id to the user's object
										userData.checks = userChecks;
										userData.checks.push(checkId);

										// Save the new user data
										_data.update('users', userPhone, userData, function(err) {
											if (!err) {
												// Return the data about the new check to the requester
												callback(200, checkObject);
											} else {
												callback(500, {'Error' : 'Could not update the user with the new check!'})
											}
										})
									} else {
										callback(500, {'Error' : 'Could not create the new check!'})
									}
								})
							} else {
								callback(400, {'Error' : 'The user already has the maximum number of checks ('+config.maxChecks+')'});
							}
						} else {
							callback(403);
						}
					});
				} else {
					callback(403, {'Error' : err, 'token' : data.headers.tokens});
				}
			});
		} else {
			callback(400, {'Error' : 'Missing or invalid token!'});
		}
	} else {
		callback(400, {'Error' : 'Missing required inputs, or inputs invalid!'});
	}
};

// Required Data: id
// Optional Data: none
handlers._checks.get = function(data, callback) {
	var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

	if(id) {
		// Lookup the check
		_data.read('checks', id, function(err, checkData) {
			if (!err && checkData) {
				// Get the token from the headers
				var token  = typeof(data.headers.token) == "string" ? data.headers.token : false;

				// Verify that the given token is valid and belongs to the user who created the check
				handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
					if (tokenIsValid) {
						// Return the checkData
						callback(200, checkData)
					} else {
						callback(403);
					}
				});		
			} else {
				callback(404);
			}
		});
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};

// Required Data: id
// Optional Data: protocol, url, method, successCodes, timeoutSeconds (one must be sent)
handlers._checks.put = function(data, callback) {
	var id = typeof(data.payload.id) == "string" && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

	// Check for optional fields
	var protocol = typeof(data.payload.protocol) == "string" && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
	var url = typeof(data.payload.url) == "string" && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
	var method = typeof(data.payload.method) == "string" && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.protocol : false;
	var successCodes = typeof(data.payload.successCodes) == "object" && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
	var timeoutSeconds = typeof(data.payload.timeoutSeconds) == "number" && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

	if(id) {
		// Get the token from the headers
		var token  = typeof(data.headers.token) == "string" ? data.headers.token : false;

		// Check to make sure one or more optional fields has been sent
		if (protocol || url || method || successCodes || timeoutSeconds) {
			// Lookup the check
			_data.read('checks', id, function(err, checkData) {
				if (!err && checkData) {
					// Get the token from the headers
					var token  = typeof(data.headers.token) == "string" ? data.headers.token : false;

					// Verify that the given token is valid and belongs to the user who created the check
					handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
						if (tokenIsValid) {
							// Update the checkData
							if (protocol) {
								checkData.protocol = protocol;
							}
							if (url) {
								checkData.url = url;
							}
							if (method) {
								checkData.method = method;
							}
							if (successCodes) {
								checkData.successCodes = successCodes;
							}
							if (timeoutSeconds) {
								checkData.timeoutSeconds = timeoutSeconds;
							}

							_data.update('checks', id, checkData, function(err) {
								if (!err) {
									callback(200);
								} else {
									callback(500, {'Error' : 'Could not update the check!'});
								}
							});
						} else {
							callback(403);
						}
					});
				} else {
					callback(400, {'Error' : 'Check ID does not exist!'});
				}
			});
		} else {
			callback(400, {'Error': 'Missing fields to update!'});
		}
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
};

// Required Data: id
// Optional Data: none
handlers._checks.delete = function(data, callback) {
	var id = typeof(data.queryStringObject.id) == "string" && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

	if(id) {
		// Lookup the check
		_data.read('checks', id, function(err, checkData) {
			if (!err && checkData) {
				// Get the token from the headers
				var token  = typeof(data.headers.token) == "string" ? data.headers.token : false;
				
				// Verify that the given token is valid for the phone number
				handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
					if (tokenIsValid) {
						// delete the specified check
						_data.delete('checks', id, function(err) {
							if (!err) {
								_data.read('users', checkData.userPhone, function(err, userData) {
									if (!err && userData) {
										var userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];

										// Remove the deleted check from the list of checks in the user
										var checkPosition = userChecks.indexOf(id);

										if (checkPosition > -1) {
											userChecks.splice(checkPosition, 1);

											// Re-save the user's data
											_data.update('users', userData.phone, userData, function(err) {
												if (!err) {
													callback(200);
												} else {
													callback(500, {'Error' : 'Could not update the user related to the specified check!'});
												}
											});
										} else {
											callback(500, {'Error' : 'Could not delete the specified check from the related user!'});
										}
									} else {
										callback(500, {'Error': 'Could not find the user for the specified check!'});
									}
								});
							} else {
								callback(500, {'Error': 'Could not delete the specified check!'});
							}
						});
					} else {
						callback(403, {'Error' : 'Missing required token in the header or expired token'});
					}
				});
			} else {
				callback(404);
			}
		});
	} else {
		callback(400, {'Error': 'Missing required fields!'});
	}
}



handlers.notFound = function(data, callback) {
	callback(404);
};


module.exports = handlers;