/* global describe, it */
'use strict';

var assert = require('chai').assert;
var almostEqual = require('almost-equal');
var minimize = require('../');

assert.almostEqual = function (computed, expected, tol) {
  tol = tol === undefined ? almostEqual.FLT_EPSILON : tol;
  var ae = almostEqual(computed, expected, tol, tol);

  if (!ae) {
    throw new Error('Expected ' + computed + ' to equal ' + expected + ' (±' + tol + ')');
  }
};

assert.vectorAlmostEqual = function(computed, expected, tol) {
  assert.equal(computed.length, expected.length, 'Expected length of computed vector (' + computed.length + ' to equal ' + expected.length);
  for (var i = 0; i < computed.length; i++) {
    assert.almostEqual(computed[i], expected[i], tol);
  }
};

describe('minimize', function () {
  it('minimizes x^2 + y^2 - x * y starting at [-20, 25]', function () {
    assert.vectorAlmostEqual(
      minimize(function (x) {
        return 1 + x[0] * x[0] + x[1] * x[1] - 1.9 * x[0] * x[1];
      }, [-20, 25]),
      [0, 0],
      almostEqual.FLT_EPSILON * 2
    );
  })
});

