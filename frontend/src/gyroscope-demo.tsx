import { useState, useRef, type Ref } from "react";
import { RotationTracker } from "./utils/rotationTracker";
import { GameLoop } from "./utils/gameLoop";

export interface rotation {
  roll: number;
  pitch: number;
  yaw: number;
}

export function GyroDemo() {
  const orientation = useRef<rotation>({ roll: 0, pitch: 0, yaw: 0 });
  const [rotationChange, setRotationChange] = useState<rotation>({
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
      window.addEventListener("deviceorientation", handleOrientation);
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
      SetPermission("granted");
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      orientation.current = {
        yaw: event.alpha, // Yaw (side to side)
        pitch: event.beta, // Pitch (up and down)
        roll: event.gamma, // Roll
      };
    }
  };

  const update = () => {
    rotationTracker.current!.process(
      orientation.current.yaw,
      orientation.current.pitch,
      orientation.current.roll,
    );
    setRotationChange({
      yaw: rotationTracker.current?.totalYaw ?? 0,
      pitch: rotationTracker.current?.totalPitch ?? 0,
      roll: rotationTracker.current?.totalRoll ?? 0,
    });
    setNumFlips(rotationTracker.current?.countFlips() ?? 0);
  };

  const startMeasureRotation = () => {
    {
      rotationTracker.current = new RotationTracker(
        orientation.current.yaw,
        orientation.current.pitch,
        orientation.current.roll,
      );
    }
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
      <p>Roll: {rotationChange.roll.toFixed(2)}</p>
      <p>Pitch: {rotationChange.pitch.toFixed(2)}</p>
      <p>Yaw: {rotationChange.yaw.toFixed(2)}</p>
      <p>Number of flips: {numFlips.toFixed(2)}</p>
      <button onClick={startMeasureRotation}>Start measuring rotation</button>
      <button onClick={stopMeasureRotation}>Stop measuring rotation</button>
    </div>
  );
}
