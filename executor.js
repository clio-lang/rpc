const { randomId } = require("./common");

class Executor {
  constructor(transport) {
    this.transport = transport;
    this.isConnected = false;
    this.connect();
    this.promises = new Map();
  }
  connect() {
    this.transport.on("message", data => this.handleData(data));
    this.transport.on("connect", () => this.onConnect());
    this.transport.connect();
  }
  onConnect() {
    this.isConnected = true;
  }
  handleData(data) {
    const { id, details, instruction } = data;
    if (instruction == "result") {
      const { result } = details;
      return this.promises.get(id).resolve(result);
    }
  }
  call(path, args) {
    const id = randomId(32);
    const promise = new Promise(resolve => {
      this.promises.set(id, { resolve });
    });
    const send = () =>
      this.transport.send({
        instruction: "call",
        details: { path, args },
        id
      });
    if (this.isConnected) send();
    else this.transport.on("connect", send);
    return promise;
  }
}

module.exports.Executor = Executor;
