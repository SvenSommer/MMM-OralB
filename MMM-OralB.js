/* global Module */

/* Magic Mirror
 * Module: MMM-OralB
 *
 * By SvenSommer
 * MIT Licensed.
 */

Module.register("MMM-OralB",{

	// Default module config.
	defaults: {
			updateInterval: 1000,
			debug: true
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;
		this.getData();

		setInterval(function() {
			self.getData()
			self.updateDom();
		}, this.config.updateInterval);
	},

	processData: function() {
		var self = this;

		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

	},

	/*
	 * getData
	 * function returns data and shows it in the module wrapper
	 * get Toothbrush Time
	 *
	 */
	getData: function() {
		var self = this;
		//this.loaded = false;
		this.sendSocketNotification("MMM-OralB-GET_DATA", this.config);
		this.loaded = true;
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();

		}, nextLoad);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		wrapper.className = "small";
		if(!this.loaded) {
                wrapper.innerHTML = "Loading...";
				wrapper.classname = "small dimmed";
                return wrapper;
        }

		if (this.dataNotification) {
			if (this.debug) {
				console.log(this.dataNotification);
			}

			var wrapperDataNotification = document.createElement("div");
			var timelabel = document.createElement("label");
			timelabel.innerHTML =  this.translate("Time") + this.dataNotification.brushingTime;
			wrapper.appendChild(timelabel);

			if (this.config.debug) {
				var d = new Date();
				var labelLastUpdate = document.createElement("label");
				labelLastUpdate.innerHTML = "<br><br>Updated: " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)+ ":" + ("0" + d.getSeconds()).slice(-2) + "<br>Intervall: " + this.config.updateInterval/1000 + "s";
				wrapper.appendChild(labelLastUpdate);
			}

			return wrapper;
		}
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-OralB.css", "font-awesome.css"
		];
	},

	// Load translations files
	getTranslations: function() {
		return {
				en: "translations/en.json",
			    es: "translations/es.json",
				de: "translations/de.json",

			};
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if (this.debug) {
			console.log(notification, " by MMM-OralB.js received");
		}

		if(notification === "MMM-OralB-DISPLAY_DATA") {
			this.dataNotification = payload;
			this.updateDom();
			this.loaded = true;
		}
	},

});
