import math from "mathjs";
// import { TwoPhaseSimplex } from "./src/2PS";
import TwoPhaseSimplex from "./src/TwoPhaseSimplex";

const z = ["1*x1", "2*x2"];
const vars = 2;

const eq1 = ["-2*x1", "1*x2", "<=", "3"];
const eq2 = ["1*x1", "1*x2", "<=", "6"];
const eq3 = ["5*x1", "2*x2", "<=", "20"];

const eq = [eq1, eq2, eq3];

let t = new TwoPhaseSimplex(z, eq, vars);
t.initMatrix();
t.phaseOne();

// let t = new TwoPhaseSimplex();
// t.createMatrix(eq);
// t.createSurpusAndAvColumn(eq);
// t.addAnsColumn(eq);
// t.setVarRow(eq);
// t.createZRow();
// t.getPivot();
// t.pivotOperations();
// t.updatePhase1VarRow(eq);
// t.phase2();
