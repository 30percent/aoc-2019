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

function calcAndString(list) {
  return JSON.stringify(calcAll(strToNum(list)))
}

var contents =  fs.readFileSync(`${__dirname}/input.txt`, 'utf8').split(',');
contents[1] = 12;
contents[2] = 2;
var testCase = [
  [1,9,10,3,2,3,11,0,99,30,40,50],
  [1,1,1,4,99,5,6,0,99],
  [2,4,4,5,99,0],
  contents
];
_.map(testCase, (c) => console.log(calcAndString(
  c
)));
// console.log(calcAll(contents));