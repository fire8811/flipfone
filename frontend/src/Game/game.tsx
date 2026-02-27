import { useState, useEffect, useRef } from 'react';

export function Game() {
    //gameplay status variables
    const [gameActive, setGameActive] = useState(false);
    const [accPermission, SetAccPermission] = useState('unknown');

    async function startGameRound() {
        let permission = accPermission;
        if (permission !== 'granted'){
            permission =await requestPermission();
        }
        if (permission !== 'granted') return;
        setGameActive(true);
    }

    function endGameRound() {
        setGameActive(false);
    }

    //airtime and accelerometer variables
    const [airtime, setAirtime] = useState(0); //airtime in MS
    const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
    const [gForce, setGForce] = useState(1);
    const inFreeFall = gForce <= 0.4; //phone is in free fall when gForce is less than 0.4 (technically should be 0g but accelerometer is quirky)
    const [wasInFreeFall, setWasInFreeFall] = useState(false);

    //request permission for accelerometer access
    const requestPermission = async () => {
        const response = await (DeviceMotionEvent as any).requestPermission();
        SetAccPermission(response);
        
        if (response == 'granted') {
            window.addEventListener('devicemotion', handleAcceleration)
        }
        return response;
    };

    //airtime counting in milliseconds
    useEffect(() => {
      if (!gameActive) return; //do not track airtime when not in freefall 
      
      if(inFreeFall){
        setWasInFreeFall(true)
        const start = Date.now();
        const interval = setInterval(() => {
            setAirtime(Date.now() - start);
        }, 10);

        return () => clearInterval(interval);
      }

      //phone at rest **after** freefall state
      if(wasInFreeFall){
        setWasInFreeFall(false);
        endGameRound();
      }
      
    }, [inFreeFall, gameActive, wasInFreeFall]);

    //g force detection stuff below
    const handleAcceleration = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      
      if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        const x = acc.x;
        const y = acc.y;
        const z = acc.z;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const gForce = magnitude / 9.8;
        
        // Update gForcestate - this triggers re-render with new values
        setAcceleration({ x, y, z });
        setGForce(gForce);
      }
    };

    return (
    <div>
        <h1>Airtime</h1>
        <h2>{airtime} ms</h2>

        {gameActive != true && (
            <button onClick={startGameRound}>THROW ME</button>
        )}
      
    </div>
    );
}