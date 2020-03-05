const readline = require("readline");
const net = require("net");
const path = require("path");
const { IPCSocket } = require("./socket");
const { EventEmitter } = require("../../common");

class Server extends EventEmitter {
  constructor(config) {
    super();
    this.ipcConfig = config || Server.defaultIPCConfig();
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
}

module.exports.Server = Server;
