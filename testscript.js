var noble = require('noble');


noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning([], true);
        console.log('scanning was started. Everything is working fine.');
    }
    else  {
        noble.stopScanning();
        console.log('scanning stopped.');
    }
});
