import { spawn } from "node:child_process";

let qrPrinted = false;
export function tunnelQr(port) {
  qrPrinted = false;
  const proc = spawn("cloudflared", [
    "tunnel",
    "--url",
    `http://localhost:${port}`,
  ]);

  proc.stdout.on("data", handleCloudfareOutput);
  proc.stderr.on("data", handleCloudfareOutput);
  proc.on("exit", (code) => process.exit(code ?? 0));
}

function handleCloudfareOutput(data) {
  const text = data.toString();

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
  console.log("Generating QR code...")
  spawn("npx", ["qrcode-terminal", url], {
    shell: true,
    stdio: "inherit",
  });
}
