var async = require('async');
var noble = require('noble');

var OralB_manufacturerData = 'dc00010205030000000101';
process.env['NOBLE_HCI_DEVICE_ID'] = 0

noble.on('stateChange', function(state) {
    console.log('changed state to:' + noble.state);
    if (state === 'poweredOn') {
        noble.startScanning();
    } else  {
        console.log('changed state to off: ' + noble.state);
        noble.stopScanning();
    }
});


console.log('Searching for OralB Toothbrushes with manufacturerData: "' + OralB_manufacturerData +'"...');

noble.on('discover', function(peripheral) {
    var advertisement = peripheral.advertisement;
    if (advertisement.manufacturerData) {
        if (advertisement.manufacturerData.toString('hex') === OralB_manufacturerData) {
            console.log('Found OralB Tootbrush with ID: ' + peripheral.id);
            noble.stopScanning();
        }
    }

});
