const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');

/*
  Secure Container (get password)
  * 6 dig
  * within input range
  * at least two adjacent are same
  * digits never decrease
  Calculate how many in passwords match rule
*/

function convertToArray(l) {
  return _.map(l.toString().split(''), fp.parseInt(10))
}

function calcTrueRange(range) {
  if (range[0] > range[1]) return [-1,-1];
  return _.flow(
    () => range,
    (a) => _.map(a, convertToArray),
    (b) => _.map(b, (list) => {
      let finalL = list;
      for (let ind = finalL.length - 2; ind >= 0; ind --) {
        if (finalL[ind] > finalL[ind+1]) {
          finalL[ind] -= 1;
          finalL[ind+1] = 9;
          ind = finalL.length - 2; // This obviously scales horribly..."cross that bridge"
        }
      }
      return finalL;
    })
  )();
}

function logStringy(v) {
  console.log(
    JSON.stringify(
      v
    )
  )
}

logStringy(calcTrueRange('357253-892942'.split('-')))