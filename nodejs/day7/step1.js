const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');
const ReadWrite = require('./readwrite');
const parseInt10 = fp.parseInt(10);

let rwLock = new ReadWrite(10);
function setNextInput(fromNode, value) {
  rwLock.write(fromNode, value);
}

function getNextInput(fromNode) {
  return rwLock.read(fromNode);
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
async function handleOp(list, opPos, outNode, inNode) {
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
      res = await getNextInput(inNode).then(i => {
        return i;
      });
      newList = fp.set(list[opPos+1], res, list);
      newOpPos += 2;
      break;
    case 4:
      setNextInput(outNode, v1);
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

async function calcAll(list, outNode, inNode) {
  let curPos = 0;
  let finalList = list;
  while(curPos != -1 || curPos >= finalList.length) {
    [finalList, curPos] = await handleOp(finalList, curPos, outNode, inNode);
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

function convertToArray(l) {
  let arr = l.toString().split('').map(Number);
  (arr.length == 4) ? arr.unshift(0) : null;
  return arr;
}
function getPhaseLists() {
  return fp.flow(
    (range) => _.range(parseInt10(range[0]), parseInt10(range[1])),
    fp.map(it => convertToArray(it)),
    fp.filter(it => it.every(i => i < 5)),
    fp.filter((l) => _.isEqual(_.uniq(l), l))
  )([1234, 43210]);
}

function getFeedBackLists() {
  return fp.flow(
    (range) => _.range(parseInt10(range[0]), parseInt10(range[1])),
    fp.map(it => convertToArray(it)),
    fp.filter(it => it.every(i => i >= 5)),
    fp.filter((l) => _.isEqual(_.uniq(l), l))
  )([56789, 98765]);
}

function init() {
  // const program = [3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,
  //   1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0];
  const program = contents;
  // const phaseSettings = getPhaseLists();
  const phaseSettings = getFeedBackLists();
  const inNodes = [4,0,1,2,3]
  phaseSettings.reduce(async (prom, phase) => {
    let prevRes = await prom;
    rwLock.clear();
    phase.forEach((i, ind) => rwLock.write(ind, i));
    rwLock.write(4, 0);
    let nextRes = await Promise.all(_.range(0, 5).map((v) => {
      return calcAll(fp.clone(program), v, inNodes[v]);
    })).then(async () => {
      return await rwLock.read(4);
    });
    if (nextRes > prevRes.val) {
      return {
        p: phase,
        val: nextRes
      }
    } else {
      return prevRes;
    }
  }, Promise.resolve({p: null, val: -1})).then((u) => {
    console.log(JSON.stringify(u));
  })
  
}

init();