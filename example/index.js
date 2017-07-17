var h = require('h');
var expr = require('expr-eval');
var Plotly = require('plotly.js');
var css = require('insert-css');
var minimize = require('../');
var parser = new expr.Parser();
var mouseChange = require('mouse-change');
var transpose = require('transpose');

css(`
#graph {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
`);

var gd = window.gd = h('div#graph');
document.body.appendChild(gd);

var i, j;
var x = [];
var y = [];
var z = [];

var exprStr = '(1 + (x + y + 1)^2 * (19 - 14 * x + 3 * x^2 - 14 * y + 6 * x + y + 3 * y^2)) * (30 + (2 * x - 3 * y)^2 * (18 - 32 * x + 12 * x^2 + 48 * y - 36 * x * y + 27 * y^2))';
// var exprStr = '(1.5 - x + x * y)^2 + (2.25 - x + x * y^2)^2 + (2.625 - x + x * y^3)^2';
// var exprStr = '100 * (y - x^2)^2 + (x - 1)^2';
var f = parser.parse(exprStr);

var ar = window.innerWidth / window.innerHeight;
var nx = 50 * ar;
var ny = 50;
var xrange, yrange;
var dx0 = 1.5;

if (ar < 1) {
  xrange = [-dx0, dx0];
  yrange = [-dx0 / ar, dx0 / ar];
} else {
  xrange = [-dx0 * ar, dx0 * ar];
  yrange = [-dx0, dx0];
}
var zmin, zmax;

function compute () {
  for (i = 0; i < nx; i++) {
    x[i] = xrange[0] + (xrange[1] - xrange[0]) * i / (nx - 1);
  }

  for (j = 0; j < ny; j++) {
    y[j] = yrange[0] + (yrange[1] - yrange[0]) * j / (ny - 1);
  }

  zmin = Infinity;
  zmax = -Infinity;
  for (j = 0; j < ny; j++) {
    z[j] = z[j] || [];
    for (i = 0; i < nx; i++) {
      z[j][i] = f.evaluate({x: x[i], y: y[j]});
      zmax = Math.max(zmax, z[j][i]);
      zmin = Math.min(zmin, z[j][i]);
    }
  }

  for (j = 0; j < ny; j++) {
    for (i = 0; i < nx; i++) {
      z[j][i] -= zmin;
      z[j][i] /= (zmax - zmin);
      z[j][i] = Math.log(z[j][i] + 1e-4);
    }
  }
}

compute();

Plotly.plot(gd, [{
  x: x,
  y: y,
  z: z,
  type: 'contour',
  showscale: false,
  colorscale: 'Viridis',
  ncontours: 40,
  hoverinfo: 'none',
  contours: {
    showlines: false
  }
}, {
  x: [0],
  y: [0],
  mode: 'lines',
  hoverinfo: 'skip',
  showlegend: false,
  line: {
    color: 'white',
    simplify: false
  }
}, {
  x: [0],
  y: [0],
  mode: 'markers',
  hoverinfo: 'skip',
  showlegend: false,
  marker: {
    size: 20,
    color: 'rgba(0, 0, 0, 0)',
    line: {
      width: 3,
      color: 'red'
    }

  }
}], {
  xaxis: {
    scaleanchor: 'y',
    scaleratio: 1,
    range: xrange
  },
  yaxis: {
    scaleanchor: 'x',
    scaleratio: 1,
    range: yrange
  },
  margin: {t: 30, r: 30, b: 30, l: 30},
  dragmode: 'pan'
}, {
  displayModeBar: false,
  scrollZoom: true
});

var p = Promise.resolve();

function computeMin (x0) {
  var status = {};
  var x1 = minimize(function (x) {
    return f.evaluate({x: x[0], y: x[1]});
  }, x0, {maxIter: 50}, status);

  return {
    points: transpose(status.points),
    x0: x0,
    x1: x1
  };
}

mouseChange(gd, function (buttons, i, j, mods) {
  var xr = gd.layout.xaxis.range;
  var yr = gd.layout.yaxis.range;
  var x = xr[0] + (xr[1] - xr[0]) * (i - 30) / (window.innerWidth - 60);
  var y = yr[0] + (yr[1] - yr[0]) * (1 - (j - 30) / (window.innerHeight - 60));

  var min = computeMin([x, y]);

  Plotly.animate(gd, [{
    data: [
      {x: min.points[0], y: min.points[1]},
      {x: [min.x0[0], min.x1[0]], y: [min.x0[1], min.x1[1]]}
    ],
    traces: [1, 2]
  }], {
    mode: 'immediate',
    transition: {
      duration: 0,
      redraw: false
    }
  });
});

gd.on('plotly_relayout', function () {
  xrange = gd.layout.xaxis.range;
  yrange = gd.layout.yaxis.range;
  compute();

  p = p.then(function () {
    return Plotly.restyle(gd, {x: [x], y: [y], z: [z]}, [0]);
  });
});
