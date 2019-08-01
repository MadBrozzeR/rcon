const common = require('./common.js');
const TYPE = require('../constants.js').TYPE;
const PACKET_ID = require('../constants.js').PACKET_ID;

module.exports = {
  init: function () {
    const session = this.params.session;

    if (!session.socket) {
      this.queue.trigger('error', new Error('Connection has not been established'));
      return;
    }

    try {
      this.params.session.write(
        TYPE.AUTH,
        PACKET_ID.AUTH,
        this.params.password
      );
    } catch (error) {
      this.queue.trigger('error', error);
    }
  },
  data: function (packet) {
    if (packet.type === TYPE.AUTH_RESPONSE) {
      if (packet.id === PACKET_ID.AUTH) {
        this.queue.trigger('success');
      } else {
        this.queue.trigger('error', new Error('Authentication error'));
      }
    }
  },
  error: common.error,
  success: common.success
};
