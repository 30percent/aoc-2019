const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');

/*
  INTCODE: (...list: number)
  0. opcode (1,2,99)
    * 1 - (i+1 pos1, i+2 pos2, i+3 pos3) - pos3 = pos1 + pos2
    * 2 - as above except - pos3 = pos1 * pos 2
    * 99 - halt program
  1. Positions are 0 indexed
  2. Opcodes are every 4 (until 99 reached)
*/

function fetchAtPos(list, opPos, n) {
  return parseInt(list[list[opPos + n]]);
}

function handleOp(list, opPos) {
  let opCode = parseInt(list[opPos]);
  let v1 = fetchAtPos(list, opPos, 1);
  let v2 = fetchAtPos(list, opPos, 2);
  let res;
  switch(opCode) {
    case 1:
      res = _.sum([v1, v2]);
      break;
    case 2:
      res = _.multiply(v1, v2);
      break;
    case 99:
      return list;
    default:
      throw "UNKNOWN OPCODE";
  }
  return fp.set(list[opPos+3], res, list);
}

function strToNum(list) {
  return _.map(list, (l) => _.isString(l) ? parseInt(l) : l);
}

function calcAll(list) {
  let curPos = 0;
  let finalList = list;
  while(true) {
    if (finalList[curPos] == '99' || finalList[curPos] == 99) break;
    finalList = handleOp(finalList, curPos);
    curPos += 4;
  }
  return finalList;
}

function findNVResult(list, result) {
  let safeList = fp.cloneDeep(list);
  let n = 0;
  let v = 0;
  while(safeList[0] != result) {
    safeList = fp.cloneDeep(list);
    safeList[1] = n;
    safeList[2] = v;
    safeList = calcAll(safeList);
    if (n == 99 && v == 99 && safeList[0] != result) { throw "No valid input found"; }
    else if (n >= 99) { 
      n = 0; 
      v++;
    }
    else { 
      n++;
    }
  }
  return safeList;
}

var contents =  strToNum(fs.readFileSync(`${__dirname}/input.txt`, 'utf8').split(','));
const result = findNVResult(contents, 19690720);
console.log(100 * result[1] + result[2]);
// console.log(calcAll(contents));