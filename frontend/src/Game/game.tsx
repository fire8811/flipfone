import { useState, useRef } from "react";
import "./game.css";
import { GameLoop } from "../utils/gameLoop";
import { RotationTracker } from "../utils/rotationTracker";

type GamePhase = "idle" | "armed" | "in_flight";

// Landing/catch detection
const MIN_AIRTIME_S = 0.1; // ignore impacts before this (filters throw impulse)
const MIN_DOWNTIME_S = 0.2; // ignore impacts before this (filters catch impulse)

const MIN_START_MAGNITUDE_THRESHOLD = 17.5; 

export function Game() {
	// Permissions
	const [accPermission, setAccPermission] = useState(false);
	const [gyroPermission, setGyroPermission] = useState(false);

	// Display state
	const [airtime, setAirtime] = useState(0);
	const [flips, setFlips] = useState(0);
	const [phase, setPhase] = useState<GamePhase>("idle");
	const downtimeRef = useRef(true);

	interface rotation {
		roll: number;
		pitch: number;
		yaw: number;
	}

	// Refs for game loop (avoids stale closure)
	const rotationRateRef = useRef<rotation>({ roll: 0, pitch: 0, yaw: 0 });
	const gForceRef = useRef(1);
	const airtimeRef = useRef(0);
	const phaseRef = useRef<GamePhase>("idle");
	const freeFallFrames = useRef(0);
	const rotationTracker = useRef(new RotationTracker());
	const gameLoop = useRef<GameLoop | null>(null);

	// Keep phaseRef and phase state in sync
	function transitionTo(p: GamePhase) {
		if(p == "in_flight") {
			downtimeRef.current = false;
		}
		phaseRef.current = p;
		setPhase(p);
	}

	function onLand() {
		setTimeout(() => {
			downtimeRef.current = true;
		}, MIN_DOWNTIME_S * 1000);
	}

	function gameUpdate(dt: number) {
		const currentPhase = phaseRef.current;

		if (currentPhase === "in_flight") {
			airtimeRef.current += dt;
			setAirtime(airtimeRef.current);

			const rotationRate = rotationTracker.current.process(rotationRateRef.current, dt);

			setFlips(rotationTracker.current.numFlips);
			const inAir = gForceRef.current < 1.2 || rotationRate > 0.001; 
			const minAirtime = airtimeRef.current >= MIN_AIRTIME_S 

			if (!inAir && minAirtime) {
				onLand();
				endGameRound();
			}
		}
	}

	async function armRound() {
		if (!accPermission) await requestAccPermission();
		if (!gyroPermission) await requestGyroPermission();

		freeFallFrames.current = 0;
		airtimeRef.current = 0;
		setAirtime(0);
		setFlips(0);
		transitionTo("armed");

		gameLoop.current = new GameLoop(gameUpdate);
		gameLoop.current.run();
	}

	function endGameRound() {
		gameLoop.current?.stop();
		rotationTracker.current.reset()
		transitionTo("idle");
	}

	const requestAccPermission = async () => {
		const response = await (DeviceMotionEvent as any).requestPermission();
		if (response === "granted") {
			setAccPermission(true);
			window.addEventListener("devicemotion", handleAcceleration);
		}
	};

	const requestGyroPermission = async () => {
		const response = await (DeviceOrientationEvent as any).requestPermission();
		if (response === "granted") {
			window.addEventListener("devicemotion", handleRotationChange);
			setGyroPermission(true);
		}
	};

	const handleAcceleration = (event: DeviceMotionEvent) => {
		const acc = event.accelerationIncludingGravity;
		const accX: number = event.acceleration?.x ?? 0;
		const accY: number = event.acceleration?.y ?? 0;
		const accZ: number = event.acceleration?.z ?? 0;
		const accMagnitude = Math.sqrt(
			accX * accX	+
			accY * accY +
			accZ * accZ
		)
		if(accMagnitude > MIN_START_MAGNITUDE_THRESHOLD && downtimeRef.current && phaseRef.current == "armed") {
			transitionTo("in_flight");
		}

		if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
			const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
			gForceRef.current = magnitude / 9.8;
		}
	};

	// Rotation rate detection
	const handleRotationChange = (event: DeviceMotionEvent) => {
		if (
			event.rotationRate &&
			event.rotationRate?.alpha !== null &&
			event.rotationRate?.beta !== null &&
			event.rotationRate?.gamma !== null
		) {
			rotationRateRef.current = {
				yaw: event.rotationRate.alpha, // Yaw (side to side)
				pitch: event.rotationRate.beta, // Pitch (up and down)
				roll: event.rotationRate.gamma, // Roll
			};
		}
	};

	const statusText = {
		idle: "Flip the phone!",
		armed: "Waiting for throw…",
		in_flight: "Flying!",
	}[phase];

	const flipsInt = Math.round(flips);
	return (
		<div>
			<div className="flip-container">
				{/* Top-right flip counter */}
				<div className="flip-counter">{flipsInt} flip{flipsInt === 1 ? "" : "s"}</div>

				{/* Center airtime */}
				<div className="airtime-display">{airtime.toFixed(2)}s</div>

				{/* Phone visual */}
				<div className="phone-visual">
					<div className="phone-body">
						<div className="phone-screen">{statusText}</div>
						{/* Bottom circular button — arms the detector */}
						<button
							className={`flip-circle ${phase !== "idle" ? "pressed" : ""}`}
							onClick={armRound}
							disabled={phase === "in_flight"}
						>
							{phase === "idle" ? "Play" : phase === "armed" ? "Armed" : "Flying!"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
