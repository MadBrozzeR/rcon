const Rcon = require('./index.js');
const Server = require('mbr-test').Server;
const test = require('mbr-test').test;

const listeners = {
  // Successful authentication by 111
  '0d000000 00000000 03000000 313131 0000': [
    '0a000000 00000000 00000000 0000',
    '0a000000 00000000 02000000 0000'
  ],
  // Failed authentication by 112
  '0d000000 00000000 03000000 313132 0000': [
    '0a000000 00000000 00000000 0000',
    '0a000000 ffffffff 02000000 0000'
  ],
  // Send 'list' command and dummy package
  '0e000000 01000000 02000000 6c697374 0000   0a000000 02000000 00000000 0000': [
    '32000000 01000000 00000000 5468657265206172652030206f662061206d617820323020706c6179657273206f6e6c696e653a0a 0000',
    '1b000000 02000000 00000000 556e6b6e6f776e20726571756573742030 0000'
  ],
  // Send 'list' command
  '0e000000 01000000 02000000 6c697374 0000':
    '32000000 01000000 00000000 5468657265206172652030206f662061206d617820323020706c6179657273206f6e6c696e653a0a 0000',
  // Send dummy package
  '0a000000 02000000 00000000 0000':
    '1b000000 02000000 00000000 556e6b6e6f776e20726571756573742030 0000'
};

new Server(Server.listener.buffers(listeners)).listen(25002, function () {
  const server = this;

  const rcon = new Rcon({
    port: 25002,
    password: '111'
  });

  let connection;

  test({
    'Connection must succeed': function (success, fail) {
      connection = rcon.connect({
        onSuccess: function () {
          success();
        },
        onError: function (error) {
          fail(error.toString());
        }
      })
    },
    'Authentication with wrong password must fail': function (success, fail) {
      connection.auth({
        password: '112',
        onSuccess: function () {
          fail('Authentication succeeded');
        },
        onError: function () {
          success();
        }
      });
    },
    'Authentication with correct password must succeed': function (success, fail) {
      connection.auth({
        password: '111',
        onSuccess: function () {
          success();
        },
        onError: function (error) {
          fail(error.toString());
        }
      });
    },
    'Command \'list\' should return correct response': function (success, fail) {
      connection.send('list', {
        onSuccess: function (data) {
          const expectation = 'There are 0 of a max 20 players online:\n';

          if (data === expectation) {
            success();
          } else {
            fail('Missmatch: \n' + data + '\n' + expectation);
          }
        },
        onError: function (error) {
          fail(error.toString());
        }
      });
    },
    'Connection should be successfully closed': function (success, fail) {
      connection.close({
        onSuccess: function () {
          success();
        },
        onError: function (error) {
          fail(error.toString());
        }
      });
    },
    'Should successfully chain actions': function (success, fail) {
      let result = [];
      const expectation = 'connect|auth|send|close';

      rcon.connect({
        onSuccess: function () {
          result.push('connect');
        },
        onError: function (error) {
          fail(error.toString());
        }
      }).auth({
        onSuccess: function () {
          result.push('auth');
        },
        onError: function (error) {
          fail(error.toString());
        }
      }).send('list', {
        onSuccess: function () {
          result.push('send');
        },
        onError: function (error) {
          fail(error.toString());
        }
      }).close({
        onSuccess: function () {
          result.push('close');
          const check = result.join('|');

          if (check === expectation) {
            success();
          } else {
            fail('Missmatch:\n' + check + '\n' + expectation);
          }

          server.close();
        },
        onError: function (error) {
          fail(error.toString());
        }
      });
    }
  });
});
