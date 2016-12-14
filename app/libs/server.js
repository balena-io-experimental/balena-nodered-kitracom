#!/bin/env node

{
    const EventEmitter = require('events').EventEmitter;
    const util = require('util');
    const express = require('express');
    const request = require('request');
    const exec = require('child_process').exec;
    const compression = require('compression');
    const path = require('path');
    const mime = require('mime');
    const fs = require('fs');
    const chalk = require('chalk');
    const debug = require('debug')('http');
    const bodyParser = require("body-parser");
    const app = express();

    let errorHandler = function(err, req, res, next) {
        'use strict';
        res.status(500);
        res.render('error', {
            error: err
        });
    };
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(function(req, res, next) {
        'use strict';
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use(errorHandler);

    // declaring server
    let server = function() {
        'use strict';
        if (!(this instanceof server)) return new server();
        this.port = (process.env.MICROBIT_PORT == null) ? 1337 : process.env.MICROBIT_PORT;
    };
    util.inherits(server, EventEmitter);

    server.prototype.start = function(callback) {
        'use strict';
        let self = this;

        app.post('/v1/discovery/', (req, res) => {
            self.emit("startDiscovery", res);
        });

        app.delete('/v1/discovery/', (req, res) => {
            self.emit("stopDiscovery", res);
        });

        app.get('/v1/microbits/', (req, res) => {
            self.emit("devices", res);
        });

        app.post('/v1/microbits/:id', (req, res) => {
            if (!req.params.id) {
                return res.status(400).send('Bad Request');
            }
            self.emit("connect", req.params.id, res);
        });

        app.delete('/v1/microbits/:id', (req, res) => {
            if (!req.params.id) {
                return res.status(400).send('Bad Request');
            }
            self.emit("disconnect", req.params.id, res);
        });

        app.post('/v1/text/:id/:text', (req, res) => {
            if (!req.params.id) {
                return res.status(400).send('Bad Request');
            }
            self.emit("text", req.params.id, req.params.text, res);
        });

        app.get('/v1/accelerometer/:id', (req, res) => {
            if (!req.params.id) {
                return res.status(400).send('Bad Request');
            }
            self.emit("accelerometer", req.params.id, res);
        });

        app.get('/v1/temperature/:id', (req, res) => {
            if (!req.params.id) {
                return res.status(400).send('Bad Request');
            }
            self.emit("temperature", req.params.id, res);
        });

        // ENM
        app.put('/v1/devices/:uuid', function(req, res) {
            if (!req.params.uuid) {
                return res.status(400).send('Bad Request');
            }
            let commit = req.body.commit;
            let environment = req.body.environment;
            console.log(chalk.cyan('new Proxyvisor request: update'));
            console.log(chalk.bgYellow(chalk.black('Request Parameters:')));
            console.dir(req.params);
            console.log(chalk.bgYellow(chalk.black('Request Body:')));
            console.dir(req.body);
            console.log(chalk.bgYellow(chalk.black('downloading ' + process.env.RESIN_SUPERVISOR_ADDRESS + '/v1/assets/' + commit)));
            let destFile = fs.createWriteStream('/data/' + req.body.commit + '.tar');
            request
                .get(process.env.RESIN_SUPERVISOR_ADDRESS + '/v1/assets/' + commit + '?apikey=' + process.env.RESIN_SUPERVISOR_API_KEY)
                .on('error', function(err) {
                    console.log(chalk.red(err));
                })
                .on('response', function(response) {
                    console.log(chalk.bgYellow(chalk.black('Status Code:')));
                    console.dir(response.statusCode);
                    console.log(chalk.bgYellow(chalk.black('Content Type:')));
                    console.dir(response.headers['content-type']);
                })
                .pipe(destFile);
            destFile.on('finish', function() {
                console.log(chalk.yellow('update downloaded as ' + '/data/' + req.body.commit + '.tar'));
                self.emit('update',req.body.commit,req.params.uuid);
            });
            res.status(200).send('OK');
        });

        app.listen(self.port, '127.0.0.1', (req, res) => {
            callback();
        });

    };

    module.exports = server();
}
