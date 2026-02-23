import type { flipData } from "../gyroscope-demo";

// alpha: yaw
// beta: pitch
// gamma: roll
export class RotationTracker {
  private lastYaw: number;
  private lastPitch: number;
  private lastRoll: number;
  public totalYaw: number = 0;
  public totalPitch: number = 0;
  public totalRoll: number = 0;

  constructor(yaw: number = 0, pitch: number = 0, roll: number = 0) {
    this.lastYaw = yaw;
    this.lastPitch = pitch;
    this.lastRoll = roll;
  }

  public process(yaw: number, pitch: number, roll: number) {
    this.lastYaw = yaw;
    this.lastPitch = pitch;
    this.lastRoll = roll;

    let deltaYaw = this.lastYaw - yaw;
    if (deltaYaw > 100) {
      deltaYaw = 360 - deltaYaw;
    }
    let deltaPitch = this.lastPitch - pitch;
    if (deltaPitch > 100) {
      deltaPitch = 180 - deltaPitch;
    }
    let deltaRoll = this.lastRoll - roll;
    if (deltaRoll > 50) {
      deltaRoll = 90 - deltaRoll;
    }

    this.totalYaw += deltaYaw;
    this.totalPitch += deltaPitch;
    this.totalRoll += deltaRoll;
  }

  public countFlips(): flipData {
    const numYawFlips = this.totalYaw / 360;
    const numPitchFlips = this.totalPitch / 360;
    const numRollFlips = this.totalRoll / 360;
    return { yawFlips: numYawFlips, pitchFlips: numPitchFlips, rollFlips: numRollFlips };
  }
}
