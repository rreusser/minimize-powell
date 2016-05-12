'use strict';

var minimize1d = require('minimize-golden-section-1d');

module.exports = powellsMethod;

function powellsMethod (f, x0, options) {
  var i, j, iter, ui, p, pj, tmin, pj, fi, un, u, p0, sum, f0, fn;

  options = options || {};
  var maxIter = options.maxIter === undefined ? 20 : options.maxIter;
  var tol = options.tolerance === undefined ? 1e-8 : options.tolerance;
  var tol1d = options.tolerance1d === undefined ? tol : options.tolerance1d;


  // Dimensionality:
  var n = x0.length;

  // Solution vector:
  var p = x0.slice(0);

  // Search directions:
  u = [];
  un = [];
  for (i = 0; i < n; i++) {
    u[i] = [];
    for (j = 0; j < n; j++) {
      u[i][j] = i === j ? 1 : 0;
    }
  }

  if (!options.computeConstraints) {
    options.computeConstraints = function (p, ui) {
      var upper = Infinity;
      var lower = -Infinity;

      for (var j = 0; j < n; j++) {
        if (ui[j] !== 0) {
          if (options.lowerBound) {
            lower = Math.max(lower, (options.lowerBound - p[j]) / ui[j]);
          }
          if (options.upperBound) {
            upper = Math.min(upper, (options.upperBound - p[j]) / ui[j]);
          }
        }
      }

      return {lowerBound: lower, upperBound: upper};
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
    if (iter % (n + 1) === 0) {
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

      // Compute bounds based on starting point p in the
      // direction ui:

      var constraints = options.computeConstraints(p, ui);

      // Minimize using golden section method:
      tmin = minimize1d(fi, {
        lowerBound: constraints.lowerBound,
        upperBound: constraints.upperBound,
        tolerance: tol1d
      });

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

    var constraints = options.computeConstraints(p, ui);

    tmin = minimize1d(fi, {
      lowerBound: constraints.lowerBound,
      upperBound: constraints.upperBound,
      tolerance: tol1d
    });

    for (j = 0; j < n; j++) {
      p[j] += tmin * ui[j];
    }

    fn = f(p);

    var error = Math.abs((f0 - fn) / f0)

    console.log('Iteration:', iter, ', Error:', error)

    if ( error < tol) {
      break;
    }
  }

  return p;
};
