export const BAUDRATE = 57600;

export const BUFFER_SIZE = 5;

export const BUMPER_INDEXES = {
  RIGHT:            1,
  LEFT:             2,
  FRONT:            3
};

export const BUMPERS = {
  FRONT:            'forward',
  LEFT:             'left',
  RIGHT:            'right'
};

export const COMMANDS = {
  DRIVE:            0x89,
  DRIVE_DIRECT:     0x91,
  LED:              0x8B,
  PLAY:             0x8D,
  SAFE:             0x83,
  SENSORS:          0x8E,
  SONG:             0x8C,
  START:            0x80,
  STREAM:           0x94
};

export const DRV_FWD_RAD = 0x7fff;

export const EVENTS = {
  ANGLE_UPDATED:    'angle',
  BUMP:             'bump',
  BUMP_END:         'bumpend',
  DISTANCE_UPDATED: 'distance',
  READY:            'ready',
  WHEEL_DROP:       'wheeldrop'
};

export const MODES = {
  FULL:             'FULL',
  OFF:              'OFF',
  PASSIVE:          'PASSIVE',
  SAFE:             'SAFE'
};

export const SENSORS = {
  BUMP_WDROP:       7,
  WALL:             8,
  BUTTONS:          18,
  DISTANCE:         19,
  ANGLE:            20,
  VOLTAGE:          22
};