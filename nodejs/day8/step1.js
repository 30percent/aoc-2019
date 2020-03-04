const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');
const utils = require('../utils');
function getLayers(inpStr, w, h) {
  let list = inpStr.split('').map(Number);
  let layers = [];
  let layerSize = w * h;
  let i = 0;
  while (i < list.length) {
    layers.push(_.slice(list, i, i + layerSize));
    i += layerSize;
  }
  return layers;
}

function fewest0(layers) {
  return _.sortBy(layers, (l) => {
    return l.filter(it => it === 0).length;
  })[0]
}
function mul12(layer) {
  let oneCnt = layer.filter(i => i === 1).length;
  let twoCnt = layer.filter(i => i === 2).length;
  return oneCnt * twoCnt;
}

function pixOut(v) {
  return (v == 2) ? ' ' : (v == 1) ? '0' : '-';
}
function processLayers(layers, w, h) {
  return _.map(_.range(0, w*h), (ind) => {
    let str = pixOut(_.get(_.find(layers, (layer) => layer[ind] < 2), ind, 2));
    if (ind % w == w-1) str += '\n';
    return str;
  }).join('');
}
var contents =  fs.readFileSync(`${__dirname}/input.txt`, 'utf8');
utils.logStringy(mul12(fewest0(getLayers(contents, 25, 6)))); // Step 1
console.log(processLayers(getLayers(contents, 25, 6), 25, 6)); // Step 2