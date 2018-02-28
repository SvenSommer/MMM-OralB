/* Magic Mirror
 * Module: MMM-OralB
 *
 * By SvenSommer https://github.com/SvenSommer
 * MIT Licensed.
 */
var NodeHelper = require('node_helper');
var noble = require('noble');

module.exports = NodeHelper.create({

    // Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		var self = this;
		this.config = payload;
		if (self.config.debug) {
			 console.log(notification, "received by node_helper.js received");
		}
		if (notification === "MMM-OralB-GET_DATA") {
			this.getDataFromBrush(function(data){
					self.sendNotification_DISPLAY_DATA(data);
			});
		}
	},

	// Example function send notification test
	sendNotification_DISPLAY_DATA: function(payload) {
		this.sendSocketNotification("MMM-OralB-DISPLAY_DATA", payload);
	},

	getDataFromBrush: function(callback) {
		var	self = this;
        var toothbrushDataObject= {
			'brushingTime':   24 ,
			'sector':  4}

		callback(toothbrushDataObject);
	},
});
