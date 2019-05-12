import math from "mathjs";
import { TwoPhaseSimplex } from "./src/2PS";

const eq1 = math.parse("2*x1 + 4*x2 <= 25");
const eq2 = math.parse("1*x1 + 0*x2 <= 8");
const eq3 = math.parse("0*x1 + 2*x2 <= 10");
const eq4 = math.parse("1*x1 + 0*x2 >= 3");

const eq = [eq1, eq2, eq3, eq4];

let t = new TwoPhaseSimplex();
t.createMatrix(eq);
t.createSurpusAndAvColumn(eq);
t.addAnsColumn(eq);
t.setVarRow(eq);
t.createZRow();
t.getPivot();
t.pivotOperations();
t.updatePhase1VarRow(eq);
t.phase2();
console.log(t.pivotIndex);
