import { SerialPort } from 'serialport';
import { EventEmitter } from 'events';
import {
  BAUDRATE,
  BUFFER_SIZE,
  BUMPER_INDEXES,
  EVENTS,
  SENSORS
} from './constants';
import {
  logger,
  noop
} from './helpers';

const START_BYTE = 0x13;
const LEN_IDX = 1;
let ldata = 0;

class SerialManager {
  constructor(serialport, eventEmitter, onSerialPortOpened = noop, verbose = false) {
    this.eventEmitter = eventEmitter || new EventEmitter();
    this.serial = new SerialPort(serialport, { baudRate: BAUDRATE, bufferSize: BUFFER_SIZE });
    this.verbose = verbose;
    this.watchdog = false;

    // setup internal serial event handlers
    this.serial.on('data', function (data) {
      this.watchdog = true;
      this.parse(data);
    });

    this.serial.on('close', function () {
      logger('serial port closed', this.verbose);
    });

    this.serial.on('error', function (err) {
      if (this.verbose)
        console.error(err);
    });

    this.serial.on('open', function() {
      logger('serial port opened successfully', this.verbose);
      onSerialPortOpened();

      setInterval(function() {
        if (this.watchdog === false) {
          logger('no data received from Create... attempting to connect (again)', this.verbose);
          onSerialPortOpened();
        }
        this.watchdog = false;
      }, 2000);
    });
  }

  bumperIdxToName(idx) {
    switch (idx) {
    case BUMPER_INDEXES.RIGHT:
      return 'right';
    case BUMPER_INDEXES.LEFT:
      return 'left';
    case BUMPER_INDEXES.FRONT:
      return 'forward';
    }
  }

  close() {
    this.serial.close(() => {
      this.eventEmitter.emit(EVENTS.CLOSE);
    });
  }

  seek(buffer) {
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === START_BYTE)
        return i;
    }
    return -1;
  }

  sendCommand(command, payload) {
    if (typeof payload === 'undefined') {
      this.serial.write(new Buffer([command]));
    } else {
      this.serial.write(new Buffer([command].concat(payload)));
    }
    this.serial.flush();
  }

  parse(buffer) {
    // index to start reading packet data, default to invalid value
    let start = -1;
    let pkt = []; // stores working packet data

    if (pkt.length === 0) {
      start = this.seek(buffer);
    } else {
      start = 0; // we already have the header stored in pkt, read full buff
    }

    if (start === -1) // couldn't seek to START_BYTE
      return;

    for (let i = start; i < buffer.length; i++)
      pkt.push(buffer[i]);

    if (buffer.length < start + 2) // LEN_IDX can't be read yet
      return;

    // START_BYTE found, but not actually start of pkt
    if (buffer[start+1] === 0) {
      pkt = [];
      return;
    }

    // +3 due to START byte, COUNT byte & CHKSUM bytes included with all pkts
    if (pkt.length < (pkt[LEN_IDX] + 3))
      return;

    // extract one whole packet from pkt buffer
    const currPkt = pkt.splice(0, pkt[LEN_IDX] + 3);
    let chksum = 0;

    for (let i = 0; i < currPkt.length; i++) {
      chksum += currPkt[i];
    }

    chksum = chksum & 0xff;

    if (chksum == 0) {
      let idx = 2;
      let sensorMsgsParsed = 0;

      while (idx < currPkt.length - 1) {
        switch (currPkt[idx]) {
        case SENSORS.BUMP_WDROP:
          const data = currPkt[idx+1];
          // bumper hit!
          if (data > 0 && data < 4) {
            if (ldata === 0) {
              this.eventEmitter.emit(EVENTS.BUMP, { which: this.bumperIdxToName(data) });
            }
          }

          if (ldata != 0 && data === 0) {
            this.eventEmitter.emit(EVENTS.BUMP_END, { which: this.bumperIdxToName(ldata) });
          }

          // wheeldrop occured!
          if (data > 0 && data > 4) {
            if (ldata != data) {
              this.eventEmitter.emit(EVENTS.WHEEL_DROP);
            }
          }

          ldata = data;
          idx += 2;
          sensorMsgsParsed++;
          break;

        case SENSORS.DISTANCE:
          let distance = (currPkt[idx+1] << 8) | currPkt[idx+2];
          if (distance > 32767) {
            distance -= 65536;
          }
          idx += 3;
          sensorMsgsParsed++;
          this.eventEmitter.emit(EVENTS.DISTANCE_UPDATED, distance);
          break;

        case SENSORS.ANGLE:
          let angle = (currPkt[idx+1] << 8) | currPkt[idx+2];
          if (angle > 32767) {
            angle -= 65536;
          }
          idx += 3;
          sensorMsgsParsed++;
          this.eventEmitter.emit(EVENTS.ANGLE_UPDATED, angle);
          break;

        default:
          logger(`WARN: couldn't parse incomming OI pkt`, this.verbose);
          idx++; // prevents inf loop
        }
      }
    } else {
      logger(`WARN: incomming packet failed checksum`, this.verbose);
    }

    pkt = []; // clear pkt buff contents
  }
}

export default SerialManager;
