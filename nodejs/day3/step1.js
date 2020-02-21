const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');

/*
  Find the intesection of two wires nearest entry point (entry point does not count).
  Wires paths are detailed as Direction + Amount (R5 = Right 5 squares)
*/

// Record path as (y: [x])

function setIntersection(set, otherSet) 
{ 
    var intersectionSet = new Set(); 
    for(var elem of otherSet) 
    { 
        if(set.has(elem)) 
            intersectionSet.add(elem); 
    } 
  return intersectionSet;
} 
 
function addPathCoords(activeCoords, start, finish) {
  if (start[0] == finish[0]) {
    _.range(start[1], finish[1]).map((v) => {
      activeCoords.add(`${finish[0]}_${v}`);
    });
  } else {
    _.range(start[0], finish[0]).map((v) => {
      activeCoords.add(`${v}_${finish[1]}`);
    });
  }
  // activeCoords.add(`${finish[0]}_${finish[1]}`)
  return activeCoords;
}

function recordPathCoords(path) {
  let allCoords = new Set();
  let currentLoc = [0,0];
  path.forEach((segment) => {
    let finalLoc;
    let [dir, len] = [segment.substring(0, 1), parseInt(segment.substring(1))];
    switch(dir) {
      case 'R':
        finalLoc = fp.set('1', currentLoc[1] + len, currentLoc);
        break;
      case 'L':
        finalLoc = fp.set('1', currentLoc[1] - len, currentLoc);
        break;
      case 'U':
        finalLoc = fp.set('0', currentLoc[0] - len, currentLoc);
        break;
      case 'D':
        finalLoc = fp.set('0', currentLoc[0] + len, currentLoc);
        break;
      default:
        throw `Unknown direction: ${dir}`;
    }
    allCoords = addPathCoords(allCoords, currentLoc, finalLoc);
    currentLoc = finalLoc;
  })
  allCoords.delete('0_0');
  return allCoords;
}

function getLowestManhattan(setCoords) {
  let smallest = [null, 10000];
  for (coord of setCoords.values()) {
    let t = fp.map(Math.abs, fp.map(
      _.parseInt, coord.split('_')))
    let nextManhat = _.sum(t);
    smallest = (smallest[1] > nextManhat) ? [coord, nextManhat] : smallest
  }
  return smallest[0];
}
var contents =  fs.readFileSync(`${__dirname}/input.txt`, 'utf8').split('\n');
let ressie = contents.map(set => recordPathCoords(set.split(',')));
let intersections = ressie.reduce((f, s) => setIntersection(f, s));
console.log(getLowestManhattan(intersections));