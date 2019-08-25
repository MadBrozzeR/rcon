const net = require('net');
const common = require('./common.js');
const TYPE = require('../constants.js').TYPE;
const Packet = require('../packets.js');

module.exports = {
  init: function () {
    const session = this.params.session;
    const queue = this.queue;

    if (session.socket) {
      this.queue.trigger('error', new Error('Connection is already established'));
      return;
    }

    session.socket = new net.Socket();

    try {
      session.socket.on('close', function () {
        queue.trigger('close');
        (session.rcon.onClose instanceof Function) && session.rcon.onClose();
        session.socket = null;
      });
      session.socket.on('connect', function () {
        queue.trigger('connect');
      });
      session.socket.on('data', function (data) {
        session.rcon.debug && console.log('server:', data);
        const packets = Packet.read(data);
        for (let index = 0 ; index < packets.length ; ++index) {
          queue.trigger('data', packets[index]);
        }
      });
      session.socket.on('error', function (error) {
        queue.trigger('error', error);
      });
      session.socket.connect({
        port: session.rcon.port,
        host: session.rcon.host
      });
    } catch (error) {
      session.socket = null;
      queue.trigger('error', error);
    }
  },
  connect: function () {
    this.queue.trigger('success');
  },
  error: common.error,
  success: common.success
};
