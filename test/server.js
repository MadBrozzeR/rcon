const net = require('net');

const NOT_HEX_RE = /[^\da-fA-F]/g;
const HEX = 'hex';

function toBuffer (hex) {
  return Buffer.from(hex.replace(NOT_HEX_RE, ''), HEX);
}

function Server (listener) {
  this.server = new net.Server();
  this.server.on('connection', function (socket) {
    socket.on('data', listener);
  });
  this.server.on('close', function () {
    this.unref();
  });
}
Server.prototype.listen = function (port, callback) {
  return this.server.listen(port, 'localhost', callback);
}
Server.prototype.close = function () {
  return this.server.close();
}

Server.listener = {
  buffers: function (listeners) {
    const prepared = {};

    for (let item in listeners) {
      prepared[item.replace(NOT_HEX_RE, '')] = listeners[item];
    }

    return function (data) {
      const request = data.toString(HEX);
      const socket = this;

      if (prepared[request] instanceof Array) {
        for (let index = 0 ; index < prepared[request].length ; ++index) {
          socket.write(toBuffer(prepared[request][index]));
        }
      } else if (typeof prepared[request] === 'string') {
        socket.write(toBuffer(prepared[request]));
      }
    }
  }
};

module.exports = Server;
