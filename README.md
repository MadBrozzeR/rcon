# mbr-rcon

My Valve Source RCON (remote console) protocol implementation. Only TCP is supported yet.

## Example

All commands can be called directly one after another. They are being put in queue, and executed accordingly.
If any command fails, the whole queue is being cleared of tasks.

```
const Rcon = require('mbr-rcon');

const rcon = new Rcon({
  host: 'localhost',      // RCON hostname to connect to (localhost is default).
  port: 27015,            // Connection port (27015 is default).
  pass: '123',            // Password to RCON server.
  onClose: function () {} // Callback in case of connection being closed.
});

rcon.connect({
  onSuccess: function () {},   // Callback in case of successfull connection.
  onError: function (error) {} // Callback in case of connection error.
});

rcon.auth({
  password: '123',              // Password can be provided here. If this field is omitted,
                                // then password from constructor will be used.
  onSuccess: function () {},    // Callback in case of successfull authentication.
  onError: function (error) {}  // Callback in case of authentication failure.
});

rcon.send(
  'command',                            // Command to be sent to the server.
  {
    onSuccess: function (response) {},  // Callback with server response.
    onError: function (error) {}        // Callback in case of execution failure.
  }
);

rcon.close();   // Close rcon server.
```

You can also chain commands, like so:

```
new Rcon(<...>).connect().auth().send().send().<...>.close();
```
