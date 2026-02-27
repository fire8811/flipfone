import { useState, useRef, type Ref } from "react";
import { RotationTracker } from "../utils/rotationTracker";
import { GameLoop } from "../utils/gameLoop";

export interface rotation {
  roll: number;
  pitch: number;
  yaw: number;
}

export function GyroDemo() {
  const rotationRate = useRef<rotation>({ roll: 0, pitch: 0, yaw: 0 });
  const [rotationRateDisplay, setRotationRateDisplay] = useState<rotation>({
    roll: 0,
    pitch: 0,
    yaw: 0,
  });
  const [numFlips, setNumFlips] = useState<number>(0);
  const rotationTracker: Ref<RotationTracker | null> = useRef(null);
  const gameLoop: Ref<GameLoop | null> = useRef(null);

  const [permission, SetPermission] = useState("unknown");

  const requestPermission = async () => {
    const response = await (DeviceOrientationEvent as any).requestPermission();
    SetPermission(response);

    if (response == "granted") {
      window.addEventListener("devicemotion", handleRotationChange);
    } else {
      window.addEventListener("devicemotion", handleRotationChange);
      SetPermission("granted");
    }
  };

  const handleRotationChange = (event: DeviceMotionEvent) => {
    if (
      event.rotationRate &&
      event.rotationRate?.alpha !== null &&
      event.rotationRate?.beta !== null &&
      event.rotationRate?.gamma !== null
    ) {
      rotationRate.current = {
        yaw: event.rotationRate.alpha, // Yaw (side to side)
        pitch: event.rotationRate.beta, // Pitch (up and down)
        roll: event.rotationRate.gamma, // Roll
      };
      setRotationRateDisplay(rotationRate.current);
    }
  };

  const update = (dt: number) => {
    rotationTracker.current!.process(rotationRate.current, dt);
    setNumFlips(rotationTracker.current!.numFlips);
  };

  const startMeasureRotation = () => {
    rotationTracker.current = new RotationTracker();
    gameLoop.current = new GameLoop(update);
    gameLoop.current.run();
  };

  const stopMeasureRotation = () => {
    gameLoop.current?.stop();
  };

  return (
    <div>
      <h1>Gyroscope Demo</h1>
      {permission !== "granted" && (
        <button onClick={requestPermission}>Enable Gyroscope</button>
      )}
      <p>Roll: {rotationRateDisplay.roll.toFixed(2)}</p>
      <p>Pitch: {rotationRateDisplay.pitch.toFixed(2)}</p>
      <p>Yaw: {rotationRateDisplay.yaw.toFixed(2)}</p>
      <p>Number of flips: {numFlips.toFixed(2)}</p>
      <button onClick={startMeasureRotation}>Start measuring rotation</button>
      <button onClick={stopMeasureRotation}>Stop measuring rotation</button>
    </div>
  );
}
