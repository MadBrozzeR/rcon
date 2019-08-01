const net = require('net');
const common = require('./common.js');
const TYPE = require('../constants.js').TYPE;
const Packet = require('../packets.js');

const AUTH_PACKET_ID = 0;

module.exports = {
  init: function () {
    const session = this.params.session;
    session.socket = new net.Socket();
    const queue = this.queue;

    try {
      session.socket.on('close', function () {
        queue.trigger('close');
        session.socket = null;
      });
      session.socket.on('connect', function () {
        queue.trigger('connect');
      });
      session.socket.on('data', function (data) {
        session.debug && console.log('server:', data);
        const packets = Packet.read(data);
        for (let index = 0 ; index < packets.length ; ++index) {
          queue.trigger('data', packets[index]);
        }
      });
      session.socket.connect({
        port: session.port,
        host: session.host
      });
    } catch (error) {
      session.socket = null;
      queue.trigger('error', error);
    }
  },
  connect: function () {
    try {
      this.params.session.write(
        TYPE.AUTH,
        AUTH_PACKET_ID,
        this.params.password
      );
    } catch (error) {
      this.queue.trigger('error', error);
    }
  },
  data: function (packet) {
    if (packet.type === TYPE.AUTH_RESPONSE) {
      if (packet.id === AUTH_PACKET_ID) {
        this.queue.trigger('success');
      } else {
        this.queue.trigger('error', new Error('Authentication error'));
      }
    }
  },
  error: function (error) {
    common.error.call(this, error);
  },
  success: common.success
};
