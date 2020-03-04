const { WebWorkerSocket } = require("./socket");

class WrappedWebWorker {
  constructor(worker) {
    this.worker = worker;
    this.listeners = {};
    this.worker.onmessage = message => this.emit("message", message);
  }
  postMessage(message) {
    this.worker.postMessage(message);
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

class inSocket {
  constructor(socket) {
    this.socket = socket;
  }
  send(data) {
    this.socket.emit("message", data);
  }
}

class Socket {
  constructor(server) {
    this.server = server;
    this.inSocket = new inSocket(this);
    this.listeners = {};
  }
  connect() {
    this.emit("connect");
  }
  send(data) {
    this.server.handleIncoming(this.inSocket, data);
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

class Server {
  constructor() {
    this.workers = [];
    this.listeners = {};
    this.messageIds = new Map();
  }
  start() {}
  addWorker(worker) {
    const wrappedWorker = new WrappedWebWorker(worker);
    const socket = new WebWorkerSocket(wrappedWorker);
    this.workers.push(wrappedWorker);
    wrappedWorker.on("message", event => {
      const { data } = event;
      this.handleIncoming(socket, data);
    });
  }
  getTransport() {
    return new Socket(this);
  }
  handleIncoming(socket, data) {
    const { instruction, details, id } = data;
    this.emit(instruction, socket, details, id);
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
