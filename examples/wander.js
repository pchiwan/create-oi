import * as create from 'create-oi';
import { serialport, SPEED } from './config';

const robot = new create.Create({
  serialport
});

robot.on(create.EVENTS.READY, () => {
  // start by going forward
  robot.drive(SPEED, 0);
});

const bumpHandler = (bumperEvent) => {
  // temporarily disable further bump events
  // getting multiple bump events while one is in progress
  // will cause weird interleaving of our robot behavior
  robot.off(create.EVENTS.BUMP);

  // backup a bit
  robot.drive(-SPEED, 0);
  robot.wait(1000);

  // turn based on which bumper sensor got hit
  switch(bumperEvent.which) {
  case create.BUMPERS.FRONT: // randomly choose a direction
    const dir = [-1, 1][Math.round(Math.random())];
    robot.rotate(dir * SPEED);
    robot.wait(2100); // time is in ms
    break;
  case create.BUMPERS.LEFT:
    robot.rotate(-SPEED); // turn right
    robot.wait(1000);
    break;
  case create.BUMPERS.RIGHT:
    robot.rotate(SPEED); // turn left
    robot.wait(1000);
    break;
  }

  // onward!
  robot.drive(SPEED, 0)
    .then(() => {
      // turn handler back on
      robot.on(create.EVENTS.BUMP, bumpHandler);
    });
};

robot.on(create.EVENTS.BUMP, bumpHandler);
