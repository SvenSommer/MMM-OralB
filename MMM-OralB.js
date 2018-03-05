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

	getStyles() {
		return ["MMM-OralB_styles.css"];
	},

	init() {
		this.notificationData = {};
		this.gfx = [
			'M 112 58 A 50 50 0 0 0 62 8 L 62 18 A 40 40 0 0 1 102 58 Z',
			'M 62 112 A 50 50 0 0 0 112 62 L 102 62 A 40 40 0 0 1 62 102 Z',
			'M 8 62 A 50 50 0 0 0 58 112 L 58 102 A 40 40 0 0 1 18 62 Z',
			'M 58 8 A 50 50 0 0 0 8 58 L 18 58 A 40 40 0 0 1 58 18 Z'
		];
	},

	// FIXME: it seems we need this call, otherwise the helper cannot send data???
	start() {
		this.sendSocketNotification("start", {});
	},

	socketNotificationReceived(notification, payload) {
		if (notification === 'MMM-OralB-DISPLAY_DATA') {
			this.notificationData = payload;
			this.updateDom();
		}
	},


	getDom() {
		var svgns = "http://www.w3.org/2000/svg";

		var wrapper = document.createElement("div");
		var svgWrapper = document.createElementNS(svgns, 'svg');
		svgWrapper.setAttribute("width", "150px");
		svgWrapper.setAttribute("height", "150px");
		var gWrapper = document.createElementNS(svgns, 'g');

		var payload = this.notificationData;
		if (payload === {}) {
			return wrapper;
		}

		// DEBUG
		// console.dir(payload);

		for (var i=0;i<4;i++) {
			var newElement = document.createElementNS(svgns, 'path');
			newElement.setAttribute("d", this.gfx[i]);

			if (i<payload.sector) {
				newElement.classList.add("enabled");
			}

			if (i == payload.sector-1) {
				newElement.classList.add("blinking");
			}
			gWrapper.appendChild(newElement);
		}

		svgWrapper.appendChild(gWrapper);

		function appendTxt(node, key, val) {
			var elem = document.createElement("div");
			elem.innerHTML = key + ": " + val;

			node.appendChild(elem);
			return elem;
		}

		var txtWrapper = document.createElement("div");
		if (payload.time_min !== undefined) {
			appendTxt(txtWrapper, "time", payload.time_min + ":" + payload.time_sec);
			appendTxt(txtWrapper, "mode", payload.mode_str);
			appendTxt(txtWrapper, "state", payload.state_str);
			appendTxt(txtWrapper, "pressure", payload.over_pressure);
		}

		txtWrapper.className = "dimmed small";
		txtWrapper.style.verticalAlign = "top";
		txtWrapper.style.display = "inline-block";

		wrapper.append(svgWrapper);
		wrapper.append(txtWrapper);

		return wrapper;
	}
});
