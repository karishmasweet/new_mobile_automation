"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RingBuffer = exports.JSON_SPACES = void 0;
exports.errAndQuit = errAndQuit;
exports.log = log;
exports.spinWith = spinWith;

require("source-map-support/register");

var _ora = _interopRequireDefault(require("ora"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const JSON_SPACES = 4;
exports.JSON_SPACES = JSON_SPACES;

function errAndQuit(json, msg) {
  if (json) {
    console.log(JSON.stringify({
      error: `${msg}`
    }, null, JSON_SPACES));
  } else {
    console.error(`${msg}`.red);

    if (msg.stderr) {
      console.error(`${msg.stderr}`.red);
    }
  }

  process.exit(1);
}

function log(json, msg) {
  !json && console.log(msg);
}

async function spinWith(json, msg, fn) {
  if (json) {
    return await fn();
  }

  const spinner = (0, _ora.default)(msg).start();
  let res;

  try {
    res = await fn();
    spinner.succeed();
    return res;
  } catch (err) {
    spinner.fail();
    throw err;
  }
}

class RingBuffer {
  constructor(size = 50) {
    this.size = size;
    this.buffer = [];
  }

  getBuff() {
    return this.buffer;
  }

  dequeue() {
    this.buffer.shift();
  }

  enqueue(item) {
    if (this.buffer.length >= this.size) {
      this.dequeue();
    }

    this.buffer.push(item);
  }

}

exports.RingBuffer = RingBuffer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJKU09OX1NQQUNFUyIsImVyckFuZFF1aXQiLCJqc29uIiwibXNnIiwiY29uc29sZSIsImxvZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJlcnJvciIsInJlZCIsInN0ZGVyciIsInByb2Nlc3MiLCJleGl0Iiwic3BpbldpdGgiLCJmbiIsInNwaW5uZXIiLCJvcmEiLCJzdGFydCIsInJlcyIsInN1Y2NlZWQiLCJlcnIiLCJmYWlsIiwiUmluZ0J1ZmZlciIsImNvbnN0cnVjdG9yIiwic2l6ZSIsImJ1ZmZlciIsImdldEJ1ZmYiLCJkZXF1ZXVlIiwic2hpZnQiLCJlbnF1ZXVlIiwiaXRlbSIsImxlbmd0aCIsInB1c2giXSwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvY2xpL3V0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IG9yYSBmcm9tICdvcmEnO1xuXG5jb25zdCBKU09OX1NQQUNFUyA9IDQ7XG5cbi8qKipcbiAqIExvZyBhbiBlcnJvciB0byB0aGUgY29uc29sZSBhbmQgZXhpdCB0aGUgcHJvY2Vzcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0ganNvbiAtIHdoZXRoZXIgd2Ugc2hvdWxkIGxvZyBqc29uIG9yIHRleHRcbiAqIEBwYXJhbSB7YW55fSBtc2cgLSBlcnJvciBtZXNzYWdlLCBvYmplY3QsIEVycm9yIGluc3RhbmNlLCBldGMuXG4gKi9cbmZ1bmN0aW9uIGVyckFuZFF1aXQoanNvbiwgbXNnKSB7XG4gIGlmIChqc29uKSB7XG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoe2Vycm9yOiBgJHttc2d9YH0sIG51bGwsIEpTT05fU1BBQ0VTKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcihgJHttc2d9YC5yZWQpO1xuICAgIGlmIChtc2cuc3RkZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGAke21zZy5zdGRlcnJ9YC5yZWQpO1xuICAgIH1cbiAgfVxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKlxuICogQ29uZGl0aW9uYWxseSBsb2cgc29tZXRoaW5nIHRvIHRoZSBjb25zb2xlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGpzb24gLSB3aGV0aGVyIHdlIGFyZSBpbiBqc29uIG1vZGUgKGFuZCBzaG91bGQgdGhlcmVmb3JlIG5vdCBsb2cpXG4gKiBAcGFyYW0ge3N0cmluZ30gbXNnIC0gc3RyaW5nIHRvIGxvZ1xuICovXG5mdW5jdGlvbiBsb2coanNvbiwgbXNnKSB7XG4gICFqc29uICYmIGNvbnNvbGUubG9nKG1zZyk7XG59XG5cbi8qKlxuICogU3RhcnQgYSBzcGlubmVyLCBleGVjdXRlIGFuIGFzeW5jIGZ1bmN0aW9uLCBhbmQgdGhlbiBzdG9wIHRoZSBzcGlubmVyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGpzb24gLSB3aGV0aGVyIHdlIGFyZSBpbiBqc29uIG1vZGUgKGFuZCBzaG91bGQgdGhlcmVmb3JlIG5vdCBsb2cpXG4gKiBAcGFyYW0ge3N0cmluZ30gbXNnIC0gc3RyaW5nIHRvIGxvZ1xuICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gLSBmdW5jdGlvbiB0byB3cmFwIHdpdGggc3Bpbm5pbmdcbiAqL1xuYXN5bmMgZnVuY3Rpb24gc3BpbldpdGgoanNvbiwgbXNnLCBmbikge1xuICBpZiAoanNvbikge1xuICAgIHJldHVybiBhd2FpdCBmbigpO1xuICB9XG4gIGNvbnN0IHNwaW5uZXIgPSBvcmEobXNnKS5zdGFydCgpO1xuICBsZXQgcmVzO1xuICB0cnkge1xuICAgIHJlcyA9IGF3YWl0IGZuKCk7XG4gICAgc3Bpbm5lci5zdWNjZWVkKCk7XG4gICAgcmV0dXJuIHJlcztcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgc3Bpbm5lci5mYWlsKCk7XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG5cbmNsYXNzIFJpbmdCdWZmZXIge1xuICBjb25zdHJ1Y3RvcihzaXplID0gNTApIHtcbiAgICB0aGlzLnNpemUgPSBzaXplO1xuICAgIHRoaXMuYnVmZmVyID0gW107XG4gIH1cbiAgZ2V0QnVmZigpIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXI7XG4gIH1cbiAgZGVxdWV1ZSgpIHtcbiAgICB0aGlzLmJ1ZmZlci5zaGlmdCgpO1xuICB9XG4gIGVucXVldWUoaXRlbSkge1xuICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPj0gdGhpcy5zaXplKSB7XG4gICAgICB0aGlzLmRlcXVldWUoKTtcbiAgICB9XG4gICAgdGhpcy5idWZmZXIucHVzaChpdGVtKTtcbiAgfVxufVxuXG5leHBvcnQge2VyckFuZFF1aXQsIGxvZywgc3BpbldpdGgsIEpTT05fU1BBQ0VTLCBSaW5nQnVmZmVyfTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBRUE7Ozs7QUFFQSxNQUFNQSxXQUFXLEdBQUcsQ0FBcEI7OztBQU9BLFNBQVNDLFVBQVQsQ0FBb0JDLElBQXBCLEVBQTBCQyxHQUExQixFQUErQjtFQUM3QixJQUFJRCxJQUFKLEVBQVU7SUFDUkUsT0FBTyxDQUFDQyxHQUFSLENBQVlDLElBQUksQ0FBQ0MsU0FBTCxDQUFlO01BQUNDLEtBQUssRUFBRyxHQUFFTCxHQUFJO0lBQWYsQ0FBZixFQUFrQyxJQUFsQyxFQUF3Q0gsV0FBeEMsQ0FBWjtFQUNELENBRkQsTUFFTztJQUNMSSxPQUFPLENBQUNJLEtBQVIsQ0FBZSxHQUFFTCxHQUFJLEVBQVAsQ0FBU00sR0FBdkI7O0lBQ0EsSUFBSU4sR0FBRyxDQUFDTyxNQUFSLEVBQWdCO01BQ2ROLE9BQU8sQ0FBQ0ksS0FBUixDQUFlLEdBQUVMLEdBQUcsQ0FBQ08sTUFBTyxFQUFkLENBQWdCRCxHQUE5QjtJQUNEO0VBQ0Y7O0VBQ0RFLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLENBQWI7QUFDRDs7QUFPRCxTQUFTUCxHQUFULENBQWFILElBQWIsRUFBbUJDLEdBQW5CLEVBQXdCO0VBQ3RCLENBQUNELElBQUQsSUFBU0UsT0FBTyxDQUFDQyxHQUFSLENBQVlGLEdBQVosQ0FBVDtBQUNEOztBQVFELGVBQWVVLFFBQWYsQ0FBd0JYLElBQXhCLEVBQThCQyxHQUE5QixFQUFtQ1csRUFBbkMsRUFBdUM7RUFDckMsSUFBSVosSUFBSixFQUFVO0lBQ1IsT0FBTyxNQUFNWSxFQUFFLEVBQWY7RUFDRDs7RUFDRCxNQUFNQyxPQUFPLEdBQUcsSUFBQUMsWUFBQSxFQUFJYixHQUFKLEVBQVNjLEtBQVQsRUFBaEI7RUFDQSxJQUFJQyxHQUFKOztFQUNBLElBQUk7SUFDRkEsR0FBRyxHQUFHLE1BQU1KLEVBQUUsRUFBZDtJQUNBQyxPQUFPLENBQUNJLE9BQVI7SUFDQSxPQUFPRCxHQUFQO0VBQ0QsQ0FKRCxDQUlFLE9BQU9FLEdBQVAsRUFBWTtJQUNaTCxPQUFPLENBQUNNLElBQVI7SUFDQSxNQUFNRCxHQUFOO0VBQ0Q7QUFDRjs7QUFFRCxNQUFNRSxVQUFOLENBQWlCO0VBQ2ZDLFdBQVcsQ0FBQ0MsSUFBSSxHQUFHLEVBQVIsRUFBWTtJQUNyQixLQUFLQSxJQUFMLEdBQVlBLElBQVo7SUFDQSxLQUFLQyxNQUFMLEdBQWMsRUFBZDtFQUNEOztFQUNEQyxPQUFPLEdBQUc7SUFDUixPQUFPLEtBQUtELE1BQVo7RUFDRDs7RUFDREUsT0FBTyxHQUFHO0lBQ1IsS0FBS0YsTUFBTCxDQUFZRyxLQUFaO0VBQ0Q7O0VBQ0RDLE9BQU8sQ0FBQ0MsSUFBRCxFQUFPO0lBQ1osSUFBSSxLQUFLTCxNQUFMLENBQVlNLE1BQVosSUFBc0IsS0FBS1AsSUFBL0IsRUFBcUM7TUFDbkMsS0FBS0csT0FBTDtJQUNEOztJQUNELEtBQUtGLE1BQUwsQ0FBWU8sSUFBWixDQUFpQkYsSUFBakI7RUFDRDs7QUFoQmMifQ==