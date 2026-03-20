export class DevServer {
  static log(message: any) {
    fetch("/api/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: JSON.stringify(message) }),
    });
  }
}
