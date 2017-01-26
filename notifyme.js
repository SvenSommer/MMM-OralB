var async = require('async');
var noble = require('noble');

var OralB_manufacturerData = 'dc00010205030000000101';
process.env['NOBLE_HCI_DEVICE_ID'] = 0

noble.on('stateChange', function(state) {

  if (state === 'poweredOn') {
      noble.startScanning();
      console.log('scanning...');
  }else  {
    noble.stopScanning();
     console.log('stoppped scanning');
  }
});


console.log('Searching for OralB Toothbrushes with manufacturerData: "' + OralB_manufacturerData +'"...');

noble.on('discover', function(peripheral) {
    var advertisement = peripheral.advertisement
    console.log('Found a device with localName: ' + advertisement.localName + ' ID: ' + peripheral.id);

    if (advertisement.manufacturerData.toString('hex') === OralB_manufacturerData) {
        console.log('Found OralB Tootbrush with localName: ' + advertisement.localName + ' ID: ' + peripheral.id);

        peripheral.connect(function(error) {
            console.log('connected to peripheral: ' + peripheral.uuid);
            explore(peripheral);
        });
    }
});



function explorecharacterisitcs(peripheral){
    console.log('exploring ' + peripheral.uuid + '...');
    peripheral.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
        characteristics.forEach((characteristic) => {
            var characteristicInfo = '';
            async.series([
                function(callback) {
                    characteristic.discoverDescriptors(function(error, descriptors) {
                        async.detect(
                          descriptors,
                          function(descriptor, callback) {
                              return callback(descriptor.uuid === '2901');
                          },
                          function(userDescriptionDescriptor){
                            console.log('found userDescriptionDescriptor...');
                            if (userDescriptionDescriptor) {
                              console.log('found something...');
                              userDescriptionDescriptor.readValue(function(error, dataDesc) {
                                if (dataDesc) {
                                    if (characteristic.properties.indexOf('read') !== -1) {
                                        characteristic.read(function(error, dataChar) {
                                          if (dataChar) {
                                            var string = dataChar.toString('ascii');
                                            console.log(dataDesc.toString() +'=' + dataChar.toString('hex'));
    /*
                                            if (characteristic.properties.indexOf('notify') !== -1){
                                                // true to enable notify
                                                characteristic.notify(true, function(error) {
                                                console.log(dataDesc.toString() + ' notification on');
                                                });
                                            }
    */
                                            }
                                        });
                                    }
                                }
                                callback();
                              });
                            } else {
                                callback();
                            }
                          }
                        );
                    });
                }
            ]);
        });
    });
}
/*                    peripheral.discoverServices(['a0f0ff0650474d5382084f72616c2d42'], function(error, services) {
                        var ButtonState = services[0];
                        console.log('discovered Button State service');

                        ButtonState.discoverCharacteristics(['a0f0ff0650474d5382084f72616c2d42'], function(error, characteristics) {
                           var buttonStateCharacteristic = characteristics[0];
                           console.log('discovered Button State characteristic');

                           buttonStateCharacteristic.on('read', function(data, isNotification) {
                               console.log('Button State is now: ', data.readUInt8(0));
                           });

                           // true to enable notify
                           buttonStateCharacteristic.notify(true, function(error) {
                               console.log('Button State notification on');
                           });

                       });
                   });

*/
