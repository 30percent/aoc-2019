const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');
const { logStringy } = require('../utils');
var contents =  fs.readFileSync(`${__dirname}/input.txt`, 'utf8').split('\n');

var sample = [
  'COM)B',
  'B)C',
  'C)D',
  'D)E',
  'E)F',
  'B)G',
  'G)H',
  'D)I',
  'E)J',
  'J)K',
  'K)L'
  ]
var simple = [
  'COM)B',
  'B)C',
  'B)G',
  'C)D',
  'C)H',
  'D)F'
]
var pathSimple = [
  'COM)B',
  'B)C',
  'C)D',
  'D)E',
  'E)F',
  'B)G',
  'G)H',
  'D)I',
  'E)J',
  'J)K',
  'K)L',
  'K)YOU',
  'I)SAN'
]
// COM (0) => B(1) => C(2) => D(3) => F(4)
//                         => H(3)
//                 => G(2)
function createOrbits(orbitStrs) {
  return _.flow(
    fp.map(input => input.split(')')),
    fp.reduce((orbits, input) => {
      let [tee, ter] = input;
      if (fp.has(tee, orbits)) {
        orbits[tee].push(ter);
      } else {
        orbits[tee] = [ter];
      }
      if (!fp.has(ter, orbits)) orbits[ter] = [];
      return orbits;
    }, {})
  )(orbitStrs)
}

//logStringy(getAncestors(createOrbits(simple), 'G')); => [B, COM] (order matters)
function getAncestors(orbits, dest) {
  return getAncestorsTo(orbits, dest, 'COM');
}

function getAncestorsTo(orbits, dest, anc) {
  let next = dest;
  let ancestors = [];
  while (next != anc) {
    next = _.findKey(orbits, (moons) => moons.indexOf(next) >= 0);
    ancestors.push(next);
  }
  return ancestors;
}
// logStringy(closestAncestor(createOrbits(simple), 'F', 'G')); => "B"
function closestAncestor(orbits, current, dest) {
  let curAnc = getAncestors(orbits, current);
  let destAnc = getAncestors(orbits, dest);
  return destAnc.filter((anc) => curAnc.indexOf(anc) >= 0)[0];
}

function getOrbitTrans(orbits, start, dest) {
  let middleP = closestAncestor(orbits, start, dest);
  let midToStart = getAncestorsTo(orbits, start, middleP).slice(0, -1);
  let midToEnd = getAncestorsTo(orbits, dest, middleP).reverse().slice(1);
  return midToStart.concat(midToEnd);
}
// logStringy(getPathLength(createOrbits(simple), 'F', 'H')); => 2
// logStringy(getOrbitTransLength(createOrbits(pathSimple), 'YOU', 'SAN')); => 4
function getOrbitTransLength(orbits, start, dest) {
  return getOrbitTrans(orbits, start, dest).length;
}
logStringy(getOrbitTransLength(createOrbits(contents), 'YOU', 'SAN'));