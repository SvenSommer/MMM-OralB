/* Magic Mirror
 * Module: MMM-OralB
 *
 * By Thomas Mirlacher https://github.com/ThomasMirlacher
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const noble = require('noble');

module.exports = NodeHelper.create({
	start() {
		this.duplicateData = {};
		this.duplicateFilterTimeout = 0;	// 0 ... do not timeout data

		noble.on('stateChange', (state) => {
			if (state === 'poweredOn') {
				noble.startScanning([], true);
			} else {
				noble.stopScanning();
			}
		});

		noble.on('discover', (peripheral) => {
			const adv = peripheral.advertisement;
			if (adv.manufacturerData) {
				if (this.isDuplicate(peripheral.id, adv.manufacturerData)) {
					return;
				}

				const manufacturerId = adv.manufacturerData.readUInt16LE();
				if (manufacturerId === 0x00DC) {	// Procter & Gamble
					const payload = this.parseDataPG(adv.manufacturerData);
					payload.id = peripheral.id;
					payload.manufacturerId = manufacturerId;

					// DEBUG
					// console.dir(payload);

					this.sendSocketNotification('MMM-OralB-DISPLAY_DATA', payload);
				}
			}
		});
	},

	socketNotificationReceived(notification, payload) {
		if (notification === 'MMM-OralB-CONFIG') {
			if (payload.autoHide > 0) {
				this.duplicateFilterTimeout = payload.autoHide / 2;
			}
		}

		console.log(`rx_helper ${notification}`);
	},

	isDuplicate(id, data) {
		if (this.duplicateData[id] && !Buffer.compare(data, this.duplicateData[id].data)) {		// is duplicate
			if (!this.duplicateFilterTimeout || this.duplicateData[id].timeout > Date.now()) {	// if timeout chekck for timeout
				return true;
			}
		}

		this.duplicateData[id] = {
			data,
			timeout: Date.now() + this.duplicateFilterTimeout * 1000
		};

		return false;
	},

	// NOTE: the following is guesswork, and if you have further information to back this up,
	//      or contradict this, please let me know
	parseDataPG(data) {
		const payload = {};

		payload.state = data[3 + 2];
		payload.over_pressure = data[4 + 2];	// NOTE: could also be flags
		payload.time_min = data[5 + 2];
		payload.time_sec = data[6 + 2];
		payload.mode = data[7 + 2];
		payload.sector = data[8 + 2];		// no sector: 15, last_sector: 0

		payload.data = data;

		const state2str = {
			2: 'idle',
			3: 'brushing',
			4: 'charging'
		};

		const mode2str = {
			0: 'off',
			1: 'daily clean',
			2: 'sensitive',
			3: 'massage',
			4: 'whitening',
			5: 'deep clean',
			6: 'tongue cleaning',
			7: 'turbo'
		};

		payload.time = payload.time_min * 60 + payload.time_sec;
		payload.mode_str = mode2str[payload.mode];
		payload.state_str = state2str[payload.state];

		return payload;
	}
});
