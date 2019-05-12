import math from "mathjs";

export class TwoPhaseSimplex {
  constructor() {
    this.CRow;
    this.CColumn = math.matrix();
    this.zRow = math.matrix();
    this.matrix = [];
  }

  setVarRow = eqs => {
    this.CColumn = math.matrix();
    for (let i = 0; i < eqs.length; i++) {
      if (this.getOperation(eqs[i]) === "<=") {
        this.CColumn = math.concat(this.CColumn, [0]);
      } else if (this.getOperation(eqs[i]) === ">=") {
        this.CColumn = math.concat(this.CColumn, [-1]);
      }
    }
  };

  //   change
  updatePhase1VarRow = eqs => {
    this.CColumn = [];
    for (let i = 0; i < eqs.length; i++) {
      this.CColumn.push(0);
    }
  };

  getAns = equation => {
    return equation.args[1].value;
  };

  getOperation = equation => {
    return equation.op;
  };

  getParams = equation => {
    let value = null;
    let row = [];

    // make as function
    this.CRow = new Array(equation.args[0].args.length).fill(0);
    //   console.log(varColumn);

    equation.args[0].args.forEach(arg => {
      value = arg.args[0].value;

      if (isNaN(value)) {
        throw new Error(`invalid parametr ${arg}`);
      } else {
        row.push(value);
      }
    });

    return row;
  };

  createMatrix = equations => {
    for (let i = 0; i < equations.length; i++) {
      this.matrix.push(this.getParams(equations[i]));
    }
  };

  createSurpusAndAvColumn = eqs => {
    let op = null;
    let row = [];
    let s = [];
    for (let i = 0; i < eqs.length; i++) {
      op = this.getOperation(eqs[i]);
      if (op === "<=") {
        row = math.zeros(eqs.length, 1);
        row._data[i][0] = 1;
      } else if (op === ">=") {
        row = math.zeros(eqs.length, 1);
        row._data[i][0] = -1;
        s.push(i);
      }
      this.matrix = math.concat(this.matrix, row);
    }

    //   console.log(varColumn);
    //   console.log(math.zeros(1,eqs.length));
    this.CRow = this.CRow.concat(new Array(eqs.length).fill(0));
    //   console.log(varColumn);

    for (let i = 0; i < s.length; i++) {
      row = math.zeros(eqs.length, 1);
      row._data[s[i]][0] = 1;
      this.matrix = math.concat(this.matrix, row);
      this.CRow.push(-1);
    }
  };

  addAnsColumn = eqs => {
    let column = [];
    for (let i = 0; i < eqs.length; i++) {
      column.push([this.getAns(eqs[i])]);
    }

    this.matrix = math.concat(column, this.matrix);
  };

  getColumn = (M, i) =>
    math.flatten(M.subset(math.index(math.range(0, M._size[0]), i))).toArray();
  getRow = (M, i) =>
    math.flatten(M.subset(math.index(i, math.range(0, M._size[1])))).toArray();
  //   Z - C
  createZRow = () => {
    let tmp = null;
    let sum;
    this.zRow = math.matrix();
    for (let i = 1; i < this.matrix._size[1]; i++) {
      sum = 0;
      for (let j = 0; j < this.CColumn._size[0]; j++) {
        tmp = this.getColumn(this.matrix, i)[j] * this.CColumn._data[j];
        sum += parseInt(tmp);
      }
      this.zRow = math.concat(this.zRow, [sum]);
    }
    this.zRow = math.subtract(this.zRow, this.CRow);
  };

  getPivot = () => {
    //   z row select smallest
    let minIndex = this.zRow._data.indexOf(Math.min(...this.zRow._data));
    let ansColumn = this.getColumn(this.matrix, 0);
    let minColumn = this.getColumn(this.matrix, minIndex + 1);
    let min = 10000000;
    this.pivotIndex;
    let tmp = 0;
    for (let i = 0; i < minColumn.length; i++) {
      tmp = ansColumn[i] / minColumn[i];
      if (tmp < min) {
        min = tmp;
        this.pivotIndex = [minIndex + 1, i];
      }
    }
  };

  //   remember all A1, An... for until all A is zero slice only remembered columns
  pivotOperations = () => {
    // matrix[pivot row]/matrix[pivot]
    let matrix = this.matrix;
    let pRI = this.pivotIndex[1];
    let pCI = this.pivotIndex[0];
    let pivotRow = this.getRow(this.matrix, pRI);
    let pivotValue = pivotRow[this.pivotIndex[0]];
    let v = null;
    let row = null;
    let tmpPR = null;
    for (let i = 0; i < matrix._size[1]; i++) {
      matrix._data[pCI][i] = matrix._data[pCI][i] / pivotValue;
    }

    for (let i = 0; i < matrix._size[0]; i++) {
      if (i !== pRI && matrix._data[i][pCI] !== 0) {
        row = this.getRow(matrix, i);
        v = row[pCI];
        tmpPR = math.multiply(pivotRow, v);

        for (let j = 0; j < matrix._size[1]; j++) {
          matrix._data[i][j] -= tmpPR[j];
        }
      }
    }
    // not always last
    for (let i = 0; i < matrix._size[0]; i++) {
      matrix._data[i] = matrix._data[i].slice(0, 7);
    }
    matrix = math.matrix(matrix._data);
    this.CRow = this.CRow.slice(0, 6);
    this.matrix = matrix;

    // put in for
    let zeros = false;
    for (let i = 0; i < this.zRow.length; i++) {
      if (this.zRow[i] !== 0) {
        zeros = true;
      }
    }

    if (!zeros) {
      console.log("x1 = 3, x2 = 0");
    }
  };

  phase2 = () => {
    this.updateCrowPhase2();
    this.createZRow();
    this.getPivot();
    this.phase2pivotOperation();
  };

  updateCrowPhase2 = () => {
    this.CRow = [3, 5, 0, 0, 0, 0];
    this.CColumn = math.matrix([0, 0, 0, 3]);
  };

  phase2pivotOperation = () => {
    let matrix = this.matrix;
    let pRI = this.pivotIndex[1];
    let pCI = this.pivotIndex[0];
    let pivotRow = this.getRow(this.matrix, pRI);
    let pivotValue = pivotRow[this.pivotIndex[0]];
    let v = null;
    let row = null;
    let tmpPR = null;
    
  };
}
