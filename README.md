# MMM-OralB
This a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror). It tries to discover a OralB Toothbrush and starts a timer while its connected.

## Preview

## Installation

1. Enter module-directory: `cd ~/MagicMirror/modules`
2. Clone repository: `git clone https://github.com/SvenSommer/MMM-OralB`
3. Enter new directory: `cd ~/MagicMirror/modules/MMM-OralB`
4. Install dependencies: `sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev`
5. Install noble module: `npm install`
6. Rebuild package to avoid version conflict: `npm rebuild --runtime=electron --target=1.4.6 --abi=50`
7. Configure node/electron so that noble scanning can be executed without root permissions:
```
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
sudo setcap -r cap_net_raw+eip ~/MagicMirror/node_modules/electron/dist/electron
```
8. As a sideeffect electron cannot find the shared objects (since it's not compiled with the proper -rpathe set):
```
sudo cp -l ~/MagicMirror/node_modules/electron/dist/libnode.so /usr/lib/
sudo cp -l ~/MagicMirror/node_modules/electron/dist/libffmpeg.so /usr/lib/
```


## Integration

Add module information to your `~/MagicMirror/config/config.js`.

Here is an example of an entry in `config.js`:
```
{
        module: 'MMM-OralB',
        position: 'bottom_left',
	config: {
		autoHide: 5,		// autohide after 5 seconds inactivity
		multiTooth: true	// allow multiple toothbrushes at the same time
	}
},
```

## Special Thanks
- [Michael Teeuw](https://github.com/MichMich) for creating the genius [MagicMirror²](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
