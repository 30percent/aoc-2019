const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');

// DAY 1 : ELF LAUNCH
// module launch : calcFuel(mass) => round(mass / 3) - 2
// totalFuel(modules) => sum ( map ( calcFuel modules) )
const calcFuel = (mass) => Math.floor(mass / 3) - 2;
const calcTotalFuel = (modules) => fp.reduce((acc, n) => acc + n, 0, fp.map(calcFuel, modules));

var contents = fs.readFileSync(`${__dirname}/input.txt`, 'utf8').split('\n');
console.log(calcTotalFuel(contents));