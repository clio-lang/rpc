const readline = require("readline");
const net = require("net");
const { Server } = require("./server");

class Client {
  constructor(config) {
    this.ipcConfig = config || Server.defaultIPCConfig();
    this.listeners = {};
  }
  connect() {
    this.socket = net.connect(this.ipcConfig.path);
    this.rl = readline.createInterface(this.socket);
    this.rl.on("line", data => this.onData(data));
    this.socket.on("connect", () => this.emit("connect"));
    this.socket.on("close", () => this.rl.close());
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

module.exports.Client = Client;
