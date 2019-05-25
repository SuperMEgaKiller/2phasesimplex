import { Graph } from "@dagrejs/graphlib";
import TwoPhaseSimplex from "./TwoPhaseSimplex";
// let child1 = [[1, 11.23, 2.866, 3.5333], [1, 12, 3.799, 4.201]];
let child1 = [[1, 11.0001, 2.999, 3.9999], [1, 11.5, 3.399, 3.101]];

export default class Bnb {
  constructor(z, zEq, boundaries, boundariesEq, vars) {
    this.e = 0.01;
    this.stop = false;
    this.optimal;
    this.z = z;
    this.zEq = zEq;
    this.currentIndex;
    this.boundaries = boundaries;
    this.boundariesEq = boundariesEq;
    this.vars = vars;
    this.graph = new Graph();
  }

  roundResult = result => {
    let up, down;
    result.forEach((el, idx) => {
      up = Math.ceil(el);
      down = Math.floor(el);

      if (Math.abs(up - result[idx]) <= this.e) {
        result[idx] = Math.ceil(result[idx]);
      } else if (Math.abs(down - result[idx]) <= this.e) {
        result[idx] = Math.floor(result[idx]);
      }
    });
    return result;
  };

  checkIsRound = data => {
    let up, down;
    let rounded = true;
    data.forEach(el => {
      up = Math.ceil(el);
      down = Math.floor(el);

      if (Math.abs(up - el) <= this.e) {
        el = Math.ceil(el);
      } else if (Math.abs(el - down) <= this.e) {
        el = Math.floor(el);
      } else {
        rounded = false;
      }
    });

    return rounded;
  };

  isNodeRounded = node => {
    let rounded = false;
    console.log("node ", node);
    if (this.checkIsRound(node.slice(1, node.length - 1))) {
      rounded = true;
    }
    return rounded;
  };

  maxPrecise = node => {
    let precision = [];
    for (let i = 2; i < node.length - 1; i++) {
      precision.push(node[i] % 1);
    }
    let current = Math.max(...precision);
    this.currentIndex = precision.indexOf(current);
  };

  expandNode = node => {
    this.maxPrecise(node);
    //   bound up
    // result node

    let up = Math.ceil(node[this.currentIndex + 2]);

    let upperEquation = "";
    let curr = this.currentIndex + 1;
    for (let i = 1; i < this.vars + 1; i++) {
      if (curr === i) {
        upperEquation = upperEquation.concat(`+1*x${curr} `);
      } else {
        upperEquation = upperEquation.concat(`+0*x${i} `);
      }
    }
    upperEquation = upperEquation.concat(`>= ${up}`);

    // lower
    let low = Math.floor(node[this.currentIndex + 2]);
    // let lowerEquation = `1*x${this.currentIndex + 1} <= ${lower}`;
    let lowerEquation = "";
    for (let i = 1; i < this.vars + 1; i++) {
      if (curr === i) {
        lowerEquation = lowerEquation.concat(`+1*x${curr} `);
      } else {
        lowerEquation = lowerEquation.concat(`+0*x${i} `);
      }
    }
    lowerEquation = lowerEquation.concat(`<= ${low}`);

    let eqUpper = [...node[node.length - 1], upperEquation.split(" ")];
    let eqLower = [...node[node.length - 1], lowerEquation.split(" ")];
    // simplex method
    // add child nodes to history
    // choose max

    // upper
    // lower
    // let anws = [[1, 11.23, 2.866, 3.5333], [1, 12, 3.799, 4.201]];
    let upBoundEq = [];
    let lowBoundEq = [];
    eqUpper.forEach(eq => {
      upBoundEq.push(eq.join(" "));
    });
    eqLower.forEach(eq => {
      lowBoundEq.push(eq.join(" "));
    });

    // console.log(node);
    // console.log(eqUpper);
    // console.log(upBoundEq);
    // console.log(eqLower);
    // console.log(lowBoundEq);
    let simplexUp = new TwoPhaseSimplex(
      this.z,
      this.zEq,
      eqUpper,
      upBoundEq,
      this.vars
    );
    simplexUp.initMatrix();

    let simplexLow = new TwoPhaseSimplex(
      this.z,
      this.zEq,
      eqLower,
      lowBoundEq,
      this.vars
    );
    simplexLow.initMatrix();
    // console.log(eqUpper);
    // console.log(upBoundEq);
    let upper = simplexUp.run();
    let lower = simplexLow.run();
    const result = [];
    if (upper[0] === 1) {
      upper = this.roundResult(upper);
      upper.push(eqUpper);
      result.push(upper);
    }

    if (lower[0] === 1) {
      lower = this.roundResult(lower);
      lower.push(eqLower);
      result.push(lower);
    }

    // round
    // for (let i = 2; i < max.length; i++) {
    //     max[i] = this.roundResult(max[i]);
    //   }
    // check is optimal
    // if choose(z) bigger than optimal remember optimal
    // check is z smaller than optimal, return optimal
    // stop = true
    // this.optimal
    // stop = true
    // return []
    return result;
  };
  bnb = () => {
    //   simplex first call
    let simplex = new TwoPhaseSimplex(
      this.z,
      this.zEq,
      this.boundaries,
      this.boundariesEq,
      this.vars
    );
    simplex.initMatrix();
    let ans = simplex.run();
    if (ans[0] === 1) {
      let parent = [...ans, this.boundaries];
      let heap = [parent];
      let curr;
      while (heap.length !== 0) {
        curr = heap.shift();

        if (this.isNodeRounded(curr)) {
          if (!this.optimal) {
            this.optimal = curr;
          } else {
            this.optimal = this.optimal[1] > curr[1] ? this.optimal : curr;
          }
          console.log("New Optimal ", this.optimal);
        }

        if (this.optimal) {
          heap = heap.filter(node => node[1] >= this.optimal[1]);
        }

        if (heap.length === 0) {
          if (this.optimal) {
            console.log("optimal", this.optimal);
          } else {
            curr = this.expandNode(curr);
            heap = [...heap, ...curr];
          }
        }
      }
    } else {
      console.log("Equation is infeasible");
    }
  };
}
