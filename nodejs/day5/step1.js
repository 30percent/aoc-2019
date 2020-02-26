const { promisify } = require('util');
const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');
let SAMPLEINPUTS = [1];
let SINPUTPTR = 0;

async function getNextInput() {
  SINPUTPTR += 1;
  return SAMPLEINPUTS[SINPUTPTR - 1];
}

/*
  INTCODE: (...list: number)
  0. opcode (1,2,99)
    * 1 - (i+1 pos1, i+2 pos2, i+3 pos3) - pos3 = pos1 + pos2
    * 2 - as above except - pos3 = pos1 * pos 2
    * 3 - accept input, set in i+1  pos
    * 4 - output i+1 pos value
    * 5 - 
    * 99 - halt program
  1. Positions are 0 indexed
  2. Opcodes are every 4 (until 99 reached)
*/

function fetchWithMode(list, pos, mode) {
  if (mode == '0') {
    return list[list[pos]];
  } else {
    return list[pos];
  }
}
async function handleOp(list, opPos) {
  let opStr = _.padStart(list[opPos].toString(), 5, '0');
  let opCode = parseInt(opStr.toString().substr(-2));
  let parameterModes = opStr.toString().substring(0, opStr.length - 2).split('').map(Number).reverse();
  let v1 = fetchWithMode(list, opPos+1, parameterModes[0]);
  let v2 = fetchWithMode(list, opPos+2, parameterModes[1]);
  // let v3 = fetchWithMode(list, opPos+2, _.get(parameterModes, 2));
  let res;
  let newList = list;
  let newOpPos = opPos;
  switch(opCode) {
    case 1:
      res = v1 + v2;
      newList = fp.set(list[opPos+3], res, list);
      newOpPos += 4;
      break;
    case 2:
      res = v1 * v2;
      // list[list[opPos+3]] = res;
      newList = fp.set(list[opPos+3], res, list);
      newOpPos += 4;
      break;
    case 3:
      res = await getNextInput();
      newList = fp.set(list[opPos+1], res, list);
      newOpPos += 2;
      break;
    case 4:
      console.log(v1);
      newOpPos += 2;
      break;
    case 5:
      newOpPos = (v1 !== 0) ? v2 : newOpPos + 3;
      break;
    case 6:
        newOpPos = (v1 === 0) ? v2 : newOpPos + 3;
      break;
    case 7:
      if (v1 < v2) {
        res = 1;
      } else {
        res = 0;
      }
      newList = fp.set(list[opPos+3], res, list);
      newOpPos += 4;
      break;
    case 8:
      if (v1 == v2) {
        res = 1;
      } else {
        res = 0;
      }
      newList = fp.set(list[opPos+3], res, list);
      newOpPos += 4;
      break;
    case 99:
      newOpPos = -1;
      break;
    default:
      throw `Unknown opcode ${opCode}`
  }
  return [newList, newOpPos];
}

async function calcAll(list) {
  let curPos = 0;
  let finalList = list;
  while(curPos != -1 || curPos >= finalList.length) {
    [finalList, curPos] = await handleOp(finalList, curPos);
    // curPos += 4;
  }
  return finalList;
}

function logStringy(v) {
  console.log(
    JSON.stringify(
      v
    )
  )
}

function strToNum(list) {
  return _.map(list, (l) => _.isString(l) ? parseInt(l) : l);
}
var contents =  strToNum(fs.readFileSync(`${__dirname}/input.txt`, 'utf8').split(',')).map(Number);
// const result = findNVResult(contents, 19690720);
// console.log(100 * result[1] + result[2]);
const testCases = [
  // [[3,0,4,0,99], [9]] // 9
  // ,[[1002,4,3,4,33], [0]] //0
  // ,[[1101,100,-1,4,0], [0]] //0
  // ,[[3,3,1101,3,-1,6,0], [100]]
  // [[3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9], [0]] // 1 if input 1, 0 if input 0
   [contents, [5]]
];
_.reduce(testCases, (prevP, curCase) => {
  return prevP.then(() => {
    SAMPLEINPUTS = curCase[1];
    SINPUTPTR = 0;
    return calcAll(curCase[0]).then((res) => {
      console.log(res);
    })
  });
}, Promise.resolve()).then(() => {
  process.exit();
}, (ER) => {
  console.error(ER);
  process.exit();
})