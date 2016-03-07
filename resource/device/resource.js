var when = require( "when" );
var _ = require( "lodash" );
var format = require( "util" ).format;
var patch = require( "json-patch" );
var rc = require( "rcswitch-gpiomem" );
var configuration = require( "../../src/config" );
var config = configuration.read();
rc.enableTransmit( config.transmitPin );
var DEFAULTS = { pulse: 190, operations: {} };

function DeviceNotFoundError( name ) {
	this.name = "DeviceNotFoundError";
	this.message = format( "No device named '%s' exists", name );
	this.stack = ( new Error() ).stack;
}

DeviceNotFoundError.prototype = Object.create( Error.prototype );
DeviceNotFoundError.prototype.constructor = DeviceNotFoundError;

function CommandNotFoundError(device, name) {
	this.name = "CommandNotFoundError";
	this.message = format( "No command named '%s' exists for device '%s'", name, device );
	this.stack = ( new Error() ).stack;
}

CommandNotFoundError.prototype = Object.create( Error.prototype );
CommandNotFoundError.prototype.constructor = CommandNotFoundError;

function getDevice( name ) {
	var device = config.devices[ name ];
	if( device ) {
		return device;
	} else {
		throw new DeviceNotFoundError( name );
	}
}

function getCommand( device, name ) {
	var command = device.operations[ name ];
	if( command ) {
		return command;
	} else {
		throw new CommandNotFoundError( device.name, name );
	}
}

module.exports = function() {
	return {
		name: "device",
		errors: {
			DeviceNotFoundError: {
				status: 404,
				reply: function( err ) {
					return err.message;
				}
			},
			CommandNotFoundError: {
				status: 404,
				reply: function( err ) {
					return err.message;
				}
			}
		},
		actions: {
			list: {
				method: "GET",
				url: "/",
				handle: function() {
					return { status: 200, data: config.devices };
				}
			},
			add: {
				method: "POST",
				url: "/:name",
				handle: function( envelope ) {
					var name = envelope.data.name;
					config.devices[ name ] = _.defaults( envelope.data, DEFAULTS );
					configuration.write( config );
					return { status: 201, data: config.devices[ name ] };
				}
			},
			self: {
				method: "GET",
				url: "/:name",
				handle: function( envelope ) {
					var name = envelope.data.name;
					var device = getDevice( name );
					return { status: 200, data: device };
				}
			},
			update: {
				method: "PATCH",
				url: "/:name",
				handle: function( envelope ) {
					var name = envelope.data.name;
					var device = getDevice( name );
					var list = _.map( _.omit( envelope.data, [ "name" ] ) );
					patch.apply( operation, list );
					config.devices[ name ] = device;
					configuration.write( config );
					return { status: 200, data: config.devices[ name ] };	
				}
			},
			remove: {
				method: "DELETE",
				url: "/:name",
				handle: function( envelope ) {
					var name = envelope.data.name;
					getDevice( name );
					delete config.devices[ name ];
					configuration.write( config );
					return { status: 204 };	
				}
			},
			addCommand: {
				method: "POST",
				url: "/:name/:command",
				handle: function( envelope ) {
					var name = envelope.data.name;
					var command = envelope.data.command;
					var device = getDevice( name );
					device.operations[ command ] = _.omit( envelope.data, [ "name", "command" ] );
					config.devices[ name ] = device;
					configuration.write( config );
					return { status: 200, data: config.devices[ name ] };	
				}
			},
			sendCommand: {
				method: "PUT",
				url: "/:name/:command",
				handle: function( envelope ) {
					var name = envelope.data.name;
					var command = envelope.data.command;
					var device = getDevice( name );
					var operation = getCommand( device, command );
					rc.setPulseLength( device.pulse );
					rc.send( operation.code, 24 );
					return { status: 204 };
				}
			},
			updateCommand: {
				method: "PATCH",
				url: "/:name/:command",
				handle: function( envelope ) {
					var name = envelope.data.name;
					var command = envelope.data.command;
					var device = getDevice( name );
					var operation = getCommand( device, command );
					var list = _.map( _.omit( envelope.data, [ "name", "command" ] ) );
					patch.apply( operation, list );
					device.operations[ command ] = operation;
					config.devices[ name ] = device;
					configuration.write( config );
					return { status: 200, data: config.devices[ name ] };	
				}
			},
			removeCommand: {
				method: "DELETE",
				url: "/:name/:command",
				handle: function( envelope ) {
					var name = envelope.data.name;
					var command = envelope.data.command;
					var device = getDevice( name );
					var operation = getCommand( device, command );
					delete device.operations[ command ];
					config.devices[ name ] = device;
					configuration.write( config );
					return { status: 200, data: config.devices[ name ] };	
				}
			}
			
		}
	}
}