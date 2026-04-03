import React, { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Color palette for firework sparks
 */
type SparkColor = 'red' | 'blue' | 'yellow' | 'purple' | 'green' | 'orange' | 'pink' | 'cyan';

/**
 * Represents a single spark particle in the animation
 */
interface Spark {
  id: number;
  color: SparkColor;
  tx: number; // Translation X
  ty: number; // Translation Y
  burstType: 1 | 2 | 3;
  x: number; // Center X position
  y: number; // Center Y position
}

/**
 * Configuration options for the fireworks overlay
 */
interface FireworksConfig {
  particlesPerBurst?: number;
  burstSpacing?: number;
  animationDuration?: number;
  minDistance?: number;
  maxDistance?: number;
}

/**
 * Global window interface extension for fireworks function
 */
declare global {
  interface Window {
    triggerFireworks: (count: number) => void;
  }
}

// Export empty to make this a module
export {};

/**
 * FireworksOverlay Component
 * 
 * Renders an overlay of animated firework particles across the entire viewport.
 * Exposes `window.triggerFireworks(count)` for easy triggering from anywhere in the app.
 * 
 * @example
 * ```tsx
 * <FireworksOverlay />
 * 
 * // Later, trigger fireworks from anywhere:
 * window.triggerFireworks(5);
 * ```
 */
const FireworksOverlay: React.FC = () => {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const idRef = useRef<number>(0);

  const colors: SparkColor[] = [
    'red',
    'blue',
    'yellow',
    'purple',
    'green',
    'orange',
    'pink',
    'cyan',
  ];

  const config: Required<FireworksConfig> = {
    particlesPerBurst: 30,
    burstSpacing: 200,
    animationDuration: 2500,
    minDistance: 80,
    maxDistance: 100,
  };

  /**
   * Calculate random particle trajectory
   */
  const calculateTrajectory = (
    index: number,
    total: number
  ): { tx: number; ty: number } => {
    const angle = (index / total) * Math.PI * 2;
    const distance =
      config.minDistance + Math.random() * config.maxDistance;

    return {
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
    };
  };

  /**
   * Get random color from palette
   */
  const getRandomColor = (): SparkColor => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  /**
   * Get random burst animation pattern (1-3)
   */
  const getRandomBurstType = (): 1 | 2 | 3 => {
    return (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
  };

  /**
   * Create a single firework burst at random screen position
   */
  const createBurst = useCallback((): void => {
    const burstType = getRandomBurstType();
    const particleCount =
      config.particlesPerBurst +
      Math.random() * config.particlesPerBurst * 0.67;

    const centerX = Math.random() * window.innerWidth;
    const centerY = Math.random() * window.innerHeight;

    const newSparks: Spark[] = [];

    for (let i = 0; i < particleCount; i++) {
      const { tx, ty } = calculateTrajectory(i, particleCount);

      newSparks.push({
        id: idRef.current++,
        color: getRandomColor(),
        tx,
        ty,
        burstType,
        x: centerX,
        y: centerY,
      });
    }

    setSparks((prev) => [...prev, ...newSparks]);

    // Clean up sparks after animation completes
    setTimeout(() => {
      setSparks((prev) =>
        prev.filter((spark) => !newSparks.find((ns) => ns.id === spark.id))
      );
    }, config.animationDuration);
  }, [config.animationDuration, config.particlesPerBurst]);

  /**
   * Trigger multiple firework bursts with spacing
   * @param count Number of fireworks to trigger
   */
  const explode = useCallback(
    (count: number = 1): void => {
      for (let burst = 0; burst < count; burst++) {
        setTimeout(() => {
          createBurst();
        }, burst * config.burstSpacing);
      }
    },
    [createBurst]
  );

  /**
   * Expose explode function to window for global access
   */
  useEffect(() => {
    window.triggerFireworks = explode;

    return () => {
      // @ts-ignore - cleanup
      delete window.triggerFireworks;
    };
  }, [explode]);

  return (
    <>
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
          animation: burst 2s ease-out forwards;
        }

        .burst-pattern-2 {
          animation: burst 1.5s ease-out forwards;
        }

        .burst-pattern-3 {
          animation: burst 2.5s ease-out forwards;
        }

        .spark {
          position: fixed;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          pointer-events: none;
          margin-left: -3px;
          margin-top: -3px;
          z-index: 9999;
        }

        .red {
          background: #ff1744;
        }
        .blue {
          background: #00e5ff;
        }
        .yellow {
          background: #ffeb3b;
        }
        .purple {
          background: #d946ef;
        }
        .green {
          background: #00ff41;
        }
        .orange {
          background: #ff6600;
        }
        .pink {
          background: #ff69b4;
        }
        .cyan {
          background: #00ffff;
        }
      `}</style>

      {sparks.map((spark) => (
        <div
          key={spark.id}
          className={`spark burst-pattern-${spark.burstType} ${spark.color}`}
          style={
            {
              left: `${spark.x}px`,
              top: `${spark.y}px`,
              '--tx': `${spark.tx}px`,
              '--ty': `${spark.ty}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
};

export default FireworksOverlay;
export type { Spark, FireworksConfig, SparkColor };