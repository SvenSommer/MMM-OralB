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
		this.dataNotification = {};
	},

	// FIXME: it seems we need this call, otherwise the helper cannot send data???
	start() {
		this.sendSocketNotification("start", {});
	},

	// FIXME: build a great UI
	getTemplate() {
		if (this.dataNotification.id) {
			return "loading...";
		} else {
			return 'MMM-OralB.njk';
		}
	},

	getTemplateData() {
		return this.dataNotification;
	},

	socketNotificationReceived(notification, payload) {
		if (notification === 'MMM-OralB-DISPLAY_DATA') {
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});
