/* Magic Mirror
 * Module: MMM-OralB
 *
 * By Thomas Mirlacher https://github.com/ThomasMirlacher
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var noble = require('noble');

module.exports = NodeHelper.create({
	start() {
		noble.on('stateChange', (state) => {
			if (state === 'poweredOn') {
				noble.startScanning([], true);
			} else {
				noble.stopScanning();
			}
		});

		noble.on('discover', (peripheral) => {
			var adv = peripheral.advertisement;
			if (adv.manufacturerData) {
				var manufacturerId = adv.manufacturerData.readUInt16LE();
				if (manufacturerId == 0x00DC) {	// Procter & Gamble
					var payload = this.parseDataPG(adv.manufacturerData);
					payload.id = peripheral.id;
					payload.manufacturerId = manufacturerId;

					this.sendSocketNotification('MMM-OralB-DISPLAY_DATA', payload);
				}
			}
		});
	},

	socketNotificationReceived(notification, payload) {
		console.log(`rx_helper ${notification}`);
	},

	// NOTE: the following is guesswork, and if you have further information to back this up,
	//      or contradict this, please let me know <thomas>
	parseDataPG(data) {
		var payload = {};

		// len, data	1:2
		// 5: ...
		payload.battery = data[3+2];
		payload.over_pressure = data[4+2];	// NOTE: could also be flags
		payload.time_min = data[5+2];
		payload.time_sec = data[6+2];
		payload.mode = data[7+2];

		payload.data = data;
		payload.unknown = data[0+2] + "," + data[1+2] + "," + data[2+2];        // 1, 2, 5
		// ??? data[8+2]

		var payload2str = {
			1: "daily clean",
			2: "sensitive",
			3: "massage",
			4: "whitening",
			5: "deep clean",
			6: "??? tongue cleaning"
		};

		payload.time = payload.time_min * 60 + payload.time_sec;
		payload.mode_str = payload2str[payload.mode];

		return payload;
	}
});
