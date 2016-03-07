var fs = require( "fs" );
var path = require( "path" );
var filePath = path.resolve( "./config.json" );

function read() {
	var raw = fs.readFileSync( filePath );
	return JSON.parse( raw );
}

function write( json ) {
	var raw = JSON.stringify( json, null, 2 );
	fs.writeFileSync( filePath, raw, "utf8" );
}

module.exports = {
	read: read,
	write: write
};