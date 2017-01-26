/* global require, module */
/* Magic Mirror
 * Node Helper: MMM-NetworkScanner
 *
 * By Ian Perrin http://ianperrin.com
 * MIT Licensed.
 */


"use strict";

var NodeHelper = require("node_helper");
var noble = require('noble');
var inRange = [];
var EXIT_GRACE_PERIOD = 2000; // milliseconds
var isrunning = false;
var toothbrush_uuid = '544a1621209f';
process.env['NOBLE_HCI_DEVICE_ID'] = 0

var Clock = {
  totalSeconds: 0,

  start: function () {
    var self = this;


    this.interval = setInterval(function () {
      self.totalSeconds += 1;

      console.log(Math.floor(self.totalSeconds / 60 % 60) + ':' + parseInt(self.totalSeconds % 60));
    }, 1000);
  },

    pause: function () {
      clearInterval(this.interval);
      delete this.interval;
    },

    resume: function () {
      if (!this.interval) this.start();
    },

    stop: function(){
        this.totalSeconds = 0;
        clearInterval(this.interval);
        delete this.interval;
    }
};


setInterval(function() {
  for (var id in inRange) {
    if (inRange[id].lastSeen < (Date.now() - EXIT_GRACE_PERIOD)) {
      var peripheral = inRange[id].peripheral;
      if (peripheral.uuid === toothbrush_uuid){
          //console.log('Toothbrush OFF at ' + new Date() + ' was alive since ' + inRange[id].datealive);
          var diff = new Date() - inRange[id].datealive;
          if (Math.floor(diff / (1000)) > 3) {
              console.log('alive for ' + Math.floor(diff / (1000)) + ' sec => stopped; => resetting timer');
             isrunning = false;
              Clock.stop();
          }
          else {
              console.log('two input in less than 3 sec! ('+ Math.floor(diff / (1000)) + ' sec) => ignoring input!' );
          }
      }
      delete inRange[id];
    }
  }
}, EXIT_GRACE_PERIOD / 2);

function searchToothbrush(){


}

module.exports = NodeHelper.create({
    start: function function_name () {
        console.log("Starting module: " + this.name);


    },

    // Override socketNotificationReceived method.
    socketNotificationReceived: function(notification, payload) {
        if (notification === "SEARCH_TOOTHBRUSH") {
            this.config = payload;
            console.log("Starting SEARCH_TOOTHBRUSH!");
            console.log(noble.status);
            noble.on('stateChange', function(state) {
                if (state === 'poweredOn') {
                    noble.startScanning([], true);
                    console.log('scanning started...');
                } else if (state === 'unknown'){
                    console.log('unable to initialise bluetooth adapter -> state unknown');
                }
                else  {
                    noble.stopScanning();
                    console.log('scanning stopped.');
                }
            }.bind(this));

            console.log(noble.status);

            noble.on('discover', function(peripheral) {

                var id = peripheral.id;
                var entered = !inRange[id];
                console.log(this.name + 'startet to search for Toothbrush with ID:' + toothbrush_uuid);
                if (entered) {
                    inRange[id] = {
                        peripheral: peripheral,
                        datealive:  new Date()
                    };
                    if (peripheral.uuid === toothbrush_uuid){
                    console.log('Toothbrush ALIVE ' + new Date());
                        if (isrunning === true) {
                            console.log('Toothbrush stopped');
                            Clock.pause();
                            isrunning = false;
                        }else {
                            console.log('Toothbrush is running');
                            isrunning = true;
                            Clock.resume();
                        }
                    }
                }
                inRange[id].lastSeen = Date.now();

            }.bind(this));
            console.log(noble.status);

            return true;
        }
    },

  });
