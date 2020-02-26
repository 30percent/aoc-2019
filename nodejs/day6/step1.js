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
      return orbits;
    }, {})
  )(orbitStrs)
}

/**
 * 
 * @param {[tee: pString]: pString[]} orbits 
 */
function countDirectOrbits(orbits, current) {
  // let current = 'COM';
  let cost = 0;
  if (orbits[current] == null) {return 0;}
  let childCounts = fp.map(
    fp.curry(countDirectOrbits)(orbits), orbits[current]);
  return _.sum(childCounts) + orbits[current].length;
}

function countAllOrbits(orbits, current, cnt) {
  // let current = 'COM';
  if (orbits[current] == null) {return cnt;}
  let childCounts = fp.map((cur) => {
    return countAllOrbits(orbits, cur, cnt+1);
  }, orbits[current]);
  let final = _.sum(childCounts) + cnt;
  return final
}
// logStringy(createOrbits(sample));
logStringy(countAllOrbits(createOrbits(contents), 'COM', 0));