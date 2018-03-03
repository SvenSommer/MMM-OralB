/* global Module */

/* Magic Mirror
 * Module: MMM-OralB
 *
 * By SvenSommer & Thomas Mirlacher
 * MIT Licensed.
 */

Module.register('MMM-OralB', {
	defaults: {
	},

	init() {
		this.notificationData = {};
		this.gfx = [
			'd="M 112 58 A 50 50 0 0 0 62 8 L 62 18 A 40 40 0 0 1 102 58 Z"',
			'd="M 62 112 A 50 50 0 0 0 112 62 L 102 62 A 40 40 0 0 1 62 102 Z"',
			'd="M 8 62 A 50 50 0 0 0 58 112 L 58 102 A 40 40 0 0 1 18 62 Z"',
			'd="M 58 8 A 50 50 0 0 0 8 58 L 18 58 A 40 40 0 0 1 58 18 Z"'
		];
	},

	// FIXME: it seems we need this call, otherwise the helper cannot send data???
	start() {
		this.sendSocketNotification("start", {});
	},

	getTemplate() {
		if (this.notificationData.id) {
			return "loading...";
		} else {
			return 'MMM-OralB.njk';
		}
	},

	getTemplateData() {
		return this.notificationData;
	},

	socketNotificationReceived(notification, payload) {
		if (notification === 'MMM-OralB-DISPLAY_DATA') {
			this.notificationData = payload;
			this.notificationData.gfx = '<svg><g stroke="darkgrey" fill="none">';

			var i=0;
			for (;i<4 && i<payload.sector;i++) {
				this.notificationData.gfx += `<path fill="darkgrey" ${this.gfx[i]}/>`;
			}
			for (;i<4;i++) {
				this.notificationData.gfx += `<path ${this.gfx[i]}/>`;
			}
			this.notificationData.gfx += '</g></svg>';

			this.updateDom();
		}
	},
});
