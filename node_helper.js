/* Magic Mirror
 * Module: MMM-OralB
 *
 * By SvenSommer https://github.com/SvenSommer
 * MIT Licensed.
 */
var NodeHelper = require('node_helper');
var noble = require('noble');

module.exports = NodeHelper.create({

    start: function () {
        console.log(this.name + ' helper started ...');

        noble.on('stateChange', function(state) {
            if (state === 'poweredOn') {
                noble.startScanning([], true);
                console.log('scanning was started. Everything is working fine.');
            }
            else  {
                noble.stopScanning();
                console.log('scanning stopped.');
            }
        }.bind(this));


    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "SEARCH_TOOTHBRUSH") {
            console.log('Notification SEARCH_TOOTHBRUSH in ' + this.name + ' received');
            return;
        }
    }
});
