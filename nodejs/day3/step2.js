const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');

/*
  Find the intesection of two wires nearest entry point (entry point does not count).
  Wires paths are detailed as Direction + Amount (R5 = Right 5 squares)
*/

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

function mapKeyIntersection (map, otherMap) {
  var intersectionSet = new Map(); 
  for(var elem of otherMap) 
  { 
      if(map.has(elem[0])) 
          intersectionSet.set(elem[0], elem[1]); 
  } 
  return intersectionSet;
}

function calcIntersectionCost (map1, map2) {
  var intersectionMap = new Map();
  for(var elem of map2) 
  { 
      if(map1.has(elem[0])) 
        intersectionMap.set(elem[0], elem[1] + map1.get(elem[0])); 
  } 
  return intersectionMap;
}

function addPathCoordsCost(activeCoords, start, finish, curSteps) {
  if (start[0] == finish[0]) {
    _.range(start[1], finish[1]).map((v) => {
      activeCoords.set(`${finish[0]}_${v}`, Math.abs(v - start[1]) + curSteps);
    });
  } else {
    _.range(start[0], finish[0]).map((v) => {
      activeCoords.set(`${v}_${finish[1]}`, Math.abs(v -start[0]) + curSteps);
    });
  }
  return activeCoords;
}
function getDistance(startLoc, endLoc) {
  return Math.abs(startLoc[0] - endLoc[0]) + Math.abs(startLoc[1] - endLoc[1]);
}

function recordPathCoords(path) {
  let allCoords = new Map();
  let currentLoc = [0,0];
  let stepsSoFar = 0;
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
    allCoords = addPathCoordsCost(allCoords, currentLoc, finalLoc, stepsSoFar);
    stepsSoFar += getDistance(currentLoc, finalLoc);
    currentLoc = finalLoc;
  })
  allCoords.delete('0_0');
  return allCoords;
}

function getLowestManhattan(setCoords) {
  let smallest = [null, 10000];
  for (coord of setCoords.keys()) {
    let t = fp.map(Math.abs, fp.map(
      _.parseInt, coord.split('_').slice(0,2)))
    let nextManhat = _.sum(t);
    smallest = (smallest[1] > nextManhat) ? [coord, nextManhat] : smallest
  }
  return smallest[0];
}

function getLowestTotalStep(mapCoords) {
  let smallest = [null, 100000];
  for (coord of mapCoords) {
    smallest = (coord[1] < smallest[1]) ? [coord[0], coord[1]] : smallest;
  }
  return smallest;
}
var contents =  fs.readFileSync(`${__dirname}/input.txt`, 'utf8').split('\n');
let ressie = contents.map(set => recordPathCoords(set.split(',')));
var costedIntersection = ressie.reduce((inter, next) => calcIntersectionCost(inter,next));
console.log(getLowestManhattan(costedIntersection));
console.log(getLowestTotalStep(costedIntersection));