#!/usr/bin/env node


// 启动koa 服务器
/**
 * Module dependencies.
 */

import app from './koa-server';
import * as http from 'http';
import { loggerShow } from './utils/logger';
import { socketHandle } from './middleware/socketHandle';
//"exec": "ts-node app.ts" 
//socketIo
const socketIo = require("socket.io");

const debug = require('debug')('demo:server');
//引入配置文件
import env from '../config/';
// 将端口号设置为配置文件的端口号，默认值为3000,dev,test默认端口3001
const port = normalizePort(env.port || '3000');
// 打印输出端口号

loggerShow.info('listen prot: ' + env.port);

//初始化相关目录
var fs = require('fs');

if (!fs.existsSync(env.pathConfig.downloadPath)) {
  fs.mkdirSync(env.pathConfig.downloadPath)
}



const server = http.createServer(app.callback());


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
//socketIo
var io = new socketIo(server);
//每个客户端socket连接时都会触发 connection 事件
io.on("connection", socketHandle);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

