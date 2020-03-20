const WebSocket = require("ws");
const { WSSocket } = require("./socket");
const { EventEmitter } = require("../../common");

class Server extends EventEmitter {
  constructor(config) {
    super();
    this.wsConfig = config || Server.defaultWSConfig();
  }
  static defaultWSConfig() {
    return { port: 8080, url: "ws://localhost:8080" };
  }
  createWSServer() {
    if (!this.wsConfig) return;
    const { port } = this.wsConfig;
    this.wsServer = new WebSocket.Server({ port });
    this.wsServer.on("connection", socket => this.onWSConnect(socket));
  }
  onWSConnect(socket) {
    socket.on("message", data => this.handleIncoming(socket, data));
  }
  handleIncoming(socket, data) {
    const { instruction, details, id } = JSON.parse(data);
    const wsSocket = new WSSocket(socket);
    this.emit(instruction, wsSocket, details, id);
  }
  start() {
    return this.createWSServer();
  }
}

module.exports.Server = Server;
