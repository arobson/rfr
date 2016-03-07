## rfr
An HTTP service to send RF signals over a 433Mhz transmitter for raspberry pi.

## Prerequisites
My setup:

 * Raspberry Pi 2
 * 433Mhz transmitter - wired to GPIO 17 (physical pin 11)
 * EDIMAX Wireless 802.11b/g/n nano USB adpater (EW-7811Un)
 * Raspbian (Jessie)
 * WiringPi
 * Node 5.7.1

## Installation
Please read all of this. Just running `npm install` will tank _hard_.

### Node
To get Node 5.7.x, I used their official tarball download: [node-5.7.1 ARMv7](https://nodejs.org/dist/v5.7.1/node-v5.7.1-linux-armv7l.tar.xz).

I fetch this via `wget` in a download folder, untar it, change to the new directory and then copy everything to /usr/local`.

### WiringPi
With git already installed:

```bash
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build
```

### NPM Install
Now with all the prerequisites in place, you should be able to get a working install via `npm`:

```bash
npm install
```

## API
Each device can have multiple operations defined where an operation is comprised of a `pulse` and `code`.

```json
{
	"name": "myLamp",
	"pulse": 178,
	"operations": {
		"on": {
			"code": 1234567
		},
		"off": {
			"code": 1234566
		}
	}
}
```

### List devices `GET /api/device`
Returns a list of devices that will include their operations as well.

### Add device `POST /api/device/:name`
Adds a new device definiiton.

### Get device info `GET /api/devices/:name`
Returns configuration for device.

### Update device `PATCH /api/device/:name`
Use JSON-PATCH specification to update the device.

### Remove device `DELETE /api/device/:name`
Deletes a command from the device.

### Add device command `POST /api/device/:name/:command`
Adds a new command to a device. A command only takes a `code` property with the integer code to send.

### Send command `PUT /api/device/:name/:command`
Sends the predefined command to the device.

### Updates a device command `PATCH /api/device/:name/:command`
Use JSON-PATCH specification to update the command.

### Remove a device command `DELETE /api/device/:name/:command`
Deletes a command from the device.


