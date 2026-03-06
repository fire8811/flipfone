//request permission for accelerometer access
const requestPermission = async () => {
	const response = await (DeviceMotionEvent as any).requestPermission();
	SetAccPermission(response);

	if (response == "granted") {
		window.addEventListener("devicemotion", handleAcceleration);
	}
	return response;
};

async function startGameRound() {
	let permission = accPermission;
	if (permission !== "granted") {
		permission = await requestPermission();
	}
	if (permission !== "granted") return;
	setAirtime(0);
	setGameActive(true);
	setPressed(true);
}
