import { useState, useEffect, useRef, type Ref } from "react";
import "./game.css";
import { GameLoop } from "../utils/gameLoop";
import { RotationTracker } from "../utils/rotationTracker";

export function Game() {
	// Gameplay status variables
	const [gameActive, setGameActive] = useState(false);
	const [accPermission, setAccPermission] = useState(false);
	const [gyroPermission, setGyroPermission] = useState(false);

	// Airtime and accelerometer variables
	const [airtime, setAirtime] = useState(0); // Airtime in ms
	const [gForce, setGForce] = useState(1);
	const inFreeFall = gForce <= 0.4; // Phone is in free fall when gForce is less than 0.4 (technically should be 0g but accelerometer is quirky)
	const [wasInFreeFall, setWasInFreeFall] = useState(false);
	const [pressed, setPressed] = useState(false);
	const [flips, setFlips] = useState(0);

	interface rotation {
		roll: number;
		pitch: number;
		yaw: number;
	}
	const rotationRateRef = useRef<rotation>({ roll: 0, pitch: 0, yaw: 0 });
	const rotationTracker = useRef(new RotationTracker());
	const gameLoop = useRef<GameLoop | null>(null);

	// Request permission for accelerometer access
	const requestAccPermission = async () => {
		const response = await (DeviceMotionEvent as any).requestPermission();

		if (response == "granted") {
			setAccPermission(true);
			window.addEventListener("devicemotion", handleAcceleration);
		}
	};

	// Request permission for gyroscope access
	const requestGyroPermission = async () => {
		const response = await (DeviceOrientationEvent as any).requestPermission();

		if (response == "granted") {
			window.addEventListener("devicemotion", handleRotationChange);
			setGyroPermission(true);
		}
	};

	function gameUpdate(dt: number) {
		rotationTracker.current.process(rotationRateRef.current, dt);
		setFlips(rotationTracker.current.numFlips);

		if (inFreeFall) {
			setAirtime(airtime + dt);
			setWasInFreeFall(true);
		} else if (wasInFreeFall) {
			// Not in free fall, but you just were (this means the phone landed)
			setWasInFreeFall(false);
			endGameRound();
		}
	}

	async function startGameRound() {
		if (!accPermission) {
			await requestAccPermission();
		}
		if (!gyroPermission) {
			await requestGyroPermission();
		}
		setAirtime(0);
		rotationTracker.current.reset();
		setGameActive(true);
		gameLoop.current = new GameLoop(gameUpdate);
		gameLoop.current.run();
		setPressed(!pressed); // Change eventually
	}

	function endGameRound() {
		setPressed(false);
		setGameActive(false);
		gameLoop.current?.stop();
	}

	// G-force detection stuff below
	const handleAcceleration = (event: DeviceMotionEvent) => {
		const acc = event.accelerationIncludingGravity;

		if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
			const x = acc.x;
			const y = acc.y;
			const z = acc.z;
			const magnitude = Math.sqrt(x * x + y * y + z * z);
			const gForce = magnitude / 9.8;

			// Update gForcestate - this triggers re-render with new values
			setGForce(gForce);
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

	return (
		<div>
			<div className="flip-container">
				{/* Top-right flip counter */}
				<div className="flip-counter">{Math.round(flips)} flips</div>

				{/* Center airtime */}
				<div className="airtime-display">{(airtime / 1000).toFixed(2)}s</div>

				{/* Phone visual (optional aesthetic) */}
				<div className="phone-visual">
					<div className="phone-body">
						<div className="phone-screen">Flip the phone!</div>
					</div>
				</div>

				{/* Bottom circular button */}
				<button className={`flip-circle ${pressed ? "pressed" : ""}`} onClick={startGameRound}>
					Play
				</button>
			</div>
		</div>
	);
}
