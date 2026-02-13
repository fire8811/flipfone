import { useState, useEffect } from 'react';

export function AccDemo() {
    const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
    const [gForce, setGForce] = useState(1);

    const [permission, SetPermission] = useState('unknown');

    const requestPermission = async () => {
        const response = await (DeviceMotionEvent as any).requestPermission();
        SetPermission(response);
        
        if (response == 'granted') {
            window.addEventListener('devicemotion', handleAcceleration)
        }
    };

    const handleAcceleration = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      
      if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        // These consts are scoped to this function call - fine to use const
        const x = acc.x;
        const y = acc.y;
        const z = acc.z;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const gForce = magnitude / 9.8;
        
        // Update state - this triggers re-render with new values
        setAcceleration({ x, y, z });
        setGForce(gForce);
      }
    };


    return (
    <div>
        <h2>G Force Demo</h2>
      {permission !== 'granted' && (
        <button onClick={requestPermission}>Enable Acceleromteter</button>
      )}
      <h1>G FORCE: {gForce.toFixed(2)}</h1>
        
    </div>
    );
}