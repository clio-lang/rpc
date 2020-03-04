const readline = require("readline");
const net = require("net");
const path = require("path");
const { IPCSocket } = require("./socket");

class Server {
  constructor(config) {
    this.ipcConfig = config || Server.defaultIPCConfig();
    this.listeners = {};
  }
  static getIPCPath({ name }) {
    const paths = [process.cwd(), name];
    if (process.platform == "win32") paths.unshift("\\\\?\\pipe");
    return path.join(...paths);
  }
  static defaultIPCConfig() {
    return {
      path: Server.getIPCPath({ name: "ipc.sock" })
    };
  }
  createIPCServer() {
    if (!this.ipcConfig) return;
    const { path } = this.ipcConfig;
    this.ipcServer = net.createServer();
    this.ipcServer.listen(path);
    this.ipcServer.on("connection", socket => this.onIPCConnect(socket));
  }
  onIPCConnect(socket) {
    socket.rl = readline.createInterface(socket);
    socket.rl.on("line", data => this.handleIncoming(socket, data));
    socket.on("close", () => socket.rl.close());
  }
  handleIncoming(socket, data) {
    const { instruction, details, id } = JSON.parse(data);
    const ipcSocket = new IPCSocket(socket);
    this.emit(instruction, ipcSocket, details, id);
  }
  start() {
    return this.createIPCServer();
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

module.exports.Server = Server;
