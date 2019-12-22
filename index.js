const Queue = require('mbr-queue');
const EMPTY = require('./constants.js').TYPE;
const operations = require('./operations/index.js');
const Packet = require('./packets.js');

function Rcon (params = EMPTY) {
  this.host = params.host || 'localhost';
  this.port = params.port || 27015;
  this.password = params.password || params.pass;
  this.debug = !!params.debug;
  this.onClose = params.onClose;
}

function Connection (rcon, params) {
  this.rcon = rcon;

  this.queue = new Queue();
  this.socket = null;

  this.queue.push(operations.connect, {
    session: this,
    onSuccess: params.onSuccess,
    onError: params.onError
  });
}

Rcon.prototype.connect = function connect (params = EMPTY) {
  return new Connection(this, params);
};

Connection.prototype.auth = function auth (params = EMPTY) {
  this.queue.push(operations.auth, {
    password: params.password || this.rcon.password,
    session: this,
    onSuccess: params.onSuccess,
    onError: params.onError
  });

  return this;
}

Connection.prototype.send = function send (command, params = EMPTY) {
  this.queue.push(operations.exec, {
    command: command,
    session: this,
    response: '',
    onSuccess: params.onSuccess,
    onError: params.onError
  });

  return this;
};

Connection.prototype.write = function write (type, id, data) {
  const packet = Packet.write(type, id, data);
  this.rcon.debug && console.log('client:', packet);
  this.socket.write(packet);
};

Connection.prototype.close = function close (params = EMPTY) {
  this.queue.push(operations.close, {
    session: this,
    onSuccess: params.onSuccess,
    onError: params.onError
  });

  return this;
}

module.exports = Rcon;
