import math from "mathjs";

export default class TwoPhaseSimplex {
  // base Row and Column for matrix operations
  baseRowParams;
  baseRow;
  baseColumnParams;
  baseColumn;

  //   pivot
  pivot;
  leavingIndex;
  leavingParam;
  enteringIndex;
  enteringParam;

  // result of (sum of all i of Matrix) * i of baseColumn - baseRow
  zRow;
  stop = false;
  matrix;

  constructor(z, zEq, boundaries, boundariesEq, vars) {
    //   array of boudaries
    this.boundaries = boundaries;
    this.boundariesEq = boundariesEq;
    this.equation = z;
    this.zEq = zEq;
    this.vars = vars;
    this.matrix = [];
    this.baseRowParams = [];
    this.baseRow = [];
    this.baseColumnParams = [];
    this.baseColumn = [];
    this.zRow = [];
    this.firstPhase = true;
    this.secondPhase = false;
    this.unbounded = false;
    this.stop = false;
  }

  createEquationBase = () => {
    //   lets assume in main Equation all Variables in order
    for (let i = 0; i < this.equation.length; i++) {
      let [param] = this.equation[i].split("*");
      this.baseRow[i] = parseFloat(param);
    }

    // change base Column vals after changing helping Row
    let idx;
    // if phase one ends and A stays error handle
    // console.log(this.baseColumnParams);
    // console.log(this.baseRowParams);
    // console.log(this.baseRowParams.some(param => /^a/.test(param)));
    // console.log(this.baseColumnParams);
    if (this.baseRowParams.some(param => /^a/.test(param))) {
      this.secondPhase = false;
      console.log("after phase 1 a still in Row, phase-2 is not possbile");
      // console.log(this.baseRowParams);
      // console.log(this.zRow);
    } else {
      for (let i = 0; i < this.baseColumn.length; i++) {
        idx = this.baseRowParams.indexOf(this.baseColumnParams[i]);
        this.baseColumn[i] = this.baseRow[idx];
      }
      console.log("phase 2");
    }
  };
  initRow = bound => {
    let row = [];
    for (let i = 0; i < this.vars; i++) {
      let [param] = bound[i].split("*");
      row.push(parseFloat(param));
    }

    return row;
  };

  getAns = equation => {
    return parseInt(equation[equation.length - 1]);
  };

  getOperation = equation => {
    return equation[equation.length - 2];
  };

  addSurpusArtifitialAnsVars = () => {
    let row = [];
    let ai = 1;
    let apos = [];
    let operation = null;
    let si = 1;

    //   add S1, S2... variables to matrix based on <= / >=
    // add A1, A2... variables to matrix based if >=

    for (let i = 0; i < this.boundaries.length; i++) {
      operation = this.getOperation(this.boundaries[i]);
      if (operation === "<=") {
        row = math.zeros(this.boundaries.length, 1);
        row._data[i][0] = 1;
        row = [...row._data];

        // maybe change
        // add Sn to base
        this.baseColumnParams.push(`s${si}`);
        this.baseColumn.push(0);
      } else if (operation === ">=") {
        row = math.zeros(this.boundaries.length, 1);
        row._data[i][0] = -1;
        row = [...row._data];

        // maybe change
        // add An to base
        this.baseColumnParams.push(`a${ai}`);
        this.baseColumn.push(-1);
        ai += 1;
        apos.push(i);
      }
      // add Sn Vars to helping Row
      this.baseRow.push(0);
      this.baseRowParams.push(`s${si}`);
      si += 1;
      this.matrix = math.concat(this.matrix, row);
    }

    // console.log("surpus ", this.matrix);
    // add Artificial Vars to Helping Row
    for (let i = 0; i < apos.length; i++) {
      this.baseRow.push(-1);
      this.baseRowParams.push(`a${i + 1}`);
      row = math.zeros(this.boundaries.length, 1);
      row._data[apos[i - 0]][0] = 1;
      row = [...row._data];
      this.matrix = math.concat(this.matrix, row);
    }

    // add row of Bounds(anwers) to the start of Matrix
    let ans;
    let ansRow = [];
    for (let i = 0; i < this.boundaries.length; i++) {
      ans = this.getAns(this.boundaries[i]);
      ansRow.push([ans]);
    }

    this.matrix = math.concat(ansRow, this.matrix);

    if (ai === 1) {
      this.stop = true;
      console.log("Not Phase 1");
    }
    // debug
  };

  createZCRow = () => {
    this.zRow = [];
    let sum;
    let tmp;
    // console.log("create z Row");
    for (let i = 1; i < this.matrix[0].length; i++) {
      sum = 0;
      for (let j = 0; j < this.baseColumn.length; j++) {
        tmp = math.multiply(
          this.getColumn(this.matrix, i)[j],
          this.baseColumn[j]
        );
        sum += parseFloat(tmp);
      }
      this.zRow.push(sum);
    }
    this.zRow = math.subtract(this.zRow, this.baseRow);
    // console.log("here z row");
  };

  initMatrix = () => {
    // create matrix from boundary equations
    for (let i = 0; i < this.boundaries.length; i++) {
      this.matrix.push(this.initRow(this.boundaries[i]));
    }
    // console.log(this.matrix);
    // init Uknown variables and baseRow with 0 for them
    for (let i = 0; i < this.vars; i++) {
      let [, unknown] = this.boundaries[0][i].split("*");
      this.baseRowParams.push(unknown);
      this.baseRow.push(0);
    }

    this.addSurpusArtifitialAnsVars();
    this.createZCRow();
    console.log("here");
  };
  getColumn = (M, i) => {
    const matrix = math.matrix(M);
    return math
      .flatten(matrix.subset(math.index(math.range(0, matrix._size[0]), i)))
      .toArray();
  };
  getRow = (M, i) => {
    const matrix = math.matrix(M);
    return math
      .flatten(matrix.subset(math.index(i, math.range(0, matrix._size[1]))))
      .toArray();
  };

  selectPivot = () => {
    let zMinIndex = this.zRow.indexOf(Math.min(...this.zRow));
    let ansColumn = this.getColumn(this.matrix, 0);
    let minColumn = this.getColumn(this.matrix, zMinIndex + 1);
    // debug
    console.log("zMinIndex", zMinIndex);
    console.log("ansColumn", ansColumn);
    console.log("minColumn", minColumn);
    // check is Z row >= 0
    if (this.zRow[zMinIndex] >= 0) {
      this.stop = true;
      console.log("stop z row >=0 ");
    } else {
      let min = 1000000; //help var
      let tmp;
      for (let i = 0; i < minColumn.length; i++) {
        tmp = ansColumn[i] / minColumn[i];
        if (tmp < min && tmp > 0) {
          min = tmp;
          this.pivot = [zMinIndex + 1, i]; // [ColumnIndex, rowIndex]
        }
      }

      this.enteringIndex = zMinIndex;
      this.enteringParam = this.baseRowParams[this.enteringIndex];
      this.leavingIndex = this.pivot[1];
      this.leavingParam = this.baseColumnParams[this.leavingIndex];
      // console.log("leavingParam ", this.leavingParam);
      // console.log("enteringParam ", this.enteringParam);
      console.log(this.baseColumnParams);
      // debug
      // check that all entering column vals are not <= 0
      let enteringColumn = this.getColumn(
        this.matrix,
        this.enteringIndex + 1
      ).filter(val => val > 0);
      // console.log("enteringColumn ", enteringColumn);
      // console.log("index ", this.enteringIndex + 1);
      if (enteringColumn.length === 0) {
        this.unbounded = true;
        console.log("unbounded, entering columns vals <= 0");
        // console.log(this.getColumn(this.matrix, this.enteringIndex));
      }
    }
  };

  matrixOperations = () => {
    // console.log(this.matrix);
    // console.log(this.zRow);
    // console.log(this.baseColumnParams);
    // console.log(this.baseColumn);
    // console.log(this.baseRowParams);
    if (!this.stop) {
      let pivotRowIndex = this.pivot[1];
      let pivotColumnIndex = this.pivot[0];
      let pivotRow = this.getRow(this.matrix, pivotRowIndex);
      let pivotValue = pivotRow[pivotColumnIndex];
      let v, row, tmp;

      // make pivot value === 1
      for (let i = 0; i < this.matrix[0].length; i++) {
        this.matrix[pivotRowIndex][i] =
          this.matrix[pivotRowIndex][i] / pivotValue;
      }
      pivotRow = this.getRow(this.matrix, pivotRowIndex);

      // make other vars in pivor column 0
      for (let i = 0; i < this.matrix.length; i++) {
        if (i !== pivotRowIndex && this.matrix[i][pivotColumnIndex] !== 0) {
          row = this.getRow(this.matrix, i);
          v = row[pivotColumnIndex];
          tmp = math.multiply(pivotRow, v);
          for (let j = 0; j < this.matrix[0].length; j++) {
            this.matrix[i][j] -= tmp[j];
          }
        }
      }

      // removing A column if A leaving from base
      let slice, slice1, slice2;
      let matrixRowLen = this.matrix[0].length;
      if (/^a/.test(this.baseColumnParams[this.leavingIndex])) {
        // console.log("leav ", this.baseRowParams);
        let removingIndex = this.baseRowParams.indexOf(this.leavingParam);
        for (let i = 0; i < this.matrix.length; i++) {
          slice1 = this.matrix[i].slice(0, removingIndex + 1);
          slice2 = this.matrix[i].slice(removingIndex + 2, matrixRowLen);
          slice = [...slice1, ...slice2];
          this.matrix[i] = slice;
        }
        slice1 = this.baseRow.slice(0, removingIndex);
        slice2 = this.baseRow.slice(removingIndex + 1, this.baseRow.length + 1);

        slice = [...slice1, ...slice2];
        this.baseRow = [...slice];

        // console.log("Baserow", this.baseRowParams);
        // console.log(removingIndex);
        slice1 = this.baseRowParams.slice(0, removingIndex);
        slice2 = this.baseRowParams.slice(
          removingIndex + 1,
          this.baseRow.length + 1
        );
        // console.log("slice1 ", slice1);
        // console.log("slice2 ", slice2);

        slice = [...slice1, ...slice2];
        this.baseRowParams = [...slice];
      }

      // swap leaving with entering
      this.baseColumn[this.leavingIndex] = this.baseRow[this.enteringIndex];
      this.baseColumnParams[this.leavingIndex] = this.baseRowParams[
        this.enteringIndex
      ];
      // console.log("a removed from matrix ", this.matrix);
      // console.log(this.baseRowParams);
      // recalculate Z row
      this.createZCRow();
    }
  };

  generateOutput = () => {
    let evalR = [];
    let result = [];
    for (let i = 1; i < this.vars + 1; i++) {
      let param = `x${i}`;
      let idx = this.baseColumnParams.indexOf(param);
      if (idx !== -1) {
        evalR.push({
          [this.baseColumnParams[idx]]: this.getColumn(this.matrix, 0)[idx]
        });

        result.push(this.getColumn(this.matrix, 0)[idx]);
      } else {
        evalR.push({ [param]: 0 });
        result.push(0);
      }
    }
    evalR = Object.assign(...evalR);
    let infeasible = 1;
    for (let i = 0; i < this.boundariesEq.length; i++) {
      if (!math.parse(this.boundariesEq[i]).eval(evalR)) {
        infeasible = 0;
      }
    }

    let z = math.parse(this.zEq).eval(evalR);
    return [infeasible, z, ...result];
  };
  run = () => {
    // phase One
    while (!this.stop) {
      if (this.unbounded) {
        this.stop = true;
        return [0];
      } else {
        console.log("Phase One");
        this.selectPivot();
        this.matrixOperations();
      }
    }
    console.log("phase one output ", this.generateOutput());
    console.log("Phase one end");
    if (!this.unbounded) {
      if (this.stop) {
        this.stop = false;
      }
      // phase two
      this.createEquationBase();
      if (this.secondPhase) {
        console.log("no second phase");
        return this.generateOutput();
      }
      this.createZCRow();

      while (!this.stop) {
        if (this.unbounded) {
          this.stop = true;
          return [0];
        } else {
          console.log("Phase Two");
          this.selectPivot();
          this.matrixOperations();
        }
      }
      return this.generateOutput();
    }
  };
}
