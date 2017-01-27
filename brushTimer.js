"use strict";



var NodeHelper = require("node_helper");
var noble = require('noble');

//Paste your ID here
var toothbrush_uuid = '544a1621209f';

process.env['NOBLE_HCI_DEVICE_ID'] = 0
var inRange = [];
var EXIT_GRACE_PERIOD = 2000; // milliseconds
var isrunning = false;

var cooldown_date = new Date();
cooldown_date.setDate(cooldown_date.getDate()-5);

searchToothbrush();

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
});

setInterval(function() {
    for (var id in inRange) {
        if (inRange[id].lastSeen < (Date.now() - EXIT_GRACE_PERIOD)) {
            var peripheral = inRange[id].peripheral;
                if (peripheral.uuid === toothbrush_uuid){
                    console.log('Toothbrush connection LOST at ' + new Date() + ' was alive since ' + inRange[id].datealive);
                    var diff = new Date() - inRange[id].datealive;
                    if (Math.floor(diff / (1000)) > 3) {
                        var colldown_diff = new Date() - cooldown_date
                        console.log('Cooldown was' + Math.floor(colldown_diff / (1000)) + ' sec => => resetting timer');
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
    noble.on('discover', function(peripheral) {
        var id = peripheral.id;
        var entered = !inRange[id];

        if (entered) {
            inRange[id] = {
                peripheral: peripheral,
                datealive:  new Date()
            };
            if (peripheral.uuid === toothbrush_uuid){
                console.log('Toothbrush connection ALIVE at' + new Date());

                if (isrunning === true) {
                    console.log('Toothbrush stopped. "Cool down" for 32 seconds needed!');
                    Clock.pause();
                    isrunning = false;
                    cooldown_date = new Date();
                }else {
                    var colldown_diff = new Date() - cooldown_date
                    if (Math.floor(colldown_diff / (1000)) < 33) {
                        console.log('Cooldown is needed! Resetting cooldown timer to 32 sec!');
                        cooldown_date = new Date();
                    }
                    else {
                        console.log('Toothbrush is running');
                        isrunning = true;
                        Clock.resume();
                    }

                }
            }
        }
        inRange[id].lastSeen = Date.now();

    });
}
