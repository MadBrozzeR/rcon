const common = require('./common.js');
const TYPE = require('../constants.js').TYPE;
const PACKET_ID = require('../constants.js').PACKET_ID;

module.exports = {
  init: function () {
    if (!this.params.session.socket) {
      this.queue.trigger('error', new Error('Connection has not been established'));
      return;
    }

    try {
      this.params.session.write(
        TYPE.EXECCOMMAND,
        PACKET_ID.EXEC,
        this.params.command
      );
      // Some strange hack is used for multi-packet responses.
      // see: https://developer.valvesoftware.com/wiki/Source_RCON_Protocol#Multiple-packet_Responses
      this.params.session.write(
        TYPE.RESPONSE_VALUE,
        PACKET_ID.TERM,
        ''
      );
    } catch (error) {
      this.queue.trigger('error', error);
    }
  },
  data: function (packet) {
    if (packet.type === TYPE.RESPONSE_VALUE) {
      if (packet.id === PACKET_ID.EXEC) {
        this.params.response += packet.payload;
      } else if (packet.id === PACKET_ID.TERM) {
        this.queue.trigger('success', this.params.response);
      }
    } else if (packet.type === TYPE.AUTH_RESPONSE && packet.id === 0xffffffff) {
      this.queue.trigger('error', new Error('Not authorized'));
    } else {
      this.queue.trigger('error', new Error('Wrong packet type recieved: ' + packet.type));
    }
  },
  error: common.error,
  success: common.success
};
