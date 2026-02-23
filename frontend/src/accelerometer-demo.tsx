import { useState, useEffect, useRef } from 'react';

export function AccDemo() {
    const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
    const [gForce, setGForce] = useState(1);
    const [maxG, setMaxG] = useState(1);
    const [permission, SetPermission] = useState('unknown');

    const requestPermission = async () => {
        const response = await (DeviceMotionEvent as any).requestPermission();
        SetPermission(response);
        
        if (response == 'granted') {
            window.addEventListener('devicemotion', handleAcceleration)
        }
    };

    //getting airtime stuff
    const [airtime, setAirtime] = useState(0); //airtime in MS
    const [running, setRunning] = useState(false); //this isn't used rn but could be useful as a game start/stop toggle eventually
    const inFreeFall = gForce <= 0.4; //phone is in free fall when gForce is less than 0.4 (technically should be 0g but accelerometer is quirky)


    //helping get max g forces
    const prevFreeFallRef = useRef(false); //this is for checking the free fall status of the previous state (eg 'are we in free fall after being at rest?)
    const [launchG, setLaunchG] = useState<number | null>(null);
    const [launchMaxG, setLaunchMaxG] = useState<number | null>(null);

    const [landingG, setLandingG] = useState<number | null>(null);
    const [landingMaxG, setLandingMaxG] = useState<number | null>(null);
    const rollingMaxRef = useRef(0); //a rolling max counter that updates itself with the max G force value without re-rendering

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

        //update maxG when G Force is at highest value
        setMaxG(prev => Math.max(prev, gForce));
      }
    };

    //gets the rolling max g force value when not in free fall (e.g. duing launch and landing phase)
    useEffect(() => {
      if (!inFreeFall) {
        rollingMaxRef.current = Math.max(rollingMaxRef.current, gForce);
      }
    }, [gForce, inFreeFall])

    //max G force detection for before and after freefall
    useEffect(() => {
      const wasFreeFall = prevFreeFallRef.current;

      //Transition to STARTING to fall
      if (!wasFreeFall && inFreeFall) {
        setLaunchMaxG(rollingMaxRef.current);
        rollingMaxRef.current = 0; //reset ref for landing phase to 0
      }

      //transition to LANDED after falling
      if (wasFreeFall && !inFreeFall){
        setLandingMaxG(rollingMaxRef.current);
        rollingMaxRef.current = 0;
      }

      prevFreeFallRef.current = inFreeFall;
    }, [inFreeFall])

    return (
    <div>
        <h2>G Force Demo</h2>
      {permission !== 'granted' && (
        <button onClick={requestPermission}>Enable Acceleromteter</button>
      )}

      {gForce < 0.3 && <h1 style={{ color: "red", fontWeight: "bold" }}>FREE FALL</h1>} 

      <h1>G FORCE: {gForce.toFixed(2)}</h1>
      
      <h3>Airtime: {airtime} ms</h3>
      <h3>Max G: {maxG.toFixed(2)}</h3>
      <p>Max Launch G: {launchMaxG?.toFixed(2)}</p>
      <p>Max Landing G: {landingMaxG?.toFixed(2)}</p>
    </div>
    );
}