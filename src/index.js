var autohost = require( "autohost" );
var host = autohost( {
	port: 8080,
	handleRouteErrors: true
} );

host.start();
