import { useState, useRef } from "react";
import "./game.css";
import { GameLoop } from "../utils/gameLoop";
import { RotationTracker } from "../utils/rotationTracker";

type GamePhase = "idle" | "armed" | "in_flight";

// Throw detection
const FREEFALL_THRESHOLD = 0.6; // g — below this is considered free fall
const FREEFALL_CONFIRM_FRAMES = 5; // consecutive frames before throw is confirmed

// Landing/catch detection
const IMPACT_THRESHOLD = 5.0; // g — spike above this ends the round
const MIN_AIRTIME_S = 0.1; // ignore impacts before this (filters throw impulse)

export function Game() {
	// Permissions
	const [accPermission, setAccPermission] = useState(false);
	const [gyroPermission, setGyroPermission] = useState(false);

	// Display state
	const [airtime, setAirtime] = useState(0);
	const [flips, setFlips] = useState(0);
	const [phase, setPhase] = useState<GamePhase>("idle");

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
		phaseRef.current = p;
		setPhase(p);
	}

	function gameUpdate(dt: number) {
		const currentPhase = phaseRef.current;
		const currentGForce = gForceRef.current;

		if (currentPhase === "armed") {
			// Wait for sustained free fall to confirm the throw
			if (currentGForce <= FREEFALL_THRESHOLD) {
				freeFallFrames.current++;
				if (freeFallFrames.current >= FREEFALL_CONFIRM_FRAMES) {
					// Throw confirmed — start tracking
					freeFallFrames.current = 0;
					airtimeRef.current = 0;
					setAirtime(0);
					rotationTracker.current.reset();
					setFlips(0);
					transitionTo("in_flight");
				}
			} else {
				freeFallFrames.current = 0; // reset on any non-freefall frame
			}
		} else if (currentPhase === "in_flight") {
			airtimeRef.current += dt;
			setAirtime(airtimeRef.current);

			rotationTracker.current.process(rotationRateRef.current, dt);
			setFlips(rotationTracker.current.numFlips);

			// Detect landing/catch: g-force spike after minimum airtime,
			// or safety timeout for soft landings
			if (airtimeRef.current >= MIN_AIRTIME_S) {
				if (currentGForce >= IMPACT_THRESHOLD) {
					endGameRound();
				}
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

	return (
		<div>
			<div className="flip-container">
				{/* Top-right flip counter */}
				<div className="flip-counter">{Math.round(flips)} flips</div>

				{/* Center airtime */}
				<div className="airtime-display">{airtime.toFixed(2)}s</div>

				{/* Phone visual */}
				<div className="phone-visual">
					<div className="phone-body">
						<div className="phone-screen">{statusText}</div>
					</div>
				</div>

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
	);
}
