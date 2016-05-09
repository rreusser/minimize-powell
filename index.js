'use strict';

var minimize1d = require('minimize-golden-section-1d');

module.exports = powellsMethod;

function powellsMethod (f, x0, options) {
  var i, j, iter, ui, p, pj, tmin, pj, fi, un, u, p0, sum, f0, fn;

  options = options || {};
  var maxIter = options.maxIter === undefined ? 20 : options.maxIter;
  var tol = options.tolerance === undefined ? 1e-8 : options.tolerance;


  // Dimensionality:
  var n = x0.length;
  //console.log('n =', n)


  // Solution vector:
  var p = x0.slice(0);
  //console.log('p =', p)


  // Search directions:
  u = [];
  un = [];
  for (i = 0; i < n; i++) {
    u[i] = [];
    for (j = 0; j < n; j++) {
      u[i][j] = i === j ? 1 : 0;
    }
  }


  // A function to evaluate:
  pj = [];
  fi = function (t) {
    for (var i = 0; i < n; i++) {
      pj[i] = p[i] + ui[i] * t;
    }

    return f(pj);
  };

  iter = 0;
  while (++iter < maxIter) {
    f0 = f(p);

    // Reinitialize the search vectors:
    if (iter % n === 0) {
      for (i = 0; i < n; i++) {
        u[i] = [];
        for (j = 0; j < n; j++) {
          u[i][j] = i === j ? 1 : 0;
        }
      }
    }

    // Store the starting point p0:
    for (j = 0, p0 = []; j < n; j++) {
      p0[j] = p[j];
    }

    // Minimize over each search direction u[i]:
    for (i = 0; i < n; i++) {
      ui = u[i];

      // Minimize using golden section method:
      tmin = minimize1d(fi, {guess: 0, tolerance: tol})
      //console.log('tmin =', tmin)


      // Update the solution vector:
      for (j = 0; j < n; j++) {
        p[j] += tmin * ui[j];
      }
    }

    // Throw out the first search direction:
    u.shift();

    // Construct a new search direction:
    for (j = 0, un = [], sum = 0; j < n; j++) {
      un[j] = p[j] - p0[j];
      sum += un[j] * un[j];
    }
    // Normalize:
    sum = Math.sqrt(sum);
    for (j = 0; j < n; j++) {
      un[j] /= sum;
    }

    u.push(un);

    // One more minimization, this time along the new direction:
    ui = un;
    tmin = minimize1d(fi, {guess: 0, tolerance: tol})
    for (j = 0; j < n; j++) {
      p[j] += tmin * ui[j];
    }

    fn = f(p);

    if (Math.abs((f0 - fn) / f0) < tol) {
      break;
    }
  }

  return p;
};
