var environments = {};

environments.staging = {
	'httpPort' : 3000,
	'httpsPort' : 3001,
	'envName' : 'staging',
	'hashingSecret' : 'aSecretKey',
	'maxChecks' : 5,
	'twilio' : {
		'accountSid' : 'AC1e801c2d10aa0639c5d6e7cf2bdfcd9b',
		'authToken' : 'd900f8bf54f833ce0cc30e75f9266651',
		'fromPhone' : '+14158375309'
	}
};

environments.production = {
	'httpPort' : 5000, //80
	'httpsPort' : 5001, //443
	'envName' : 'production',
	'hashingSecret' : 'anotherSecretKey',
	'maxChecks' : 5
};

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;