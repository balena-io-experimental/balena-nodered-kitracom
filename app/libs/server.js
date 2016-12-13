#!/bin/env node

{
    const EventEmitter = require('events').EventEmitter;
    const util = require('util');
    const express = require('express');
    const compression = require('compression');
    const path = require('path');
    const mime = require('mime');
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
        this.port = (process.env.ENM_PORT == null) ? 3000 : process.env.ENM_PORT;
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

        app.get('/v1/devices/', (req, res) => {
            self.emit("devices", res);
        });

        app.post('/v1/devices/:id', (req, res) => {
            if (!req.params.id) {
                return res.status(400).send('Bad Request');
            }
            self.emit("connect", req.params.id, res);
        });

        app.delete('/v1/devices/:id', (req, res) => {
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

        app.listen(self.port, (req, res) => {
            callback();
        });

    };

    module.exports = server();
}
