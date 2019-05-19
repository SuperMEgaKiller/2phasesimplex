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

  constructor(equation, boundaries, vars) {
    //   array of boudaries
    this.boundaries = boundaries;
    this.equation = equation;
    this.vars = vars;
    this.matrix = [];
    this.baseRowParams = [];
    this.baseRow = [];
    this.baseColumnParams = [];
    this.baseColumn = [];
    this.zRow = [];
  }

  createEquationBase = () => {
    //   lets assume in main Equation all Variables in order
    for (let i = 0; i < this.equation.length; i++) {
      let [param] = this.equation[i].split("*");
      this.baseRow[i] = parseFloat(param);
    }

    // change base Column vals after changing helping Row
    let idx;
    for (let i = 0; i < this.baseColumn.length; i++) {
      idx = this.baseRowParams.indexOf(this.baseColumnParams[i]);
      this.baseColumn[i] = this.baseRow[idx];
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
    // console.log(this.baseColumn);
    // console.log(this.baseColumnParams);
    // console.log(this.baseRow);
    // console.log(this.baseRowParams);
    // console.log(this.matrix);
  };

  createZCRow = () => {
    this.zRow = [];
    let sum;
    let tmp;
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
  };

  initMatrix = () => {
    // create matrix from boundary equations
    for (let i = 0; i < this.boundaries.length; i++) {
      this.matrix.push(this.initRow(this.boundaries[i]));
    }

    // init Uknown variables and baseRow with 0 for them
    for (let i = 0; i < this.vars; i++) {
      let [, unknown] = this.boundaries[0][i].split("*");
      this.baseRowParams.push(unknown);
      this.baseRow.push(0);
    }

    this.addSurpusArtifitialAnsVars();
    this.createZCRow();
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
    // console.log("pivot");
    // console.log(ansColumn);
    // console.log(minColumn);

    if (this.zRow[zMinIndex] >= 0) {
      this.stop = true;
      console.log("stop");
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

      // debug
      console.log("entering ", this.enteringIndex);
      console.log("entering ", this.enteringParam);
      console.log("leaving ", this.leavingIndex);
      console.log("leaving ", this.leavingParam);

      // check that all entering column vals are not <= 0
      let enteringColumn = this.getColumn(
        this.matrix,
        this.enteringIndex
      ).filter(val => val > 0);
      if (enteringColumn.length === 0) {
        this.stop = true;
      }

      // console.log(this.stop);
      // console.log(enteringColumn);
    }
  };

  matrixOperations = () => {
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
      if (/^a/.test(this.baseColumnParams[this.leavingIndex])) {
        let removingIndex = this.baseRowParams.indexOf(this.leavingParam);

        for (let i = 0; i < this.matrix.length; i++) {
          slice1 = this.matrix[i].slice(0, removingIndex + 1);
          slice2 = this.matrix[i].slice(
            removingIndex + 2,
            this.matrix[0].length
          );
          slice = [...slice1, ...slice2];
          this.matrix[i] = slice;
        }

        slice1 = this.baseRow.slice(0, removingIndex);
        slice2 = this.baseRow.slice(removingIndex + 1, this.baseRow.length);
        slice = [...slice1, ...slice2];
        this.baseRow = [...slice];

        slice1 = this.baseRowParams.slice(0, removingIndex);
        slice2 = this.baseRowParams.slice(
          removingIndex + 1,
          this.baseRow.length
        );
        slice = [...slice1, ...slice2];
        this.baseRowParams = [...slice];
      }

      // swap leaving with entering
      this.baseColumn[this.leavingIndex] = this.baseRow[this.enteringIndex];
      this.baseColumnParams[this.leavingIndex] = this.baseRowParams[
        this.enteringIndex
      ];

      //   console.log(this.baseColumn);
      //   console.log(this.baseColumnParams);
      // recalculate Z row
      this.createZCRow();
      //   console.log(this.zRow);
    }
  };

  phaseTwoBaseInit = () => {
    // baseRow init
    for (let i = 0; i < this.baseRow.length; i++) {
      const element = [];
    }
  };
  phaseOne = () => {
    // phase One
    console.log("Phase One");
    while (!this.stop) {
      this.selectPivot();
      this.matrixOperations();
    }

    if (this.stop) {
      console.log("Phase Two");
      this.stop = false;
    }

    // phase two
    this.createEquationBase();
    this.createZCRow();

    while (!this.stop) {
      console.log("iteraion");
      this.selectPivot();
      this.matrixOperations();
    }
    console.log(this.matrix);
    console.log(this.baseColumnParams);
  };
}
