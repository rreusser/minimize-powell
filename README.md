# minimize-powell

[![Build Status][travis-image]][travis-url] [![npm version][npm-image]][npm-url]  [![Dependency Status][david-image]][david-url] [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

> Minimize a multivariate function using [Powell's Method](https://en.wikipedia.org/wiki/Powell%27s_method)

## Introduction

Minimizes a function of any number of variables using Powell's method with a full restart every `n + 1` steps. It's useful and tested on a number of wikipedia's [test functions for optimization](https://en.wikipedia.org/wiki/Test_functions_for_optimization), but it's not ready for scientific work. It uses a [golden section line search](https://github.com/scijs/minimize-golden-section-1d) so that it's maybe a bit slow but not gradient based. It's useful, but you can do way better if you really need a robust minimizer.

## Installation

```
$ npm install minimize-powell
```

## Usage

Minimize [McCormick's function](https://en.wikipedia.org/wiki/Test_functions_for_optimization) with initial guess `[0, 0]` within the region x ∈ [-1.5, 4] and y ∈ [-3, 4]:

```javascript
require('minimize-powell')(
  x => Math.sin(x[0] + x[1]) + Math.pow(x[0] - x[1], 2) - 1.5 * x[0] + 2.5 * x[1] + 1,
  [0, 0],
  {bounds: [[-1.5, 4], [-3, 4]]}
)
// => [ -0.5471975614863934, -1.547197546832775 ]
```

## API

#### `require('minimize-powell')(f, x0[, options])`

Minimizes a function of `x0.length` variables where `x0` is the initial guess and `f` is a function that takes Array `x` and returns the value of the function to be minimized. On successful completion, returns the argument `x` minimizing `f`.

Options:

- `maxIter` (default: `20`): maximum allowed number of iterations
- `tolerance` (default: `1e-8`): convergence tolerance
- `lineTolerance` (default: `tolerance`): 1-d line search tolerance
- `bounds` (default: `undefined`): variable bounds. Format: `[[x0min, x0max], [x1min, x1max], ...]`. If a set of bounds is not provided a bound is undefined (or +/- Infinity), the bound is not used.
- `verbose` (default: `false`): print iteration information

## License
&copy; 2017 Ricky Reusser. MIT License.

[travis-image]: https://travis-ci.org/rreusser/minimize-powell.svg?branch=master
[travis-url]: https://travis-ci.org/rreusser/minimize-powell
[npm-image]: https://badge.fury.io/js/minimize-powell.svg
[npm-url]: http://badge.fury.io/js/minimize-powell
[david-image]: https://david-dm.org/rreusser/minimize-powell.svg
[david-url]: https://david-dm.org/rreusser/minimize-powell
