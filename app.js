'use strict';

const express = require('express');
const compression = require('compression');
const cluster = require('cluster');
const app = express();
const numCPUs = require('os').cpus().length;

const isMasterWorker = cluster.isMaster && !module.parent;
const basePath = process.env.BASE_PATH || '';

app.use(compression());

app.set('x-powered-by', false)

function clusterApp(){
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', worker => console.error(`worker ${worker.process.pid} died`));

    console.info("cors-container listening on port 3000 with " + numCPUs + " threads.")
}

function listen(){
    app.listen(process.env.PORT || 3000);
}

if (isMasterWorker) {
    clusterApp();
} else {
    if (!module.parent) {
        listen();
    }
}

require(__dirname + '/bootstrap')(app, {
    basePath,
});

module.exports = app;
