import math from "mathjs";
// import { TwoPhaseSimplex } from "./src/2PS";
import TwoPhaseSimplex from "./src/TwoPhaseSimplex";
import Bnb from "./src/BranchAndBound";

// const vars = 2;
// const beq1 = "-2*x1 +1*x2 <= 3";
// const eq1 = beq1.split(" ");
// const beq2 = "1*x1 +1*x2 <= 6";
// const eq2 = beq2.split(" ");
// const beq3 = "5*x1 +2*x2 <= 20";
// const eq3 = beq3.split(" ");

// const z = ["1*x1", "1*x2"];
// const bz = "1*x1 +1*x2";

const bz = "+1*x1 +1*x2";
const z = bz.split(" ");

const beq1 = "1*x1 +1*x2 <= 4.3";
const eq1 = beq1.split(" ");

const beq2 = "2*x1 +2*x2 <= 20.6";
const eq2 = beq2.split(" ");

const beq3 = "3*x1 +2*x2 >= 6";
const eq3 = beq3.split(" ");

const vars = 2;
const eq = [eq1, eq2];
const beq = [beq1, beq2];
// let t = new TwoPhaseSimplex(z, bz, eq, beq, vars);
// t.initMatrix();
// let ans = t.run();
// console.log(ans);

// let result = [2.666, 3.333];
let b = new Bnb(z, bz, eq, beq, vars);
b.bnb();
