import React, { useState, useRef } from 'react';

const Fireworks = () => {
  const [sparks, setSparks] = useState([]);
  const idRef = useRef(0);

  const colors = ['red', 'blue', 'yellow', 'purple', 'green', 'orange', 'pink', 'cyan'];

  const explode = (count = 1) => {
    for (let burst = 0; burst < count; burst++) {
      setTimeout(() => {
        const burstType = Math.floor(Math.random() * 3) + 1;
        const sparksCount = 30 + Math.random() * 20;
        const newSparks = [];

        // Random position within container
        const containerWidth = 600;
        const containerHeight = 600;
        const centerX = 50 + Math.random() * (containerWidth - 100);
        const centerY = 50 + Math.random() * (containerHeight - 100);

        for (let i = 0; i < sparksCount; i++) {
          const angle = (i / sparksCount) * Math.PI * 2;
          const distance = 80 + Math.random() * 100;

          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance;

          newSparks.push({
            id: idRef.current++,
            color: colors[Math.floor(Math.random() * colors.length)],
            tx,
            ty,
            burstType,
            x: centerX,
            y: centerY,
          });
        }

        setSparks(prev => [...prev, ...newSparks]);

        // Remove sparks after animation
        setTimeout(() => {
          setSparks(prev => prev.filter(spark => !newSparks.find(ns => ns.id === spark.id)));
        }, 1500);
      }, burst * 200);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes burst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        .burst-pattern-1 {
          animation: burst 1.2s ease-out forwards;
        }

        .burst-pattern-2 {
          animation: burst 0.8s ease-out forwards;
        }

        .burst-pattern-3 {
          animation: burst 1.5s ease-out forwards;
        }

        .spark {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          pointer-events: none;
          margin-left: -2px;
          margin-top: -2px;
        }

        .red { background: #ff1744; }
        .blue { background: #00e5ff; }
        .yellow { background: #ffeb3b; }
        .purple { background: #d946ef; }
        .green { background: #00ff41; }
        .orange { background: #ff6600; }
        .pink { background: #ff69b4; }
        .cyan { background: #00ffff; }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .fireworks-container {
          animation: pulse 2s infinite ease-in-out;
        }
      `}</style>

      <div
        className="fireworks-container"
        style={{
          position: 'relative',
          width: '600px',
          height: '600px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          marginBottom: '40px',
        }}
      >
        {sparks.map(spark => (
          <div
            key={spark.id}
            className={`spark burst-pattern-${spark.burstType} ${spark.color}`}
            style={{
              left: `${spark.x}px`,
              top: `${spark.y}px`,
              '--tx': `${spark.tx}px`,
              '--ty': `${spark.ty}px`,
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => explode(1)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: '#ff1744',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        >
          explode(1)
        </button>

        <button
          onClick={() => explode(3)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: '#00e5ff',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        >
          explode(3)
        </button>

        <button
          onClick={() => explode(5)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: '#ffeb3b',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        >
          explode(5)
        </button>

        <button
          onClick={() => explode(10)}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: '#d946ef',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        >
          explode(10)
        </button>
      </div>
    </div>
  );
};

export default Fireworks;