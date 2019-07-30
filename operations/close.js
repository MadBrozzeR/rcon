const common = require('./common.js');

module.exports = {
  init: function () {
    try {
      this.params.session.socket.end();
    } catch (error) {
      this.queue.trigger('error', error);
    }
  },
  close: function () {
    this.queue.trigger('success');
  },
  error: common.error,
  success: common.success
};
