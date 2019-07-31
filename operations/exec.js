const TYPE = require('../constants.js').TYPE;
const common = require('./common.js');

const EXEC_PACKET_ID = 1;
const CONTROL_ID = 2;

module.exports = {
  init: function () {
    try {
      this.params.session.write(
        TYPE.EXECCOMMAND,
        EXEC_PACKET_ID,
        this.params.command
      );
      // Some strange hack is used for multi-packet responses.
      // see: https://developer.valvesoftware.com/wiki/Source_RCON_Protocol#Multiple-packet_Responses
      this.params.session.write(
        TYPE.RESPONSE_VALUE,
        CONTROL_ID,
        ''
      );
    } catch (error) {
      this.queue.trigger('error', error);
    }
  },
  data: function (packet) {
    if (packet.type === TYPE.RESPONSE_VALUE) {
      if (packet.id === EXEC_PACKET_ID) {
        this.params.response += packet.payload;
      } else if (packet.id === CONTROL_ID) {
        this.queue.trigger('success', this.params.response);
      }
    } else {
      this.queue.trigger('error', new Error('Wrong packet type recieved: ' + packet.type));
    }
  },
  error: common.error,
  success: common.success
};
