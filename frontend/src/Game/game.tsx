import { useEffect, useRef, useState } from "react";
import "./game.css";
import { GameLoop } from "../utils/gameLoop";
import { RotationTracker } from "../utils/rotationTracker";

type GamePhase =
	| "idle"
	| "confirming_held"
	| "armed"
	| "in_flight";

interface Rotation {
	roll: number;
	pitch: number;
	yaw: number;
}

// -------------------- CONSTANTS --------------------

// Held detection (USES SMOOTHED)
const HELD_G_MIN = 0.75;
const HELD_G_MAX = 1.25;
const HELD_CONFIRM_FRAMES = 8;

// Throw detection — delta computed per sensor event for accuracy
const THROW_THRESHOLD = 1.6;
const THROW_DELTA_THRESHOLD = 0.25;

// Landing detection
const IMPACT_THRESHOLD = 1.75;
const MIN_AIRTIME_S = 0.12;

// Grace period after throw — suppresses landing detection while throw
// impulse is still ringing through the sensor
const LANDING_GRACE_S = 0.15;

// The phone must pass through a low-g phase before a landing spike counts.
// This prevents the release-from-hand spike (which has no preceding low-g)
// from being mistaken for a catch.
const LOW_G_THRESHOLD = 0.85;

// Smoothing ONLY for held detection
const G_SMOOTHING = 0.18;

// -------------------- COMPONENT --------------------

export function Game() {
	const [accPermission, setAccPermission] = useState(false);
	const [gyroPermission, setGyroPermission] = useState(false);

	const [airtime, setAirtime] = useState(0);
	const [flips, setFlips] = useState(0);
	const [phase, setPhase] = useState<GamePhase>("idle");

	// Sensor refs
	const gravityRawRef = useRef(1);
	const gravitySmoothRef = useRef(1);
	const gravityDeltaRef = useRef(0);
	const prevSensorGRef = useRef(1);

	const rotationRateRef = useRef<Rotation>({ roll: 0, pitch: 0, yaw: 0 });

	// Game refs
	const phaseRef = useRef<GamePhase>("idle");
	const airtimeRef = useRef(0);
	const heldFramesRef = useRef(0);
	const landingGraceRef = useRef(0);
	// Latches true once g has dipped below LOW_G_THRESHOLD during flight.
	// Landing can only trigger after this — ensures release spikes are ignored.
	const hasSeenLowGRef = useRef(false);

	const rotationTracker = useRef(new RotationTracker());
	const gameLoop = useRef<GameLoop | null>(null);

	function transitionTo(next: GamePhase) {
		phaseRef.current = next;
		setPhase(next);
	}

	function resetRoundState() {
		heldFramesRef.current = 0;
		airtimeRef.current = 0;
		landingGraceRef.current = 0;
		hasSeenLowGRef.current = false;
		gravityDeltaRef.current = 0;
		prevSensorGRef.current = gravityRawRef.current;

		setAirtime(0);
		setFlips(0);

		rotationTracker.current.reset();
	}

	function endGameRound() {
		gameLoop.current?.stop();
		transitionTo("idle");
	}

	// -------------------- GAME LOOP --------------------

	function gameUpdate(dt: number) {
		const currentPhase = phaseRef.current;

		const rawG = gravityRawRef.current;
		const smoothG = gravitySmoothRef.current;
		const delta = gravityDeltaRef.current;

		// -------------------- HELD --------------------
		if (currentPhase === "confirming_held") {
			if (smoothG >= HELD_G_MIN && smoothG <= HELD_G_MAX) {
				heldFramesRef.current++;
				if (heldFramesRef.current >= HELD_CONFIRM_FRAMES) {
					heldFramesRef.current = 0;
					transitionTo("armed");
				}
			} else {
				heldFramesRef.current = 0;
			}
			return;
		}

		// -------------------- ARMED --------------------
		else if (currentPhase === "armed") {
			const isThrow =
				rawG > THROW_THRESHOLD &&
				delta > THROW_DELTA_THRESHOLD;

			if (isThrow) {
				airtimeRef.current = 0;
				setAirtime(0);

				rotationTracker.current.reset();
				setFlips(0);

				landingGraceRef.current = LANDING_GRACE_S;
				hasSeenLowGRef.current = false;

				transitionTo("in_flight");
			}
		}

		// -------------------- IN FLIGHT --------------------
		else if (currentPhase === "in_flight") {
			airtimeRef.current += dt;
			setAirtime(airtimeRef.current);

			rotationTracker.current.process(rotationRateRef.current, dt);
			setFlips(rotationTracker.current.numFlips);

			// Suppress landing detection during grace period
			if (landingGraceRef.current > 0) {
				landingGraceRef.current -= dt;
				return;
			}

			// Watch for the low-g phase that must precede a valid landing.
			// A flipping phone may not hit pure freefall, but will dip below
			// LOW_G_THRESHOLD at some point during the arc or rotation.
			if (!hasSeenLowGRef.current && rawG < LOW_G_THRESHOLD) {
				hasSeenLowGRef.current = true;
			}

			// Landing: must have seen low-g first, then an impact spike
			if (
				hasSeenLowGRef.current &&
				airtimeRef.current >= MIN_AIRTIME_S &&
				rawG > IMPACT_THRESHOLD
			) {
				endGameRound();
			}
		}
	}

	// -------------------- CONTROL --------------------

	async function armRound() {
		if (!accPermission) {
			const ok = await requestAccPermission();
			if (!ok) return;
		}
		if (!gyroPermission) {
			const ok = await requestGyroPermission();
			if (!ok) return;
		}

		gameLoop.current?.stop();
		resetRoundState();

		transitionTo("confirming_held");

		gameLoop.current = new GameLoop(gameUpdate);
		gameLoop.current.run();
	}

	// -------------------- PERMISSIONS --------------------

	const requestAccPermission = async () => {
		try {
			const fn = (DeviceMotionEvent as any)?.requestPermission;
			if (typeof fn === "function") {
				const res = await fn();
				if (res !== "granted") return false;
			}
			setAccPermission(true);
			return true;
		} catch {
			return false;
		}
	};

	const requestGyroPermission = async () => {
		try {
			const fn = (DeviceOrientationEvent as any)?.requestPermission;
			if (typeof fn === "function") {
				const res = await fn();
				if (res !== "granted") return false;
			}
			setGyroPermission(true);
			return true;
		} catch {
			return false;
		}
	};

	// -------------------- SENSOR --------------------

	useEffect(() => {
		function handleMotion(event: DeviceMotionEvent) {
			const acc = event.accelerationIncludingGravity;

			if (acc?.x != null && acc?.y != null && acc?.z != null) {
				const raw =
					Math.sqrt(
						acc.x * acc.x +
						acc.y * acc.y +
						acc.z * acc.z
					) / 9.8;

				gravityDeltaRef.current = raw - prevSensorGRef.current;
				prevSensorGRef.current = raw;

				gravityRawRef.current = raw;

				gravitySmoothRef.current =
					gravitySmoothRef.current * (1 - G_SMOOTHING) +
					raw * G_SMOOTHING;
			}

			if (
				event.rotationRate &&
				event.rotationRate.alpha != null &&
				event.rotationRate.beta != null &&
				event.rotationRate.gamma != null
			) {
				rotationRateRef.current = {
					yaw: event.rotationRate.alpha,
					pitch: event.rotationRate.beta,
					roll: event.rotationRate.gamma,
				};
			}
		}

		window.addEventListener("devicemotion", handleMotion);

		return () => {
			window.removeEventListener("devicemotion", handleMotion);
			gameLoop.current?.stop();
		};
	}, []);

	// -------------------- UI --------------------

	const statusText = {
		idle: "Flip the phone!",
		confirming_held: "Hold still…",
		armed: "Ready",
		in_flight: "Flying!",
	}[phase];

	return (
		<div>
			<div className="flip-container">
				<div className="flip-counter">
					{Math.round(flips)} flips
				</div>

				<div className="airtime-display">
					{airtime.toFixed(2)}s
				</div>

				<div className="phone-visual">
					<div className="phone-body">
						<div className="phone-screen">
							{statusText}
						</div>
					</div>
				</div>

				<button
					className={`flip-circle ${
						phase !== "idle" ? "pressed" : ""
					}`}
					onClick={armRound}
					disabled={phase !== "idle"}
				>
					{phase === "idle" ? "Play" : statusText}
				</button>
			</div>
		</div>
	);
}
