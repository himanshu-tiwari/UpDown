/*
* Example VM
* Running some arbitrary commands
*
*/

// Dependencies
const vm = require('vm');

// Define a context for the script to run in
var context = {
	'foo' : 25
};


// Define the script
var script = new vm.Script(`
	foo = foo + 1;
	bar = foo * 2;
	fizz = bar - 5;
`);

// Run the script
script.runInNewContext(context);
console.log(context);