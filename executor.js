const { randomId } = require("./common");

class Executor {
  constructor(transport) {
    this.transport = transport;
    this.connect();
    this.promises = new Map();
  }
  connect() {
    this.transport.on("message", data => this.handleData(data));
    this.transport.connect();
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
    this.transport.send({
      instruction: "call",
      details: { path, args },
      id
    });
    return promise;
  }
}

module.exports.Executor = Executor;
