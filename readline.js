class SocketReader {
  constructor(socket) {
    this.socket = socket;
    this.data = "";
    this.socket.on("data", data => this.handleData(data));
    this.listeners = {};
  }
  handleData(data) {
    this.data += data.toString();
    this.checkForLines();
  }
  checkForLines() {
    let n = this.data.indexOf("\n");
    while (~n) {
      const line = this.data.slice(0, n);
      this.data = this.data.slice(n + 1);
      this.listeners.line.forEach(callback => callback(line));
      n = this.data.indexOf("\n");
    }
  }
  on(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
  }
}

module.exports.SocketReader = SocketReader;
