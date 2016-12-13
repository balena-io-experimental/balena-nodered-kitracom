#!/bin/env node

{
    const BBCMicrobit = require('bbc-microbit');
    const EventEmitter = require('events').EventEmitter;
    const util = require('util');
    const debug = require('debug')('bluetooth');

    // declaring bluetooth lib
    let bluetooth = function() {
        "use strict";
        if (!(this instanceof bluetooth)) return new bluetooth();
    };
    util.inherits(bluetooth, EventEmitter);

    bluetooth.prototype.startScan = function() {
        "use strict";
        let self = this;
        debug("scan started");
        BBCMicrobit.discoverAll(function(microbit) {
            self.emit("discover", microbit);
            debug('\tFound a microbit: id = %s, address = %s', microbit.id, microbit.address);
        });
    };

    bluetooth.prototype.stopScan = function(callback) {
        "use strict";
        let self = this;
        BBCMicrobit.stopDiscoverAll(() => {
            debug("scan stopped");
            callback();
        });
    };

    bluetooth.prototype.connect = function(microbit, callback) {
        "use strict";
        let self = this;
        debug("connecting to device: ", microbit.id);
        microbit.connectAndSetUp(() => {
            debug('\tconnected to microbit', microbit.id);
            microbit.subscribeButtons((error) => {
                microbit.on('buttonAChange', function(value) {
                    self.emit('buttonAChange', {
                        id: microbit.id,
                        value: value
                    });
                });

                microbit.on('buttonBChange', function(value) {
                    self.emit('buttonBChange', {
                        id: microbit.id,
                        value: value
                    });
                });
                callback(microbit);
            });

        });
    };

    bluetooth.prototype.disconnect = function (microbit, callback) {
      "use strict";
      let self = this;
      debug("disconnecting from device: ", microbit.id);
      microbit.disconnect(callback);
    };

    bluetooth.prototype.text = function(microbit, text, callback) {
        "use strict";
        let self = this;
        debug("writing text to device: ", microbit.id);
        microbit.writeLedText(text, () => {
            callback(microbit);
        });
    };

    bluetooth.prototype.accelerometer = function(microbit, callback) {
        "use strict";
        let self = this;
        microbit.readAccelerometer((error, x, y, z) => {
            callback({
                id: microbit.id,
                x: x,
                y: y,
                z: z
            });
        });
    };

    bluetooth.prototype.temperature = function(microbit, callback) {
        "use strict";
        let self = this;
        microbit.readTemperature((error, temperature) => {
            callback({
                id: microbit.id,
                temperature: temperature
            });
        });
    };

    module.exports = bluetooth();
}
