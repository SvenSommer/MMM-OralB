/* global require, module */
/* Magic Mirror
 * Node Helper: MMM-NetworkScanner
 *
 * By Ian Perrin http://ianperrin.com
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var noble = require('noble');


var OralB_manufacturerData = 'dc00010205030000000101';
process.env['NOBLE_HCI_DEVICE_ID'] = 0

noble.on('stateChange', function(state) {
  console.log('changed state to:' + noble.state);
  if (state === 'poweredOn') {
    noble.startScanning();
  }else  {
    console.log('changed state to off: ' + noble.state);
    noble.stopScanning();
  }
});



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
        console.log(this.name + " is scanning for OralB Toothbrushes with manufacturerData: "' + OralB_manufacturerData +'"...");

        noble.on('discover', function(peripheral) {

          var advertisement = peripheral.advertisement;
          if (advertisement.manufacturerData.toString('hex') === OralB_manufacturerData) {
            console.log('Found OralB Tootbrush with localName: ' + advertisement.localName + ' ID: ' + peripheral.id);
            noble.stopScanning();




            var localName = advertisement.localName;
            var txPowerLevel = advertisement.txPowerLevel;
            var manufacturerData = advertisement.manufacturerData;
            var serviceData = advertisement.serviceData;
            var serviceUuids = advertisement.serviceUuids;

            if (localName) {
              console.log('  Local Name        = ' + localName);
            }

            if (txPowerLevel) {
              console.log('  TX Power Level    = ' + txPowerLevel);
            }

            if (manufacturerData) {
              console.log('  Manufacturer Data = ' + manufacturerData.toString('hex'));
            }

            if (serviceData) {
              console.log('  Service Data      = ' + serviceData);
            }

            if (serviceUuids) {
              console.log('  Service UUIDs     = ' + serviceUuids);
            }

            console.log();

            explore(peripheral);
          }
        });
    },

    function explore(peripheral) {
      console.log('services and characteristics:');

      peripheral.on('disconnect', function() {
        console.log('disconnect from peripheral: ' + peripheral.uuid);
        process.exit(0);
      });

      peripheral.connect(function(error) {
        console.log('connected to peripheral: ' + peripheral.uuid);
        peripheral.discoverServices([], function(error, services) {
          var serviceIndex = 0;

          async.whilst(
            function () {
              return (serviceIndex < services.length);
            },
            function(callback) {
              var service = services[serviceIndex];
              var serviceInfo = service.uuid;

              if (service.name) {
                serviceInfo += ' ServiceName: (' + service.name + ')';
              }
              console.log(serviceInfo);

              service.discoverCharacteristics([], function(error, characteristics) {
                var characteristicIndex = 0;

                async.whilst(
                  function () {
                    return (characteristicIndex < characteristics.length);
                  },
                  function(callback) {
                    var characteristic = characteristics[characteristicIndex];
                    var characteristicInfo = 'CharacteristicUuid !' + characteristic.uuid+ '!';

                    if (characteristic.name) {
                      characteristicInfo += ' CharacteristicName: (' + characteristic.name + ')';
                    }

                    async.series([
                      function(callback) {
                        characteristic.discoverDescriptors(function(error, descriptors) {
                          async.detect(
                            descriptors,
                            function(descriptor, callback) {
                              return callback(descriptor.uuid === '2901');
                            },
                            function(userDescriptionDescriptor){
                              if (userDescriptionDescriptor) {
                                userDescriptionDescriptor.readValue(function(error, data) {
                                  if (data) {
                                    characteristicInfo += ' CharacteristicInfo (' + data.toString() + ')';
                                  }
                                  callback();
                                });
                              } else {
                                callback();
                              }
                            }
                          );
                        });
                      },
                      function(callback) {
                            characteristicInfo += '\n    properties  ' + characteristic.properties.join(', ');

                        if (characteristic.properties.indexOf('read') !== -1) {
                          characteristic.read(function(error, data) {
                            if (data) {
                              var string = data.toString('ascii');

                              characteristicInfo += '\n    value       ' + data.toString('hex') + ' | \'' + string + '\'';
                            }
                            callback();
                          });
                        } else {
                          callback();
                        }
                      },
                      function() {
                        console.log(characteristicInfo);
                        characteristicIndex++;
                        callback();
                      }
                    ]);
                  },
                  function(error) {
                    serviceIndex++;
                    callback();
                  }
                );
              });
            },
            function (err) {
              peripheral.disconnect();
            }
          );
        });
      });
    }


  });
