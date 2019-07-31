const TYPE = require('../constants.js').TYPE;
const common = require('./common.js');

const AUTH_PACKET_ID = 0;

module.exports = {
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
  error: common.error,
  success: common.success
};
