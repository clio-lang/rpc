const { EventEmitter } = require("./common");

class Dispatcher extends EventEmitter {
  constructor() {
    super();
    this.workers = new Map();
    this.sockets = new Map();
    this.jobs = new Map();
    this.connectedWorkers = [];
    this.transports = [];
  }
  addTransport(transport) {
    this.transports.push(transport);
    transport.on("call", (...args) => this.call(...args));
    transport.on("registerWorker", (...args) => this.registerWorker(...args));
    transport.start();
  }
  call(socket, { path, args }, id) {
    const worker = this.getWorker(path);
    if (worker) {
      this.sockets.set(id, socket);
      this.send(worker, { instruction: "call", details: { path, args } }, id);
    } else {
      this.addJob(socket, { path, args }, id);
    }
  }
  registerWorker(worker, { paths }, id) {
    for (const path of paths)
      this.workers.set(path, [...(this.workers.get(path) || []), worker]);
    worker.on("message", (data) => this.handleWorkerResponse(data));
    for (const path of paths) {
      const jobs = this.jobs.get(path) || [];
      this.jobs.set(path, []);
      for (const job of jobs) this.call(...job);
    }
    this.connectedWorkers.push(worker);
    const listeners = this.listeners.workerConnected || [];
    listeners.forEach((fn) => fn.call(this, worker));
  }
  addJob(socket, { path, args }, id) {
    this.jobs.set(path, [
      ...(this.jobs.get(path) || []),
      [socket, { path, args }, id],
    ]);
  }
  handleWorkerResponse(data) {
    const { instruction, details, id } = data;
    const socket = this.sockets.get(id);
    this.send(socket, { instruction, details }, id);
  }
  getWorker(path) {
    const workers = this.workers.get(path);
    if (!workers) return;
    const { length } = workers;
    const index = Math.floor(Math.random() * length);
    return workers[index];
  }
  send(socket, data, id) {
    socket.send({ ...data, id });
  }
  expectWorkers(n) {
    return new Promise((resolve) => {
      if (this.connectedWorkers.length >= n) resolve();
      const waitForN = () => {
        const { length } = this.connectedWorkers;
        if (length >= n) {
          this.off("workerConnected", waitForN);
          resolve();
        }
      };
      this.on("workerConnected", waitForN);
    });
  }
}

module.exports.Dispatcher = Dispatcher;
