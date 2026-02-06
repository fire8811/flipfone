import { spawn } from "node:child_process";

const PORT = 5173;

const proc = spawn(
  "cloudflared",
  ["tunnel", "--url", `http://localhost:${PORT}`],
);

proc.stdout.on("data", handleCloudfareOutput);
proc.stderr.on("data", handleCloudfareOutput);
proc.on("exit", (code) => process.exit(code ?? 0));

let qrPrinted = false;
function handleCloudfareOutput(data) {
  const text = data.toString();
  process.stdout.write(text);

  if (!qrPrinted && text.includes("|  https://")) {
    const match = text.match(/https:\/\/[^\s]+/);
    if (match) {
      qrPrinted = true;
      const url = match[0].trim();
      generateQrCode(url);
    }
  }
}

function generateQrCode(url) {
  spawn("npx", ["qrcode-terminal", url], {
    shell: true,
    stdio: "inherit",
  });
}
