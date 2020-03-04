const readline = require("readline");

class IPCSocket {
  constructor(socket) {
    this.socket = socket;
    this.socket.rl = readline.createInterface(this.socket);
    this.socket.rl.on("line", data => this.onData(data));
    this.socket.on("close", () => this.socket.rl.close());
    this.listeners = {};
  }
  send(data) {
    this.socket.write(JSON.stringify(data) + "\n");
  }
  onData(data) {
    const deserialized = JSON.parse(data);
    this.emit("message", deserialized);
  }
  emit(event, ...args) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].forEach(fn => fn(...args));
  }
  on(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
    return this;
  }
  off(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event] = this.listeners[event].filter(fn => fn !== callback);
    return this;
  }
}

module.exports.IPCSocket = IPCSocket;
