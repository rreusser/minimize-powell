# minimize-powell

<!--[![Build Status][travis-image]][travis-url] [![npm version][npm-image]][npm-url]  [![Dependency Status][david-image]][david-url] [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)-->

> Minimize a multivariate function using Powell's Method

## Introduction

Minimizes a function of any number of variables using Powell's method with a full restart ever `n + 1` steps. It's useful, but I wouldn't consider it production ready. Use at your own discretion.

## API

#### `minimize(f, x0[, options])`

Minimizes a function of `x0.length` variables where `x0` is the initial guess and `f` is a function that takes Array `x` and returns the value of the function to be minimized. On successful completion, returns the argument `x` minimizing `f`.

Options:

- `maxIter` (default: `20`): maximum allowed number of iterations
- `tolerance` (default: `1e-8`): convergence tolerance
- `lineTolerance` (default: `tolerance`): 1-d line search tolerance
- `bounds` (default: `undefined`): variable bounds. Format: `[[x0min, x0max], [x1min, x1max], ...]`. If a set of bounds is not provided a bound is undefined (or +/- Infinity), the bound is not used.
- `verbose` (default: `false`): print iteration information

## License
&copy; 2016 Ricky Reusser. MIT License.
