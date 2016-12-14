#!/bin/env node

{
    const request = require('request');
    const EventEmitter = require('events').EventEmitter;
    const util = require('util');
    const exec = require('child_process').exec;

    // declaring enm helper
    let enmHelper = function() {
        'use strict';
        if (!(this instanceof enmHelper)) return new enmHelper();
    };
    util.inherits(enmHelper, EventEmitter);

    enmHelper.prototype.provision = function(callback) {
        'use strict';
        let self = this;

        request.post({
            url: process.env.RESIN_SUPERVISOR_ADDRESS + '/v1/devices?apikey=' + process.env.RESIN_SUPERVISOR_API_KEY,
            form: {
                appId: process.env.DEPENDENT_APP_ID
            }
        }, function(error, response, body) {
            body = JSON.parse(body);
            callback(error,body);
        });
    };

    enmHelper.prototype.dfu = function(commit, microbit, callback) {
        'use strict';
        exec('tar xvf ' + '/data/' + commit + '.tar '+ commit, (error, stdout, stderr) => {
          exec('python2 update.py -a ' + microbit.uuid + ' -z /data/' + commit + '/application.zip', (error, stdout, stderr) => {
              callback(error);
          });
        });
    };

    module.exports = enmHelper();
}
