const net = require('net');
const Queue = require('mbr-queue');
const EMPTY = require('./constants.js').TYPE;
const operations = require('./operations/index.js');
const Packet = require('./packets.js');

function Rcon (params = EMPTY) {
  this.host = params.host || 'localhost';
  this.port = params.port || 27015;
  this.password = params.pass;
  this.debug = !!params.debug;

  this.queue = new Queue();
  this.socket = null;
}

Rcon.prototype.connect = function connect (params = EMPTY) {
  if (this.socket) {
    return;
  }

  const queue = this.queue;

  queue.push(operations.auth, {
    password: params.password || this.password,
    session: this,
    onSuccess: params.onSuccess,
    onError: params.onError
  });

  const _this = this;
  this.socket = new net.Socket();
  this.socket.on('close', function () {
    queue.trigger('close');
    _this.socket = null;
  });
  this.socket.on('connect', function () {
    queue.trigger('connect');
  });
  this.socket.on('data', function (data) {
    _this.debug && console.log('server:', data);
    queue.trigger('data', data);
  });
  this.socket.connect({
    port: this.port,
    host: this.host
  });

  return this;
};

Rcon.prototype.send = function send (command, params = EMPTY) {
  if (!this.socket) {
    return;
  }

  this.queue.push(operations.exec, {
    command: command,
    session: this,
    response: '',
    onSuccess: params.onSuccess,
    onError: params.onError
  });

  return this;
};

Rcon.prototype.write = function write (type, id, data) {
  const packet = Packet.write(type, id, data);
  this.debug && console.log('client:', packet);
  this.socket.write(packet);
};

Rcon.prototype.close = function close (params = EMPTY) {
  this.queue.push(operations.close, {
    session: this,
    onSuccess: params.onSuccess,
    onError: params.onError
  });

  return this;
}

module.exports = Rcon;
