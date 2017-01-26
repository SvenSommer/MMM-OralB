/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */


Module.register("MMM-OralB",{

	// Default module config.
	defaults: {
			devices: [],
			updateInterval: 10,
	},


	// Override dom generator.
  start: function() {
		Log.info("Starting module: " + this.name);
		moment.locale(config.language);
		this.sendSocketNotification('SEARCH_TOOTHBRUSH',"");
	},

  getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.classList.add("small");

		// Display found Brushes
		if (!this.foundToothbrushes) {
				wrapper.innerHTML = this.translate("SEARCHING...");
				return wrapper;
		}

		return wrapper;
	},



});
