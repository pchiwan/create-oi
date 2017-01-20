import { EventEmitter } from 'events';
import Q from 'q';
import { SerialManager } from './serialManager';
import {
  lB,
  uB,
  logger
} from './helpers';
import {
  COMMANDS,
  DRV_FWD_RAD,
  EVENTS,
  MODES,
} from './constants';

const WAIT_MS = 100;

class Create {
  constructor(options) {
    this.angle = 0;
    this.distance = 0;
    this.eventEmitter = new EventEmitter();
    this.mode = MODES.SAFE;
    this.prior = Q.resolve();
    this.serial = new SerialManager(options.serialport, this.eventEmitter, this.initCreate, options.verbose);
    this.verbose = !!options.verbose;
  }

  initCreate() {
    this.bindEvents();

    this.serial.sendCommand(COMMANDS.START);

    this.wait(WAIT_MS)
      .then(() => {
        this.serial.sendCommand(COMMANDS.SAFE);
        return WAIT_MS; // wait amount
      })
      .then(this.wait)
      .then(() => {
        // set song 0 to single beep
        this.serial.sendCommand(COMMANDS.SONG, [0x0, 0x01, 72, 10]);
        return WAIT_MS;
      })
      .then(this.wait)
      .then(() => {
        // play song 0
        this.serial.sendCommand(COMMANDS.PLAY, [0x0]);
        return WAIT_MS;
      })
      .then(this.wait)
      .then(() => {
        this.serial.sendCommand(COMMANDS.STREAM, [3, 7, 19, 20]);
        return WAIT_MS;
      })
      .then(this.wait)
      .then(() => {
        // turn power LED on (and green)
        this.serial.sendCommand(COMMANDS.LED, [8, 0, 255]);
        return WAIT_MS;
      })
      .then(this.wait)
      .then(() => {
        this.eventEmitter.emit(EVENTS.READY);
      });
  }

  bindEvents() {
    this.eventEmitter.on(EVENTS.ANGLE_UPDATED, data => {
      this.angle += data;
    });

    this.eventEmitter.on(EVENTS.DISTANCE_UPDATED, data => {
      this.distance += data;
    });
  }

  drive(fwd, rad) {
    this.prior = this.prior.then(() => {
      this.serial.sendCommand(COMMANDS.SAFE);
      if (Math.abs(rad) < 0.0001) {
        rad = DRV_FWD_RAD;
      }
      this.serial.sendCommand(COMMANDS.DRIVE, [uB(fwd), lB(fwd), uB(rad), lB(rad)]);
      return Q.resolve();
    });
    return this.prior;
  }

  driveDirect(rightWeel, leftWeel) {
    this.prior = this.prior.then(() => {
      this.sendCommand(COMMANDS.SAFE);
      this.sendCommand(COMMANDS.DRIVE_DIRECT, [uB(rightWeel), lB(rightWeel), uB(leftWeel), lB(leftWeel)]);
      return Q.resolve();
    });
    return this.prior;
  }

  getAngle() {
    this.prior = this.prior.then(() => {
      logger(`angle: ${this.angle}`, this.verbose);
      return this.angle;
    });
    return this.prior;
  }

  getDistance() {
    this.prior = this.prior.then(() => {
      logger(`distance: ${this.distance}`, this.verbose);
      return this.distance;
    });
    return this.prior;
  }

  getMode () {
    return this.mode;
  }

  on(event, callback) {
    this.eventEmitter.on(event, callback);
  }

  off(event, callback = null) {
    if (callback) {
      this.eventEmitter.removeListener(event, callback);
    } else {
      this.eventEmitter.removeAllListeners(event);
    }
  }

  rotate(vel) {
    return this.drive(vel, 1);
  }

  setMode(mode) {
    this.mode = mode;
    this.sendCommand(mode);
  }

  wait(ms = WAIT_MS) {
    this.prior = this.prior.then(() => {
      const deferred = Q.defer();
      setTimeout(deferred.resolve, ms);
      return deferred.promise
    });
    return this.prior;
  }
}

export default Create;
