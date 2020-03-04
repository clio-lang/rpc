class WebWorkerSocket {
  constructor(worker) {
    this.worker = worker;
    this.listeners = {};
    this.messageIds = new Set();
    this.connect();
  }
  connect() {
    this.worker.on("message", data => this.handleWorkerMessage(data));
    this.emit("connect");
  }
  handleWorkerMessage(event) {
    const { data } = event;
    const { id } = data;
    if (this.messageIds.delete(id)) this.emit("message", data);
  }
  send(data) {
    const { id } = data;
    this.messageIds.add(id);
    this.worker.postMessage(data);
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

module.exports.WebWorkerSocket = WebWorkerSocket;
