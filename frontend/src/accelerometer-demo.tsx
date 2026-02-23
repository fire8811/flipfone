import { useState, useEffect, useRef } from 'react';

export function AccDemo() {
    const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
    const [gForce, setGForce] = useState(1);
    const [permission, SetPermission] = useState('unknown');

    //getting airtime stuff
    const [airtime, setAirtime] = useState(0); //airtime in MS
    const [running, setRunning] = useState(false);
    const startTimeRef = useRef<number | null>(null);

    const inFreeFall = gForce <= 0.4;

    const requestPermission = async () => {
        const response = await (DeviceMotionEvent as any).requestPermission();
        SetPermission(response);
        
        if (response == 'granted') {
            window.addEventListener('devicemotion', handleAcceleration)
        }
    };

    //airtime counting in milliseconds
    useEffect(() => {
      if (!inFreeFall) return;

      const start = Date.now();
      const interval = setInterval(() => {
        setAirtime(Date.now() - start);
      }, 10);

      return () => clearInterval(interval);
    }, [running, inFreeFall]);

    //g force detection stuff below
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

      {gForce < 0.3 && <h1 style={{ color: "red", fontWeight: "bold" }}>FREE FALL</h1>} 

      <h1>G FORCE: {gForce.toFixed(2)}</h1>
      
      <button onClick={() => {setAirtime(0);}}>Enable Airtime Recording</button>
      <h3>Airtime: {airtime} ms</h3>
    </div>
    );
}