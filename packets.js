const Reader = require('mbr-buffer').Reader;
const Writer = require('mbr-buffer').Writer;
const TYPE = require('./constants.js').TYPE;

const INT_PARAMS = { littleEndian: true };

function readOnePacket (reader) {
  // size includes id (4 bytes), type (4 bytes), body terminator 0x0000 (2 bytes). Substract it to get actual size.
  const payloadSize = reader.readIntLE(4) - 10;

  const result = {
    id: reader.readIntLE(4),
    type: reader.readIntLE(4),
    payload: reader.read(payloadSize)
  };

  reader.skip(2);

  return result;
}

module.exports = {
  read: function readPacket (buffer) {
    const reader = new Reader(buffer);
    const result = [];

    while (!reader.isEndReached()) {
      result.push(readOnePacket(reader));
    }

    return result;
  },
  write: function writePacket (type, id, data) {
    const payload = Writer.Group([
      Writer.Integer(id, 4, INT_PARAMS)
        .is('Packet reference ID'),
      Writer.Integer(type, 4, INT_PARAMS)
        .is('Packet type'),
      Writer.String(data)
        .is('Payload'),
      Writer.Fill(0, 2)
        .is('Data terminator')
    ]);

    return Writer.make([
      Writer.SizeOf(payload, 4, INT_PARAMS)
        .is('Payload size'),
      payload
    ]);
  }
};
