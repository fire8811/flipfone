import { useState } from "react";
import "./App.css";
import { Demo } from "./demo/demo";
import { Game } from "./Game/game";
import { WarningModal } from "./WarningModal";
import { DevServer } from "./devServer.ts/devSever";

function App() {
  const [page, setPage] = useState<"home" | "demo" | "game">("home");
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="App">
      {!acknowledged && (
        <WarningModal onAcknowledge={() => setAcknowledged(true)} />
      )}
      {page === "home" && (
        <nav
          style={{
            display: "flex",
            gap: "1rem",
            padding: "1rem",
            borderBottom: "1px solid #ccc",
          }}
        >
          <button onClick={() => setPage("demo")}>Demo</button>
          <button onClick={() => setPage("game")}>Game</button>
        </nav>
      )}

      {page === "demo" && <Demo />}
      {page === "game" && <Game />}
      <button onClick={() => DevServer.log("Hello, server!")}>
        Log something
      </button>
    </div>
  );
}

export default App;
