'use strict';

var test = require('tape');
var almostEqual = require('almost-equal');
var minimize = require('../');

function assertAlmostEqual (t, computed, expected, tol) {
  tol = tol === undefined ? almostEqual.FLT_EPSILON * 2 : tol;
  t.ok(
    almostEqual(computed, expected, tol, tol),
    'Expected ' + computed + ' to equal ' + expected + ' (±' + tol + ')'
  );
}

function assertVectorAlmostEqual (t, computed, expected, tol) {
  t.equal(computed.length, expected.length, 'Expected length of computed vector (' + computed.length + ' to equal ' + expected.length + ')');

  for (var i = 0; i < computed.length; i++) {
    assertAlmostEqual(t, computed[i], expected[i], tol);
  }
}

test('minimizes x^2 + y^2 - x * y starting at [-20, 25]', function (t) {
  assertVectorAlmostEqual(t,
    minimize(function (x) {
      return 1 + x[0] * x[0] + x[1] * x[1] - 1.9 * x[0] * x[1];
    }, [-20, 25]),
    [0, 0]
  );
  t.end();
});

test('minimizes (x + 10)^2 + (y + 10)^2 to [-10, -10]', function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) { return Math.pow(x[0] - 10, 2) + Math.pow(x[1] - 10, 2); },
      [0, 0]
    ),
    [10, 10]
  );
  t.end();
});

test('minimizes (x + 10)^2 + (y + 10)^2 to [1, 1] within [0, 1] x [0, 1]', function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) { return Math.pow(x[0] - 10, 2) + Math.pow(x[1] - 10, 2); },
      [0.5, 0.5],
      {bounds: [[0, 1], [0, 1]]}
    ),
    [1, 1]
  );
  t.end();
});

test('minimizes (x - 10)^2 + (y - 10)^2 to [1, 1] within [0, 1] x [0, 1]', function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) { return Math.pow(x[0] + 10, 2) + Math.pow(x[1] + 10, 2); },
      [0.5, 0.5],
      {bounds: [[0, 1], [0, 1]]}
    ),
    [0, 0]
  );
  t.end();
});

test('minimizes (x - 10)^2 + (y - 10)^2 to [1, 1] for x within [0, 1]', function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) { return Math.pow(x[0] - 10, 2) + Math.pow(x[1] + 10, 2); },
      [0.5, 0.5],
      {bounds: [[0, 1], null]}
    ),
    [1, -10]
  );
  t.end();
});

test('Rosenbrock function', function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) {
        return 100.0 * Math.pow(x[1] - x[0] * x[0], 2) + Math.pow(x[0] - 1, 2);
      },
      [0.5, 0.5]
    ),
    [1, 1]
  );
  t.end();
});

test("Booth's function", function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) { return Math.pow(x[0] + 2 * x[1] - 7, 2) + Math.pow(2 * x[0] + x[1] - 5, 2); },
      [0.5, 0.5]
    ),
    [1, 3]
  );
  t.end();
});

test("Booth's function with one-way bounds", function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) { return Math.pow(x[0] + 2 * x[1] - 7, 2) + Math.pow(2 * x[0] + x[1] - 5, 2); },
      [0, 0],
      {bounds: [[-10, Infinity], [-Infinity, 10]]}
    ),
    [1, 3]
  );
  t.end();
});

test("Booth's function with two-way bounds", function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) { return Math.pow(x[0] + 2 * x[1] - 7, 2) + Math.pow(2 * x[0] + x[1] - 5, 2); },
      [0, 0],
      {bounds: [[-10, 10], [-10, 10]]}
    ),
    [1, 3]
  );
  t.end();
});

test("Booth's function with invalid initial guess", function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) { return Math.pow(x[0] + 2 * x[1] - 7, 2) + Math.pow(2 * x[0] + x[1] - 5, 2); },
      [100, 100],
      {bounds: [[-10, 10], [-10, 10]]}
    ),
    [1, 3]
  );
  t.end();
});

for (var n = 0; n < 11; n++) {
  test('Rosenbrock function in ' + n + 'D', function (t) {
    assertVectorAlmostEqual(t,
      minimize(
        function (x) {
          var sum = 0;
          for (var i = 0; i < x.length - 1; i++) {
            sum += 100 * Math.pow(x[i + 1] - x[i] * x[i], 2) + Math.pow(x[i] - 1, 2);
          }
          return sum;
        },
        new Array(n).fill(0).map(function (d, i) { return i / 10; }),
        {maxIter: 10 + n * 8}
      ),
      new Array(n).fill(0).map(function () { return 1; }),
      1e-3
    );
    t.end();
  });
}

for (n = 0; n < 11; n++) {
  test('Rosenbrock function in ' + n + 'D in region [-10, 10]^n', function (t) {
    assertVectorAlmostEqual(t,
      minimize(
        function (x) {
          var sum = 0;
          for (var i = 0; i < x.length - 1; i++) {
            sum += 100 * Math.pow(x[i + 1] - x[i] * x[i], 2) + Math.pow(x[i] - 1, 2);
          }
          return sum;
        },
        new Array(n).fill(0).map(function (d, i) { return i / 10; }),
        {
          maxIter: 10 + n * 10,
          bounds: new Array(n).fill(0).map(function () { return [-10, 10]; })
        }
      ),
      new Array(n).fill(0).map(function () { return 1; }),
      1e-3
    );
    t.end();
  });
}

test("Beale's function", function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) {
        return Math.pow(1.5 - x[0] + x[0] * x[1], 2) +
          Math.pow(2.25 - x[0] + x[0] * x[1] * x[1], 2) +
          Math.pow(2.625 - x[0] + x[0] * x[1] * x[1] * x[1], 2);
      },
      [1, 1],
      {bounds: [[-4.5, 4.5], [-4.5, 4.5]]}
    ),
    [3, 0.5]
  );
  t.end();
});

test('Matyas function', function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) {
        return 0.26 * (x[0] * x[0] + x[1] * x[1]) - 0.48 * x[0] * x[1];
      },
      [1, 1],
      {bounds: [[-10, 10], [-10, 10]]}
    ),
    [0, 0]
  );
  t.end();
});

test('Golstein-Price function', function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) {
        return (1 + Math.pow(x[0] + x[1] + 1, 2) * (19 - 14 * x[0] + 3 * x[0] * x[0] - 14 * x[1] + 6 * x[0] * x[1] + 3 * x[1] * x[1])) *
          (30 + Math.pow(2 * x[0] - 3 * x[1], 2) * (18 - 32 * x[0] + 12 * x[0] * x[0] + 48 * x[1] - 36 * x[0] * x[1] + 27 * x[1] * x[1]));
      },
      [0, 0],
      {bounds: [[-2.5, 2.5], [-2.5, 2.5]]}
    ),
    [0, -1]
  );
  t.end();
});

test('McCormick function', function (t) {
  assertVectorAlmostEqual(t,
    minimize(
      function (x) {
        return Math.sin(x[0] + x[1]) + Math.pow(x[0] - x[1], 2) - 1.5 * x[0] + 2.5 * x[1] + 1;
      },
      [0, 0],
      {bounds: [[-1.5, 4], [-3, 4]]}
    ),
    [-0.54719, -1.54719],
    1e-5
  );
  t.end();
});
