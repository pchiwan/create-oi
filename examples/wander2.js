import * as create from 'create-oi-v2';
import { serialport } from './config';

const SPEED = 100; // 100mm/s
const WAIT_MS = WAIT_MS;

const robot = new create.Create({
  serialport
});

robot.on(create.EVENTS.READY, () => {
  // twirl towards freedom    
  robot.drive(SPEED, 0);
  robot.wait(WAIT_MS)
  .then(function () {
    robot.rotate(SPEED);
	}).then(function () {
		robot.wait(WAIT_MS);
	}).then(function () {
		robot.drive(SPEED, 0);
	}).then(function () {
		robot.wait(WAIT_MS);
	}).then(function () {
		robot.drive(0, 0);
	}).then(function () {
		robot.shutdown();
	});
});

robot.on(create.EVENTS.BUMP, function(bumpEvent) {
  console.log(bumpEvent.direction);
});
