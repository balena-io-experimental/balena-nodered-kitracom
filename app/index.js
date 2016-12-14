#!/bin/env node

{
    const ble = require(__dirname + '/libs/bluetooth.js');
    const server = require(__dirname + '/libs/server.js');
    const enm = require(__dirname + '/libs/enm/helper.js');
    const spawn = require('child_process').spawn;
    const _ = require('lodash');
    let devicesRaw = [];
    let devices = [];
    let provisionedDevices = [];
    let discoveryStatus = false;

    // Start Node-RED
    const nodered = spawn('node-red', ['--settings', '/usr/src/app/settings.js']);
    nodered.stdout.on('data', (data) => {
        "use strict";
        console.log(`stdout: ${data}`);
    });
    nodered.stderr.on('data', (data) => {
        "use strict";
        console.log(`stderr: ${data}`);
    });
    nodered.on('close', (code) => {
        "use strict";
        console.log(`child process exited with code ${code}`);
    });

    ble.on("discover", (bbcmb) => {
        "use strict";
        devicesRaw.push(bbcmb);
        devices.push({
            id: bbcmb.id,
            address: bbcmb.address
        });
    });
    ble.on('buttonAChange', (data) => {
        "use strict";
        console.log(data);
    });
    ble.on('buttonBChange', (data) => {
        "use strict";
        console.log(data);
    });

    server.start(() => {
        "use strict";
        server.on('startDiscovery', (res) => {
            if (discoveryStatus === false) {
                discoveryStatus = true;
                ble.startScan();
            }
            res.status(200).send('OK');
        });

        server.on('stopDiscovery', (res) => {
            if (discoveryStatus === true) {
                discoveryStatus = false;
                ble.stopScan();
            }
            res.status(200).send('OK');
        });

        server.on('devices', (res) => {
            res.status(200).send(devices);
        });

        server.on('connect', (id, res) => {
            let microbit = _.find(devicesRaw, function(o) {
                return o.id == id;
            });
            let provisioned = _.find(provisionedDevices, function(o) {
                return o.id == id;
            });
            ble.connect(microbit, (device) => {
                if (!provisioned) {
                    enm.provision((error,data) => {
                        provisionedDevices.push({
                            uuid: data.uuid,
                            id: microbit.id,
                            address: microbit.address
                        });
                    });
                }
                res.status(200).send(microbit.id);
            });
        });

        server.on('disconnect', (id, res) => {
            let microbit = _.find(devicesRaw, function(o) {
                return o.id == id;
            });
            ble.disconnect(microbit, (device) => {
                res.status(200).send(microbit.id);
            });
        });

        server.on('text', (id, text, res) => {
            let microbit = _.find(devicesRaw, function(o) {
                return o.id == id;
            });
            ble.text(microbit, text, (device) => {
                res.status(200).send(text);
            });
        });

        server.on('accelerometer', (id, res) => {
            let microbit = _.find(devicesRaw, function(o) {
                return o.id == id;
            });
            ble.accelerometer(microbit, (data) => {
                res.status(200).send(data);
            });
        });

        server.on('temperature', (id, res) => {
            let microbit = _.find(devicesRaw, function(o) {
                return o.id == id;
            });
            ble.temperature(microbit, (data) => {
                res.status(200).send(data);
            });
        });
    });
}
