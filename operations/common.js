module.exports = {
  error: function (error) {
    this.queue.clear().next();
    (this.params.onError instanceof Function) && this.params.onError.call(this.params.session, error);
  },
  success: function (data) {
    (this.params.onSuccess instanceof Function) && this.params.onSuccess.call(this.params.session, data);
    this.queue.next();
  }
};
