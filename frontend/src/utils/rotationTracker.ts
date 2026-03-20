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

	public reset() {
		this._numFlips = 0;
	}

	public process(rotationRate: rotation, dt: number) {
		const degToRad = Math.PI / 180;
		let deltaYaw = rotationRate.yaw * dt * degToRad;
		deltaYaw = Math.abs(deltaYaw) > 0.001 ? deltaYaw : 0;
		let deltaPitch = rotationRate.pitch * dt * degToRad;
		deltaPitch = Math.abs(deltaPitch) > 0.001 ? deltaPitch : 0;
		let deltaRoll = rotationRate.roll * dt * degToRad;
		deltaRoll = Math.abs(deltaRoll) > 0.001 ? deltaRoll : 0;

		const quaternionRotationChange: Quaternion = Quaternion.fromEulerLogical(deltaYaw, deltaPitch, deltaRoll);
		const angle = 2 * Math.acos(quaternionRotationChange.w); // radians
		const angleDeg = angle * (180 / Math.PI);
		this._numFlips += angleDeg / 360;
	}
}
