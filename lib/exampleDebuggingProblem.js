/*
* Library that demonstrates something throwing when its init is called
*
*/ 

// Container for the module
var example = {};

// Init function
example.init = function() {
	// This is an error created intentionally (bar is not defined)
	var foo = bar;
};

// export the module
module.exports = example;