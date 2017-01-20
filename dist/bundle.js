/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _create = __webpack_require__(1);

	var _constants = __webpack_require__(6);

	exports.default = {
	  Create: _create.Create,
	  COMMANDS: _constants.COMMANDS,
	  EVENTS: _constants.EVENTS,
	  MODES: _constants.MODES,
	  SENSORS: _constants.SENSORS
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _events = __webpack_require__(2);

	var _q = __webpack_require__(3);

	var _q2 = _interopRequireDefault(_q);

	var _serialManager = __webpack_require__(4);

	var _helpers = __webpack_require__(7);

	var _constants = __webpack_require__(6);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var WAIT_MS = 100;

	var Create = function () {
	  function Create(options) {
	    _classCallCheck(this, Create);

	    this.angle = 0;
	    this.distance = 0;
	    this.eventEmitter = new _events.EventEmitter();
	    this.mode = _constants.MODES.SAFE;
	    this.prior = _q2.default.resolve();
	    this.serial = new _serialManager.SerialManager(options.serialport, this.eventEmitter, this.initCreate, options.verbose);
	    this.verbose = !!options.verbose;
	  }

	  _createClass(Create, [{
	    key: 'initCreate',
	    value: function initCreate() {
	      var _this = this;

	      this.bindEvents();

	      this.serial.sendCommand(_constants.COMMANDS.START);

	      this.wait(WAIT_MS).then(function () {
	        _this.serial.sendCommand(_constants.COMMANDS.SAFE);
	        return WAIT_MS; // wait amount
	      }).then(this.wait).then(function () {
	        // set song 0 to single beep
	        _this.serial.sendCommand(_constants.COMMANDS.SONG, [0x0, 0x01, 72, 10]);
	        return WAIT_MS;
	      }).then(this.wait).then(function () {
	        // play song 0
	        _this.serial.sendCommand(_constants.COMMANDS.PLAY, [0x0]);
	        return WAIT_MS;
	      }).then(this.wait).then(function () {
	        _this.serial.sendCommand(_constants.COMMANDS.STREAM, [3, 7, 19, 20]);
	        return WAIT_MS;
	      }).then(this.wait).then(function () {
	        // turn power LED on (and green)
	        _this.serial.sendCommand(_constants.COMMANDS.LED, [8, 0, 255]);
	        return WAIT_MS;
	      }).then(this.wait).then(function () {
	        _this.eventEmitter.emit(_constants.EVENTS.READY);
	      });
	    }
	  }, {
	    key: 'bindEvents',
	    value: function bindEvents() {
	      var _this2 = this;

	      this.eventEmitter.on(_constants.EVENTS.ANGLE_UPDATED, function (data) {
	        _this2.angle += data;
	      });

	      this.eventEmitter.on(_constants.EVENTS.DISTANCE_UPDATED, function (data) {
	        _this2.distance += data;
	      });
	    }
	  }, {
	    key: 'drive',
	    value: function drive(fwd, rad) {
	      var _this3 = this;

	      this.prior = this.prior.then(function () {
	        _this3.serial.sendCommand(_constants.COMMANDS.SAFE);
	        if (Math.abs(rad) < 0.0001) {
	          rad = _constants.DRV_FWD_RAD;
	        }
	        _this3.serial.sendCommand(_constants.COMMANDS.DRIVE, [(0, _helpers.uB)(fwd), (0, _helpers.lB)(fwd), (0, _helpers.uB)(rad), (0, _helpers.lB)(rad)]);
	        return _q2.default.resolve();
	      });
	      return this.prior;
	    }
	  }, {
	    key: 'driveDirect',
	    value: function driveDirect(rightWeel, leftWeel) {
	      var _this4 = this;

	      this.prior = this.prior.then(function () {
	        _this4.sendCommand(_constants.COMMANDS.SAFE);
	        _this4.sendCommand(_constants.COMMANDS.DRIVE_DIRECT, [(0, _helpers.uB)(rightWeel), (0, _helpers.lB)(rightWeel), (0, _helpers.uB)(leftWeel), (0, _helpers.lB)(leftWeel)]);
	        return _q2.default.resolve();
	      });
	      return this.prior;
	    }
	  }, {
	    key: 'getAngle',
	    value: function getAngle() {
	      var _this5 = this;

	      this.prior = this.prior.then(function () {
	        (0, _helpers.logger)('angle: ' + _this5.angle, _this5.verbose);
	        return _this5.angle;
	      });
	      return this.prior;
	    }
	  }, {
	    key: 'getDistance',
	    value: function getDistance() {
	      var _this6 = this;

	      this.prior = this.prior.then(function () {
	        (0, _helpers.logger)('distance: ' + _this6.distance, _this6.verbose);
	        return _this6.distance;
	      });
	      return this.prior;
	    }
	  }, {
	    key: 'getMode',
	    value: function getMode() {
	      return this.mode;
	    }
	  }, {
	    key: 'on',
	    value: function on(event, callback) {
	      this.eventEmitter.on(event, callback);
	    }
	  }, {
	    key: 'off',
	    value: function off(event) {
	      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	      if (callback) {
	        this.eventEmitter.removeListener(event, callback);
	      } else {
	        this.eventEmitter.removeAllListeners(event);
	      }
	    }
	  }, {
	    key: 'rotate',
	    value: function rotate(vel) {
	      return this.drive(vel, 1);
	    }
	  }, {
	    key: 'setMode',
	    value: function setMode(mode) {
	      this.mode = mode;
	      this.sendCommand(mode);
	    }
	  }, {
	    key: 'wait',
	    value: function wait() {
	      var ms = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : WAIT_MS;

	      this.prior = this.prior.then(function () {
	        var deferred = _q2.default.defer();
	        setTimeout(deferred.resolve, ms);
	        return deferred.promise;
	      });
	      return this.prior;
	    }
	  }]);

	  return Create;
	}();

	exports.default = Create;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("q");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _serialport = __webpack_require__(5);

	var _events = __webpack_require__(2);

	var _constants = __webpack_require__(6);

	var _helpers = __webpack_require__(7);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var START_BYTE = 0x13;
	var LEN_IDX = 1;
	var ldata = 0;

	var SerialManager = function () {
	  function SerialManager(serialport, eventEmitter) {
	    var onSerialPortOpened = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _helpers.noop;
	    var verbose = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

	    _classCallCheck(this, SerialManager);

	    this.eventEmitter = eventEmitter || new _events.EventEmitter();
	    this.serial = new _serialport.SerialPort(serialport, { baudRate: _constants.BAUDRATE, bufferSize: _constants.BUFFER_SIZE });
	    this.verbose = verbose;
	    this.watchdog = false;

	    // setup internal serial event handlers
	    this.serial.on('data', function (data) {
	      this.watchdog = true;
	      this.parse(data);
	    });

	    this.serial.on('close', function (err) {
	      (0, _helpers.logger)('serial port closed', this.verbose);
	    });

	    this.serial.on('error', function (err) {
	      if (this.verbose) console.error(err);
	    });

	    this.serial.on('open', function () {
	      (0, _helpers.logger)('serial port opened successfully', this.verbose);
	      onSerialPortOpened();

	      setInterval(function () {
	        if (this.watchdog === false) {
	          (0, _helpers.logger)('no data received from Create... attempting to connect (again)', this.verbose);
	          onSerialPortOpened();
	        }
	        this.watchdog = false;
	      }, 2000);
	    });
	  }

	  _createClass(SerialManager, [{
	    key: 'bumperIdxToName',
	    value: function bumperIdxToName(idx) {
	      switch (idx) {
	        case _constants.BUMPER_INDEXES.RIGHT:
	          return 'right';
	        case _constants.BUMPER_INDEXES.LEFT:
	          return 'left';
	        case _constants.BUMPER_INDEXES.FRONT:
	          return 'forward';
	      }
	    }
	  }, {
	    key: 'sendCommand',
	    value: function sendCommand(command, payload) {
	      if (typeof payload === 'undefined') {
	        this.serial.write(new Buffer([command]));
	      } else {
	        this.serial.write(new Buffer([command].concat(payload)));
	      }
	      this.serial.flush();
	    }
	  }, {
	    key: 'seek',
	    value: function seek(buffer) {
	      for (var i = 0; i < buffer.length; i++) {
	        if (buffer[i] === START_BYTE) return i;
	      }
	      return -1;
	    }
	  }, {
	    key: 'parse',
	    value: function parse(buffer) {
	      // index to start reading packet data, default to invalid value
	      var start = -1;
	      var pkt = []; // stores working packet data

	      if (pkt.length === 0) {
	        start = this.seek(buffer);
	      } else {
	        start = 0; // we already have the header stored in pkt, read full buff
	      }

	      if (start === -1) // couldn't seek to START_BYTE
	        return;

	      for (var i = start; i < buffer.length; i++) {
	        pkt.push(buffer[i]);
	      }if (buffer.length < start + 2) // LEN_IDX can't be read yet
	        return;

	      // START_BYTE found, but not actually start of pkt
	      if (buffer[start + 1] === 0) {
	        pkt = [];
	        return;
	      }

	      // +3 due to START byte, COUNT byte & CHKSUM bytes included with all pkts
	      if (pkt.length < pkt[LEN_IDX] + 3) return;

	      // extract one whole packet from pkt buffer
	      var currPkt = pkt.splice(0, pkt[LEN_IDX] + 3);
	      var chksum = 0;

	      for (var _i = 0; _i < currPkt.length; _i++) {
	        chksum += currPkt[_i];
	      }

	      chksum = chksum & 0xff;

	      if (chksum == 0) {
	        var idx = 2;
	        var sensorMsgsParsed = 0;

	        while (idx < currPkt.length - 1) {
	          switch (currPkt[idx]) {
	            case _constants.SENSORS.BUMP_WDROP:
	              var data = currPkt[idx + 1];
	              // bumper hit!
	              if (data > 0 && data < 4) {
	                if (ldata === 0) {
	                  this.eventEmitter.emit(_constants.EVENTS.BUMP, { which: this.bumperIdxToName(data) });
	                }
	              }

	              if (ldata != 0 && data === 0) {
	                this.eventEmitter.emit(_constants.EVENTS.BUMP_END, { which: this.bumperIdxToName(ldata) });
	              }

	              // wheeldrop occured!
	              if (data > 0 && data > 4) {
	                if (ldata != data) {
	                  this.eventEmitter.emit(_constants.EVENTS.WHEEL_DROP);
	                }
	              }

	              ldata = data;
	              idx += 2;
	              sensorMsgsParsed++;
	              break;

	            case _constants.SENSORS.DISTANCE:
	              var distance = currPkt[idx + 1] << 8 | currPkt[idx + 2];
	              if (distance > 32767) {
	                distance -= 65536;
	              }
	              idx += 3;
	              sensorMsgsParsed++;
	              this.eventEmitter.emit(_constants.EVENTS.DISTANCE_UPDATED, distance);
	              break;

	            case _constants.SENSORS.ANGLE:
	              var angle = currPkt[idx + 1] << 8 | currPkt[idx + 2];
	              if (angle > 32767) {
	                angle -= 65536;
	              }
	              idx += 3;
	              sensorMsgsParsed++;
	              this.eventEmitter.emit(_constants.EVENTS.ANGLE_UPDATED, angle);
	              break;

	            default:
	              (0, _helpers.logger)('WARN: couldn\'t parse incomming OI pkt', this.verbose);
	              idx++; // prevents inf loop
	          }
	        }
	      } else {
	        (0, _helpers.logger)('WARN: incomming packet failed checksum', this.verbose);
	      }

	      pkt = []; // clear pkt buff contents
	    }
	  }]);

	  return SerialManager;
	}();

	exports.default = SerialManager;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("serialport");

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var BAUDRATE = exports.BAUDRATE = 57600;

	var BUFFER_SIZE = exports.BUFFER_SIZE = 5;

	var BUMPER_INDEXES = exports.BUMPER_INDEXES = {
	  RIGHT: 1,
	  LEFT: 2,
	  FRONT: 3
	};

	var BUMPERS = exports.BUMPERS = {
	  FRONT: 'forward',
	  LEFT: 'left',
	  RIGHT: 'right'
	};

	var COMMANDS = exports.COMMANDS = {
	  DRIVE: 0x89,
	  DRIVE_DIRECT: 0x91,
	  LED: 0x8B,
	  PLAY: 0x8D,
	  SAFE: 0x83,
	  SENSORS: 0x8E,
	  SONG: 0x8C,
	  START: 0x80,
	  STREAM: 0x94
	};

	var DRV_FWD_RAD = exports.DRV_FWD_RAD = 0x7fff;

	var EVENTS = exports.EVENTS = {
	  ANGLE_UPDATED: 'angle',
	  BUMP: 'bump',
	  BUMP_END: 'bumpend',
	  DISTANCE_UPDATED: 'distance',
	  READY: 'ready',
	  WHEEL_DROP: 'wheeldrop'
	};

	var MODES = exports.MODES = {
	  FULL: 'FULL',
	  OFF: 'OFF',
	  PASSIVE: 'PASSIVE',
	  SAFE: 'SAFE'
	};

	var SENSORS = exports.SENSORS = {
	  BUMP_WDROP: 7,
	  WALL: 8,
	  BUTTONS: 18,
	  DISTANCE: 19,
	  ANGLE: 20,
	  VOLTAGE: 22
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.uB = uB;
	exports.lB = lB;
	exports.logger = logger;
	exports.noop = noop;
	function uB(word) {
	  return word >> 8;
	}

	function lB(word) {
	  return word & 0x000000ff;
	}

	function logger(message, verbose) {
	  if (verbose) {
	    console.log(message);
	  }
	}

	function noop() {}

/***/ }
/******/ ]);