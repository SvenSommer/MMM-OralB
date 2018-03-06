/* global Module */

/* Magic Mirror
 * Module: MMM-OralB
 *
 * By SvenSommer & Thomas Mirlacher
 * MIT Licensed.
 */

Module.register('MMM-OralB', {
	defaults: {
		autoHide: 5
	},

	getStyles() {
		return ['MMM-OralB_styles.css'];
	},

	init() {
		this.notificationData = [];
		this.gfx = [
			'M 112 58 A 50 50 0 0 0 62 8 L 62 18 A 40 40 0 0 1 102 58 Z',
			'M 62 112 A 50 50 0 0 0 112 62 L 102 62 A 40 40 0 0 1 62 102 Z',
			'M 8 62 A 50 50 0 0 0 58 112 L 58 102 A 40 40 0 0 1 18 62 Z',
			'M 58 8 A 50 50 0 0 0 8 58 L 18 58 A 40 40 0 0 1 58 18 Z'
		];
	},

	start() {
		this.sendSocketNotification('MMM-OralB-CONFIG', this.config);
	},

	socketNotificationReceived(notification, payload) {
		if (notification === 'MMM-OralB-DISPLAY_DATA') {
			let key = payload.id;

			if (this.notificationData[key] && this.notificationData[key]._autohideTimer) {
				clearTimeout(this.notificationData[key]._autohideTimer);
			}

			this.notificationData[key] = payload;
			this.updateDom();
		}
	},

	getDom() {
		var wrapper = document.createElement('div');

		for (var id in this.notificationData) {
			wrapper.appendChild(this.notificationData[id]._dom || this.getDomData(id));
		}

		return wrapper;
	},

	getDomData(id) {
		var svgns = 'http://www.w3.org/2000/svg';

		var wrapper = document.createElement('div');
		var svgWrapper = document.createElementNS(svgns, 'svg');
		svgWrapper.setAttribute('width', '150px');
		svgWrapper.setAttribute('height', '150px');
		var gWrapper = document.createElementNS(svgns, 'g');

		var payload = this.notificationData[id];
		if (payload === {}) {
			return wrapper;
		}

		// DEBUG
		// console.dir(payload);

		for (var i=1;i<=4;i++) {
			var newElement = document.createElementNS(svgns, 'path');
			newElement.setAttribute('d', this.gfx[i-1]);

			if (i<=payload.sector) {
				newElement.classList.add('enabled');
			}

			if (i == payload.sector) {
				newElement.classList.add('blinking');
			}
			gWrapper.appendChild(newElement);
		}

		svgWrapper.appendChild(gWrapper);

		function appendTxt(node, key, val) {
			var elem = document.createElement('div');
			elem.innerHTML = key + ': ' + val;

			node.appendChild(elem);
			return elem;
		}

		var txtWrapper = document.createElement('div');
		if (payload.time_min !== undefined) {
			appendTxt(txtWrapper, 'time', payload.time_min + ':' + payload.time_sec);
			appendTxt(txtWrapper, 'mode', payload.mode_str);
			appendTxt(txtWrapper, 'state', payload.state_str);
			appendTxt(txtWrapper, 'pressure', payload.over_pressure);
		}

		txtWrapper.className = 'dimmed small';
		txtWrapper.style.verticalAlign = 'top';
		txtWrapper.style.display = 'inline-block';

		wrapper.append(svgWrapper);
		wrapper.append(txtWrapper);

		// cache the dom data
		this.notificationData[id]._dom = wrapper;

		if (this.config.autoHide > 0) {
			this.notificationData[id]._autohideTimer = setTimeout(() => {
				delete this.notificationData[id];
				this.updateDom();
			}, this.config.autoHide * 1000);
		}

		return wrapper;
	},
});
