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
  return l.toString().split('');
}

// This whole thing is a bloody wreck...
function hasTwoSame(l) {
  return l.some((v, k) => {
    if ((k == l.length - 2 && v == l[k + 1] && v != l[k - 1])) {
      return true;
    } else if (k == 0 && v == l[k+1] && v!=l[k+2]) {
      return true;
    } else if (k < l.length - 2 && v == l[k+1] && v != l[k-1] && v != l[k+2]) {
      return true;
    } else {
      return false;
    }
  })
}

function allAscendingEqual(l) {
  return l.every((v, k) => {
    return (k == l.length - 1 || v <= l[k+1]);
  });
}
const parseInt10 = fp.parseInt(10);
function dumbSolution(range) {
  return fp.flow(
    () => _.range(parseInt10(range[0]), parseInt10(range[1]) + 1),
    fp.map(it => convertToArray(it)),
    fp.filter(allAscendingEqual),
    fp.filter(hasTwoSame),
    (l) => l.length
  )();
}

function logStringy(v) {
  console.log(
    JSON.stringify(
      v
    )
  )
}

console.log(dumbSolution('357253-892942'.split('-')));