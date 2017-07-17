'use strict';

var minimize1d = require('minimize-golden-section-1d');

module.exports = powellsMethod;

function powellsMethod (f, x0, options, status) {
  var i, j, iter, ui, tmin, pj, fi, un, u, p0, sum, dx, err, perr, du, tlimit;

  options = options || {};
  var maxIter = options.maxIter === undefined ? 20 : options.maxIter;
  var tol = options.tolerance === undefined ? 1e-8 : options.tolerance;
  var tol1d = options.lineTolerance === undefined ? tol : options.lineTolerance;
  var bounds = options.bounds === undefined ? [] : options.bounds;
  var verbose = options.verbose === undefined ? false : options.verbose;

  if (status) status.points = [];

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

  // Bound the input:
  function constrain (x) {
    for (var i = 0; i < bounds.length; i++) {
      var ibounds = bounds[i];
      if (!ibounds) continue;
      if (isFinite(ibounds[0])) {
        x[i] = Math.max(ibounds[0], x[i]);
      }
      if (isFinite(ibounds[1])) {
        x[i] = Math.min(ibounds[1], x[i]);
      }
    }
  }

  constrain(p);

  if (status) status.points.push(p.slice());

  var bound = options.bounds
    ? function (p, ui) {
      var upper = Infinity;
      var lower = -Infinity;

      for (var j = 0; j < n; j++) {
        var jbounds = bounds[j];
        if (!jbounds) continue;

        if (ui[j] !== 0) {
          if (jbounds[0] !== undefined && isFinite(jbounds[0])) {
            lower = (ui[j] > 0 ? Math.max : Math.min)(lower, (jbounds[0] - p[j]) / ui[j]);
          }

          if (jbounds[1] !== undefined && isFinite(jbounds[1])) {
            upper = (ui[j] > 0 ? Math.min : Math.max)(upper, (jbounds[1] - p[j]) / ui[j]);
          }
        }
      }

      return [lower, upper];
    }
    : function () {
      return [-Infinity, Infinity];
    };

  // A function to evaluate:
  pj = [];
  fi = function (t) {
    for (var i = 0; i < n; i++) {
      pj[i] = p[i] + ui[i] * t;
    }

    return f(pj);
  };

  iter = 0;
  perr = 0;
  while (++iter < maxIter) {
    // Reinitialize the search vectors:
    if (iter % (n) === 0) {
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

      tlimit = bound(p, ui);

      // Minimize using golden section method:
      dx = 0.1;

      tmin = minimize1d(fi, {
        lowerBound: tlimit[0],
        upperBound: tlimit[1],
        initialIncrement: dx,
        tolerance: dx * tol1d
      });

      if (tmin === 0) {
        return p;
      }

      // Update the solution vector:
      for (j = 0; j < n; j++) {
        p[j] += tmin * ui[j];
      }

      constrain(p);

      if (status) status.points.push(p.slice());
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

    if (sum > 0) {
      for (j = 0; j < n; j++) {
        un[j] /= sum;
      }
    } else {
      // Exactly nothing moved, so it it appears we've converged. In particular,
      // it's possible the solution is up against a boundary and simply can't
      // move farther.
      return p;
    }

    u.push(un);
    // One more minimization, this time along the new direction:
    ui = un;

    tlimit = bound(p, ui);

    dx = 0.1;

    tmin = minimize1d(fi, {
      lowerBound: tlimit[0],
      upperBound: tlimit[1],
      initialIncrement: dx,
      tolerance: dx * tol1d
    });

    if (tmin === 0) {
      return p;
    }

    err = 0;
    for (j = 0; j < n; j++) {
      du = tmin * ui[j];
      err += du * du;
      p[j] += du;
    }

    constrain(p);

    if (status) status.points.push(p.slice());

    err = Math.sqrt(err);

    if (verbose) console.log('Iteration ' + iter + ': ' + (err / perr) + ' f(' + p + ') = ' + f(p));

    if (err / perr < tol) return p;

    perr = err;
  }

  return p;
}
