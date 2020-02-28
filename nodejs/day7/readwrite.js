const { promisify } = require('util');
const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');

function defer() {
  var deferred = {
    promise: null,
    resolve: null,
    reject: null
  };

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  })
  return deferred;
}

class ProdCon {
  //promiseQueues
  constructor(nodeCount) {
    this.promiseQueues = _.range(0, nodeCount).map((i) => {
      return {
        readerQ: [],
        writerQ: []
      };
    });
    this.count = nodeCount;
  }

  clear() {
    this.promiseQueues = _.range(0, this.count).map((i) => {
      return {
        readerQ: [],
        writerQ: []
      };
    });
  }

  write(fromNode, value) {
    let nodeQueue = this.promiseQueues[fromNode];
    if (nodeQueue.readerQ.length > 0) {
      nodeQueue.readerQ.shift().resolve(value);
    } else {
      nodeQueue.writerQ.push(value);
    }
  }

  async read(fromNode) {
    let nodeQueue = this.promiseQueues[fromNode];
    if (nodeQueue.writerQ.length > 0) {
      return await nodeQueue.writerQ.shift();
    } else {
      let df = new defer();
      nodeQueue.readerQ.push(df);
      return await df.promise;
    }
  }
}

module.exports = ProdCon;