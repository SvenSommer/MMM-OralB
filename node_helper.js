/* global require, module */
/* Magic Mirror
 * Node Helper: MMM-NetworkScanner
 *
 * By Ian Perrin http://ianperrin.com
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var noble = require("noble");



module.exports = NodeHelper.create({
    start: function function_name () {
        console.log("Starting module: " + this.name);
    },

    // Override socketNotificationReceived method.
    socketNotificationReceived: function(notification, payload) {
      //  console.log(this.name + ' received ' + notification);

        if (notification === "SEARCH_TOOTHBRUSH") {
            this.config = payload;
            this.scanNetwork();
            return true;
        }
    },

    scanNetwork: function() {
        console.log(this.name + " is scanning for toothbrushes");
    },


  });
