const { randomId } = require("./common");

class Worker {
  constructor(transport) {
    this.transport = transport;
    this.functions = new Map();
  }
  register({ path, fn }) {
    this.functions.set(path, fn);
  }
  getFn(path) {
    return this.functions.get(path);
  }
  connect() {
    this.transport.on("message", data => this.handleData(data));
    this.transport.on("connect", () => this.handleConnect());
    this.transport.connect();
  }
  handleConnect() {
    const id = randomId(32);
    const paths = [...this.functions.keys()];
    this.send({
      instruction: "registerWorker",
      details: { paths },
      id
    });
  }
  handleData(data) {
    const { instruction, details, id } = data;
    if (instruction == "call") this.handleCallInstruction(details, id);
  }
  async handleCallInstruction(details, id) {
    const { path, args } = details;
    const fn = this.getFn(path);
    const result = await fn(...args);
    this.sendResult(result, id);
  }
  sendResult(result, id) {
    const data = { instruction: "result", details: { result } };
    this.send(data, id);
  }
  send(data, id) {
    this.transport.send({ ...data, id });
  }
}

module.exports.Worker = Worker;
