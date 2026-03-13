import { useState } from "react";
import "./App.css";
import { Demo } from "./demo/demo";
import { Game } from "./Game/game";

function App() {
	const [page, setPage] = useState<"home" | "demo" | "game">("home");

	return (
		<div className="App">
			{page === "home" && (
				<nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ccc" }}>
					<button onClick={() => setPage("demo")}>Demo</button>
					<button onClick={() => setPage("game")}>Game</button>
				</nav>
			)}

			{page === "demo" && <Demo />}
			{page === "game" && <Game />}
		</div>
	);
}

export default App;
