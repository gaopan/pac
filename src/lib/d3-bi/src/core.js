import * as d3 from "d3"

var bi = {};

// the major global objects under the bi namespace
bi.dev = false; //set false when in production
bi.charts = {}; //stores all the ready to use charts
bi.logs = {}; //stores some statistics and potential error messages

bi.dispatch = d3.dispatch('render_start', 'render_end');

// Function bind polyfill
// Needed ONLY for phantomJS as it's missing until version 2.0 which is unreleased as of this comment
// https://github.com/ariya/phantomjs/issues/10522
// http://kangax.github.io/compat-table/es5/#Function.prototype.bind
// phantomJS is used for running the test suite
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function() {},
      fBound = function() {
        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments)));
      };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}

//  Development render timers - disabled if dev = false
if (bi.dev) {
  bi.dispatch.on('render_start', function(e) {
    bi.logs.startTime = +new Date();
  });

  bi.dispatch.on('render_end', function(e) {
    bi.logs.endTime = +new Date();
    bi.logs.totalTime = bi.logs.endTime - bi.logs.startTime;
    bi.log('total', bi.logs.totalTime); // used for development, to keep track of graph generation times
  });
}

// Logs all arguments, and returns the last so you can test things in place
// Note: in IE8 console.log is an object not a function, and if modernizr is used
// then calling Function.prototype.bind with with anything other than a function
// causes a TypeError to be thrown.
bi.log = function() {
  if (bi.dev && window.console && console.log && console.log.apply)
    console.log.apply(console, arguments);
  else if (bi.dev && window.console && typeof console.log == "function" && Function.prototype.bind) {
    var log = Function.prototype.bind.call(console.log, console);
    log.apply(console, arguments);
  }
  return arguments[arguments.length - 1];
};

// print console warning, should be used by deprecated functions
bi.deprecated = function(name, info) {
  if (console && console.warn) {
    console.warn('bid3 warning: `' + name + '` has been deprecated. ', info || '');
  }
};

// The bi.render function is used to queue up chart rendering
// in non-blocking async functions.
// When all queued charts are done rendering, bi.dispatch.render_end is ibioked.
bi.render = function render(step) {
  // number of graphs to generate in each timeout loop
  step = step || 1;

  bi.render.active = true;
  bi.dispatch.call("render_start");

  var renderLoop = function() {
    var chart, graph;

    for (var i = 0; i < step && (graph = bi.render.queue[i]); i++) {
      chart = graph.generate();
      if (typeof graph.callback == typeof(Function)) graph.callback(chart);
    }

    bi.render.queue.splice(0, i);

    if (bi.render.queue.length) {
      setTimeout(renderLoop);
    } else {
      bi.dispatch.call("render_end");
      bi.render.active = false;
    }
  };

  setTimeout(renderLoop);
};

bi.render.active = false;
bi.render.queue = [];

/*
Adds a chart to the async rendering queue. This method can take arguments in two forms:
bi.addGraph({
    generate: <Function>
    callback: <Function>
})
or
bi.addGraph(<generate Function>, <callback Function>)
The generate function should contain code that creates the bid3 model, sets options
on it, adds data to an SVG element, and ibiokes the chart model. The generate function
should return the chart model.  See examples/lineChart.html for a usage example.
The callback function is optional, and it is called when the generate function completes.
*/
bi.addGraph = function(obj) {
  if (typeof arguments[0] === typeof(Function)) {
    obj = { generate: arguments[0], callback: arguments[1] };
  }

  bi.render.queue.push(obj);

  if (!bi.render.active) {
    bi.render();
  }
};

export default bi
