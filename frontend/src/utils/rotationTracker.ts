import Quaternion from "quaternion";
import type { rotation } from "../demo/gyroscope-demo";

// gamma: roll
// alpha: yaw
// beta: pitch
export class RotationTracker {
  private _numFlips: number = 0;

  public get numFlips() {
    return this._numFlips;
  }

  public process(rotationRate: rotation, dt: number) {
    const degToRad = Math.PI / 180;
    const deltaYaw = rotationRate.yaw * dt * degToRad;
    const deltaPitch = rotationRate.pitch * dt * degToRad;
    const deltaRoll = rotationRate.roll * dt * degToRad;

    const quaternionRotationChange: Quaternion = Quaternion.fromEulerLogical(
      deltaYaw,
      deltaPitch,
      deltaRoll,
    );
    const angle = 2 * Math.acos(quaternionRotationChange.w); // radians
    const angleDeg = angle * (180 / Math.PI);
    this._numFlips += angleDeg / 360;
  }
}
