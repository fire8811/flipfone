import { useState } from "react";
import "./App.css";
import { Demo } from "./demo/demo";
import { Game } from './Game/game';
import { WarningModal } from './WarningModal'


function App() {
	// const [page, setPage] = useState<"home" | "demo" | "game">("home");
  const [acknowledged, setAcknowledged] = useState(false)

	return (
		<div className="App">
			{!acknowledged && <WarningModal onAcknowledge={() => setAcknowledged(true)} />}
			{/* <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ccc" }}>
				<button onClick={() => setPage("demo")}>Demo</button>
				<button onClick={() => setPage("game")}>Game</button>
			</nav> */}

			{/* {page === "demo" && <Demo />} */}
			{/* {page === "game" && <Game />} */}
			<Game />
			{/* {page === "home" && <p>Select a page above.</p>} */}
		</div>
	);
}

export default App;
