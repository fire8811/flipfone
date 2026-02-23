// alpha: yaw
// beta: pitch
// gamma: roll
export class RotationTracker {
  private lastYaw: number;
  private lastPitch: number;
  private lastRoll: number;
  public totalYaw: number = 0; // 0 to 360
  public totalPitch: number = 0; // -180 to 180
  public totalRoll: number = 0; // -90 to 90

  constructor(yaw: number = 0, pitch: number = 0, roll: number = 0) {
    this.lastYaw = yaw;
    this.lastPitch = pitch;
    this.lastRoll = roll;
  }

  /**
   *
   * @param last
   * @param curr
   * @param wrap How much the value increases before it wraps around
   */
  private getChangeWrapped(last: number, curr: number, wrap: number): number {
    const wrapThreshold = wrap / 2;
    let change = curr - last;
    if (change > wrapThreshold) {
      change = change - wrap;
    }
    if (change < -wrapThreshold) {
      change = change + wrap;
    }
    return change;
  }

  public process(yaw: number, pitch: number, roll: number) {
    let deltaYaw = this.getChangeWrapped(this.lastYaw, yaw, 360 /* 360 - 0 */);
    let deltaPitch = this.getChangeWrapped(
      this.lastPitch,
      pitch,
      360 /* 180 - -180 */,
    );
    let deltaRoll = this.getChangeWrapped(
      this.lastRoll,
      roll,
      180 /* 90 - -90 */,
    );

    this.lastYaw = yaw;
    this.lastPitch = pitch;
    this.lastRoll = roll;

    this.totalYaw += deltaYaw;
    this.totalPitch += deltaPitch;
    this.totalRoll += deltaRoll;
  }

  public countFlips(): number {
    const numYawFlips = this.totalYaw / 360;
    const numPitchFlips = this.totalPitch / 360;
    const numRollFlips = this.totalRoll / 360;
    return numYawFlips + numPitchFlips + numRollFlips;
  }
}
