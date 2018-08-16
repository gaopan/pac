import common from './common.js'

let ColorGenerator = common.ColorGenerator

function AdapterFactory() {
  var adapter = {};

  function parseTransitions(transitions) {
    var trans = [], start = null, end = null;
    transitions.forEach(function(d) {
      var duration = { avg: null, max: null, min: null, med: null, dev: null },
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
          duration.dev = d.aggregation.duration.deviation;
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
      var newTrans = {
        id: d.id,
        name: d.name,
        addon: {
          duration: duration,
          count: count
        },
        nodeType: d.nodeType,
        isStart: d.nodeType == 'START',
        isEnd: d.nodeType == 'END',
        isMiddle: d.nodeType != 'START' && d.nodeType != 'END',
        isTransition: true,
        position: { x: 0, y: 0 },
        size: { w: 0, h: 0 },
        virtual: d.virtual,
        commentCount: d.commentCount
      };
      if(newTrans.isStart) {
        start = newTrans;
      } else if(newTrans.isEnd) {
        end = newTrans;
      }
      trans.push(newTrans);
    });
    return {
      transitions: trans,
      start: start,
      end: end
    };
  }

  function parseConnections(connections) {
    var conns = [],
      happyPaths = [],
      happyPathPrefix = 'happyPath_';
    connections.forEach(function(d) {
      var duration = { avg: null, max: null, min: null, med: null },
        count = { act: null, max: null, case: null },
        metadata = { happyPaths: [] };
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
          duration.dev = d.aggregation.duration.deviation;
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
      if (common.isObject(d.metadata)) {
        for (var k in d.metadata) {
          if (d.metadata.hasOwnProperty(k)) {
            if (k.indexOf(happyPathPrefix) == 0) {
              var happyPath = k.substr(happyPathPrefix.length);
              if (happyPaths.indexOf(happyPath) < 0) {
                happyPaths.push(happyPath);
              }
              if((common.isString(d.metadata[k]) && d.metadata[k].toUpperCase() == 'TRUE')
                || (common.isBoolean(d.metadata[k]) && d.metadata[k])) {
                metadata.happyPaths.push(happyPath);
              }
            }
          }
        }
      }
      conns.push({
        id: d.id,
        isConnection: true,
        addon: {
          duration: duration,
          count: count
        },
        sourceLabel: d.sourceLabel,
        targetLabel: d.targetLabel,
        source: d.sourceId,
        target: d.targetId,
        sourceId: d.sourceId,
        targetId: d.targetId,
        _metadata: d.metadata,
        metadata: metadata
      });
    });
    happyPaths.sort(function(a, b) {
      return a.localeCompare(b);
    });
    return {
      connections: conns,
      happyPaths: happyPaths.map(function(hp) {
        return {
          name: hp,
          color: ColorGenerator.purchase(hp)
        };
      })
    };
  }

  function renameForStartAndEnd(startTrans, endTrans, connections){
    var startName = '开始', endName = '结束';
    connections.forEach(function(c){
      if(c.sourceLabel == startTrans.name) {
        c.sourceLabel = startName;
      }
      if(c.targetLabel == endTrans.name) {
        c.targetLabel = endName;
      }
    });
    startTrans.name = startName;
    endTrans.name = endName;
  }

  adapter.adaptData = function(data, opts) {
    // if (!data || !data.processMap) {
    //   return null;
    // }
    if (!data || (!data.processMap && !data.processGraph)) {
      return { data: null };
    }
    var theData = data.processMap || data.processGraph;
    var chartName = data.name;

    var transitionRes = parseTransitions(theData.transitions);
    var connectionRes = parseConnections(theData.connections);

    var fuzzySign = "(FUZZY)";
    if (common.isString(chartName) && chartName.indexOf(fuzzySign) > 0) {
      if (chartName.indexOf(fuzzySign) == chartName.length - fuzzySign.length) {
        chartName = chartName.substr(0, chartName.length - fuzzySign.length);
      }
    }

    var transitions = transitionRes.transitions,
      connections = connectionRes.connections,
      happyPaths = connectionRes.happyPaths;

    renameForStartAndEnd(transitionRes.start, transitionRes.end, connections);

    transitions.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

    connections.sort(function(a, b) {
      return a.sourceLabel.localeCompare(b.sourceLabel);
    });

    return {
      data: {
        title: chartName,
        id: data.id,
        name: chartName,
        transitions: transitions,
        connections: connections,
        happyPaths: happyPaths
      }
    };
  };

  return adapter;
}

export default AdapterFactory();
