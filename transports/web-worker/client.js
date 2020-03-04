class Client {
  constructor({ postMessage }) {
    this.postMessage = postMessage;
    this.listeners = {};
  }
  connect() {
    this.emit("connect");
  }
  onmessage(event) {
    const { data } = event;
    this.emit("message", data);
  }
  send(data) {
    this.postMessage(data);
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
