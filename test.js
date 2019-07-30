const Rcon = require('./index.js');

new Rcon({
  debug: true,
  port: 25001,
  pass: '111'
})
  .connect({
    onSuccess: function () {
      console.log('Connection successfull');
    },
    onError: function (error) {
      console.log('Connection error:', error);
      this.close();
    }
  })
  .send('list', {
    onSuccess: function (data) {
      console.log(data);
    },
    onError: function (error) {
      console.log('Command error:', error);
    }
  })
  .close({
    onSuccess: function () {
      console.log('Session successfully closed');
    },
    onError: function (error) {
      console.log('Failed to close session:', error);
    }
  });
