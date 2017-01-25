#!/bin/env node

{
    const spawn = require('child_process').spawn;

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

}
