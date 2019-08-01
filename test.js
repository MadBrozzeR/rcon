const Rcon = require('./index.js');
const Server = require('./test/server.js');
const test = require('./test/test.js');

const listeners = {
  '0d000000 00000000 03000000 313131 0000': [
    '0a000000 00000000 00000000 0000',
    '0a000000 00000000 02000000 0000'
  ],
  '0d000000 00000000 03000000 313132 0000': [
    '0a000000 00000000 00000000 0000',
    '0a000000 ffffffff 02000000 0000'
  ],
  '0e000000 01000000 02000000 6c697374 0000   0a000000 02000000 00000000 0000': [
    '32000000 01000000 00000000 5468657265206172652030206f662061206d617820323020706c6179657273206f6e6c696e653a0a 0000',
    '1b000000 02000000 00000000 556e6b6e6f776e20726571756573742030 0000'
  ],
  '0e000000 01000000 02000000 6c697374 0000':
    '32000000 01000000 00000000 5468657265206172652030206f662061206d617820323020706c6179657273206f6e6c696e653a0a 0000',
  '0a000000 02000000 00000000 0000':
    '1b000000 02000000 00000000 556e6b6e6f776e20726571756573742030 0000'
};

new Server(Server.listener.buffers(listeners)).listen(25002, function () {
  const server = this;

  new Rcon({
    port: 25002,
    pass: '111'
  })
    .connect({
      onSuccess: function () {
        test.succeed('Connection must succeed');
      },
      onError: function (error) {
        test.failed('Connection must succeed');
      }
    })
    .auth({
      onSuccess: function () {
        test.succeed('Authentication with correct password must succeed');
      },
      onError: function () {
        test.failed('Authentication with correct password must succeed');
      }
    })
    .send('list', {
      onSuccess: function (data) {
        test('Command \'list\' should return correct response', data, 'There are 0 of a max 20 players online:\n');
      },
      onError: function (error) {
        test.failed('Command \'list\' should return correct response');
      }
    })
    .close({
      onSuccess: function () {
        test.succeed('Connection should be successfully closed');
        server.close();
      },
      onError: function (error) {
        test.failed('Connection should be successfully closed');
      }
    });
});
