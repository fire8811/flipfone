import { useState, useEffect } from 'react';

export function GyroDemo() {
    const [orientation, setOrientation] = useState<{
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
    }>({ alpha: null, beta: null, gamma: null });

    const [permission, SetPermission] = useState('unknown');

    const requestPermission = async () => {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        SetPermission(response);

        if (response == 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
        } else {
            window.addEventListener('deviceorientation', handleOrientation)
            SetPermission('granted')
        }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
        setOrientation({
            alpha: event.alpha, //yaw (side to side)
            beta: event.beta, //pitch (up and down)
            gamma: event.gamma //roll
        });
    };

    return (
    <div>
      <h1>Gyroscope Demo</h1>
      {permission !== 'granted' && (
        <button onClick={requestPermission}>Enable Gyroscope</button>
      )}
      <p>Roll: {orientation.gamma?.toFixed(2)}</p>
      <p>Pitch: {orientation.beta?.toFixed(2)}</p>
      <p>Yaw: {orientation.alpha?.toFixed(2)}</p>
      
    </div>
    );
}