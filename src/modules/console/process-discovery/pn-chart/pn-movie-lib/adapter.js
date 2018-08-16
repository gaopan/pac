import common from './common.js'

function AdapterFactory() {
  var adapter = {};

  function parseTransitions(transitions) {
    var trans = [];
    transitions.forEach(function(d) {
      var duration = { avg: null, max: null, min: null, med: null },
        count = { act: null, max: null, case: null };
      if (common.isNumber(d.duration)) {
        duration.avg = d.duration;
      } else if (d.aggregation && common.isObject(d.aggregation)) {
        if (common.isNumber(d.aggregation.duration)) {
          duration.avg = d.aggregation.duration;
        } else if (common.isObject(d.aggregation.duration)) {
          duration.avg = d.aggregation.duration.average;
          duration.max = d.aggregation.duration.max;
          duration.min = d.aggregation.duration.min;
          duration.med = d.aggregation.duration.median;
        }
      }
      for (var k in duration) {
        if (duration.hasOwnProperty(k)) {
          duration[k + 'Str'] = common.convertDurationToStr(duration[k]);
        }
      }
      if (common.isNumber(d.count)) {
        count.act = d.count;
      } else if (d.aggregation && common.isObject(d.aggregation)) {
        if (common.isNumber(d.aggregation.count)) {
          count.act = d.aggregation.count;
        } else if (common.isObject(d.aggregation.count)) {
          count.act = d.aggregation.count.activity;
          count.max = d.aggregation.count.traceMax;
          count.case = d.aggregation.count.trace;
        }
      }
      for (var k in count) {
        if (count.hasOwnProperty(k)) {
          count[k + 'Str'] = common.convertCountToStr(count[k]);
        }
      }
      var transName = d.name;
      if(d.nodeType == "START") {
        transName = "Start Process";
      } else if(d.nodeType == "END") {
        transName = "End Process";
      }
      trans.push({
        id: d.id,
        name: transName,
        addon: {
          duration: duration,
          count: count
        },
        nodeType: d.nodeType,
        isStart: d.nodeType == 'START',
        isEnd: d.nodeType == 'END',
        isMiddle: d.nodeType == 'MIDDLE',
        isTransition: true,
        position: { x: 0, y: 0 },
        size: { w: 0, h: 0 }
      });
    });
    return {
      transitions: trans
    };
  }

  function parseNewCases(newCases){
    var cases = [];

    newCases.forEach(function(c){
      cases.push({
        connection: c.connection,
        date: c.date,
        dist: c.dist
      });
    });

    return cases;
  }

  function parseConnections(connections) {
    var conns = [];
    connections.forEach(function(d) {
      var duration = { avg: null, max: null, min: null, med: null },
        count = { act: null, max: null, case: null };
      if (common.isNumber(d.duration)) {
        duration.avg = d.duration;
      } else if (d.aggregation && common.isObject(d.aggregation)) {
        if (common.isNumber(d.aggregation.duration)) {
          duration.avg = d.aggregation.duration;
        } else if (common.isObject(d.aggregation.duration)) {
          duration.avg = d.aggregation.duration.average;
          duration.max = d.aggregation.duration.max;
          duration.min = d.aggregation.duration.min;
          duration.med = d.aggregation.duration.median;
        }
      }
      for (var k in duration) {
        if (duration.hasOwnProperty(k)) {
          duration[k + 'Str'] = common.convertDurationToStr(duration[k]);
        }
      }
      if (common.isNumber(d.count)) {
        count.act = d.count;
      } else if (d.aggregation && common.isObject(d.aggregation)) {
        if (common.isNumber(d.aggregation.count)) {
          count.act = d.aggregation.count;
        } else if (common.isObject(d.aggregation.count)) {
          count.act = d.aggregation.count.activity;
          count.max = d.aggregation.count.traceMax;
          count.case = d.aggregation.count.trace;
        }
      }
      for (var k in count) {
        if (count.hasOwnProperty(k)) {
          count[k + 'Str'] = common.convertCountToStr(count[k]);
        }
      }
      conns.push({
        id: d.id,
        isConnection: true,
        addon: {
          duration: duration,
          count: count
        },
        source: d.source,
        target: d.target
      });
    });
    return {
      connections: conns
    };
  }

  adapter.adaptData = function(data, opts) {
    // if (!data || (!data.processMap && !data.processGraph)) {
    //   return null;
    // }
    // var theData = data.processMap || data.processGraph;

    var resData = [];
    data.forEach(function(d) {
      var theData = d;
      var chartName = data.name;

      var transitionRes = parseTransitions(theData.transitions);
      var connectionRes = parseConnections(theData.connections);
      var newCases = parseNewCases(theData.newCases);

      var fuzzySign = "(FUZZY)";
      if (common.isString(chartName) && chartName.indexOf(fuzzySign) > 0) {
        if (chartName.indexOf(fuzzySign) == chartName.length - fuzzySign.length) {
          chartName = chartName.substr(0, chartName.length - fuzzySign.length);
        }
      }
      resData.push({
        connections: connectionRes.connections,
        transitions: transitionRes.transitions,
        newCases: newCases,
        date: d.date
      });
    });


    return {
      title: "",
      data: resData
    };
  };

  return adapter;
}

export default AdapterFactory();
