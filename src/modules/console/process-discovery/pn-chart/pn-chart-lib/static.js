var fnCheckHighlightLevel = function(value, max, min) {
	if(value == max) return 4;
  if(value == 0) return 0;
  if(value == min) return 0;
  return max == min ? 0 : (Math.ceil((value - min) / (max - min) * 5) - 1);
};
var fnCaculateStaticData = function(transitions, connections) {
  var res = {
    transaction: {
      absoluteFrequency: {
        activity: { max: 0, min: 0 },
        connection: { max: 0, min: 0 }
      },
      caseFrequency: {
        activity: { max: 0, min: 0 },
        connection: { max: 0, min: 0 }
      },
      maximumRepetitions: {
        activity: { max: 0, min: 0 },
        connection: { max: 0, min: 0 }
      }
    },
    duration: {
      average: {
        none: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        },
        absoluteFrequency: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        },
        caseFrequency: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        }
      },
      median: {
        none: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        },
        absoluteFrequency: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        },
        caseFrequency: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        }
      },
      maximum: {
        none: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        }
      },
      minimum: {
        none: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        }
      },
      deviation: {
        none: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        },
        absoluteFrequency: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        },
        caseFrequency: {
          activity: { max: 0, min: 0 },
          connection: { max: 0, min: 0 }
        }
      }
    }
  };

  var maxTransAct = 0,
    minTransAct = Infinity,
    maxTransCase = 0,
    minTransCase = Infinity,
    maxTransMax = 0,
    minTransMax = Infinity,

    maxTransDurationAvgNone = 0,
    minTransDurationAvgNone = Infinity,
    maxTransDurationAvgAbs = 0,
    minTransDurationAvgAbs = Infinity,
    maxTransDurationAvgCase = 0,
    minTransDurationAvgCase = Infinity,

    maxTransDurationMedNone = 0,
    minTransDurationMedNone = Infinity,
    maxTransDurationMedAbs = 0,
    minTransDurationMedAbs = Infinity,
    maxTransDurationMedCase = 0,
    minTransDurationMedCase = Infinity,

    maxTransDurationMaxNone = 0,
    minTransDurationMaxNone = Infinity,

    maxTransDurationMinNone = 0,
    minTransDurationMinNone = Infinity,

    maxTransDurationDevNone = 0,
    minTransDurationDevNone = Infinity,
    maxTransDurationDevAbs = 0,
    minTransDurationDevAbs = Infinity,
    maxTransDurationDevCase = 0,
    minTransDurationDevCase = Infinity,

    sumTransAct = 0,
    sumTransCase = 0,
    sumTransMax, sumTransDurationAvg = 0,
    sumTransDurationMed = 0,
    sumTransDurationMax = 0,
    sumTransDurationMin = 0,
    sumTransDurationDev = 0;
  transitions.forEach(function(t) {
  	if(t.isStart || t.isEnd) return;
    var act = t.addon.count.act || 0,
      cas = t.addon.count.case || 0,
      max = t.addon.count.max || 0,
      dAvg = t.addon.duration.avg || 0,
      dMed = t.addon.duration.med || 0,
      dMax = t.addon.duration.max || 0,
      dMin = t.addon.duration.min || 0,
      dDev = t.addon.duration.dev || 0;

    sumTransAct += act;
    sumTransCase += cas;
    sumTransMax += max;
    sumTransDurationAvg += dAvg;
    sumTransDurationMed += dMed;
    sumTransDurationMax += dMax;
    sumTransDurationMin += dMin;
    sumTransDurationDev += dDev;

    if (act > maxTransAct) {
      maxTransAct = act;
    }
    if (act < minTransAct) {
      minTransAct = act;
    }
    if (cas > maxTransCase) {
      maxTransCase = cas;
    }
    if (cas < minTransCase) {
      minTransCase = cas;
    }
    if (max > maxTransMax) {
      maxTransMax = max;
    }
    if (max < minTransMax) {
      minTransMax = max;
    }

    if (dAvg > maxTransDurationAvgNone) {
      maxTransDurationAvgNone = dAvg;
    }
    if (dAvg < minTransDurationAvgNone) {
      minTransDurationAvgNone = dAvg;
    }
    if (dMed > maxTransDurationMedNone) {
      maxTransDurationMedNone = dMed;
    }
    if (dMed < minTransDurationMedNone) {
      minTransDurationMedNone = dMed;
    }
    if (dMax > maxTransDurationMaxNone) {
      maxTransDurationMaxNone = dMax;
    }
    if (dMax < minTransDurationMaxNone) {
      minTransDurationMaxNone = dMax;
    }
    if (dMin > maxTransDurationMinNone) {
      maxTransDurationMinNone = dMin;
    }
    if (dMin < minTransDurationMinNone) {
      minTransDurationMinNone = dMin;
    }
    if (dDev > maxTransDurationDevNone) {
      maxTransDurationDevNone = dDev;
    }
    if (dDev < minTransDurationDevNone) {
      minTransDurationDevNone = dDev;
    }
  });
  transitions.forEach(function(t) {
  	if(t.isStart || t.isEnd) return;
    var act = t.addon.count.act || 0,
      cas = t.addon.count.case || 0,
      max = t.addon.count.max || 0,
      dAvg = t.addon.duration.avg || 0,
      dMed = t.addon.duration.med || 0,
      dMax = t.addon.duration.max || 0,
      dMin = t.addon.duration.min || 0,
      dDev = t.addon.duration.dev || 0;

    var dAvgAbs = t.addon.duration.avgByAbs = act / sumTransAct * dAvg,
      dAvgCase = t.addon.duration.avgByCase = cas / sumTransCase * dAvg,
      dMedAbs = t.addon.duration.medByAbs = act / sumTransAct * dMed,
      dMedCase = t.addon.duration.medByCase = cas / sumTransCase * dMed,
      dDevAbs = t.addon.duration.devByAbs = act / sumTransAct * dDev,
      dDevCase = t.addon.duration.devByCase = cas / sumTransCase * dDev;

    if (dAvgAbs > maxTransDurationAvgAbs) {
      maxTransDurationAvgAbs = dAvgAbs;
    }
    if (dAvgAbs < minTransDurationAvgAbs) {
      minTransDurationAvgAbs = dAvgAbs;
    }
    if (dAvgCase > maxTransDurationAvgCase) {
      maxTransDurationAvgCase = dAvgCase;
    }
    if (dAvgCase < minTransDurationAvgCase) {
      minTransDurationAvgCase = dAvgCase;
    }

    if (dMedAbs > maxTransDurationMedAbs) {
      maxTransDurationMedAbs = dMedAbs;
    }
    if (dMedAbs < minTransDurationMedAbs) {
      minTransDurationMedAbs = dMedAbs;
    }
    if (dMedCase > maxTransDurationMedCase) {
      maxTransDurationMedCase = dMedCase;
    }
    if (dMedCase < minTransDurationMedCase) {
      minTransDurationMedCase = dMedCase;
    }

    if (dDevAbs > maxTransDurationDevAbs) {
      maxTransDurationDevAbs = dDevAbs;
    }
    if (dDevAbs < minTransDurationDevAbs) {
      minTransDurationDevAbs = dDevAbs;
    }
    if (dDevCase > maxTransDurationDevCase) {
      maxTransDurationDevCase = dDevCase;
    }
    if (dDevCase < minTransDurationDevCase) {
      minTransDurationDevCase = dDevCase;
    }
  });
  transitions.forEach(function(t) {
  	if(t.isStart || t.isEnd) return;
    var act = t.addon.count.act || 0,
      cas = t.addon.count.case || 0,
      max = t.addon.count.max || 0,
      dAvg = t.addon.duration.avg || 0,
      dMed = t.addon.duration.med || 0,
      dMax = t.addon.duration.max || 0,
      dMin = t.addon.duration.min || 0,
      dDev = t.addon.duration.dev || 0,
      dAvgAbs = t.addon.duration.avgByAbs,
      dAvgCase = t.addon.duration.avgByCase,
      dMedAbs = t.addon.duration.medByAbs,
      dMedCase = t.addon.duration.medByCase,
      dDevAbs = t.addon.duration.devByAbs,
      dDevCase = t.addon.duration.devByCase;
    t.highlightLevel = {
      count: {
        abs: fnCheckHighlightLevel(act, maxTransAct, minTransAct),
        'case': fnCheckHighlightLevel(cas, maxTransCase, minTransCase),
        max: fnCheckHighlightLevel(max, maxTransMax, minTransMax)
      },
      duration: {
        avg: fnCheckHighlightLevel(dAvg, maxTransDurationAvgNone, minTransDurationAvgNone),
        med: fnCheckHighlightLevel(dMed, maxTransDurationMedNone, minTransDurationMedNone),
        max: fnCheckHighlightLevel(dMax, maxTransDurationMaxNone, minTransDurationMaxNone),
        min: fnCheckHighlightLevel(dMin, maxTransDurationMinNone, minTransDurationMinNone),
        dev: fnCheckHighlightLevel(dDev, maxTransDurationDevNone, minTransDurationDevNone),
        avgByAbs: fnCheckHighlightLevel(dAvgAbs, maxTransDurationAvgAbs, minTransDurationAvgAbs),
        avgByCase: fnCheckHighlightLevel(dAvgCase, maxTransDurationAvgCase, minTransDurationAvgCase),
        medByAbs: fnCheckHighlightLevel(dMedAbs, maxTransDurationMedAbs, minTransDurationMedAbs),
        medByCase: fnCheckHighlightLevel(dMedCase, maxTransDurationMedCase, minTransDurationMedCase),
        devByAbs: fnCheckHighlightLevel(dDevAbs, maxTransDurationDevAbs, minTransDurationDevAbs),
        devByCase: fnCheckHighlightLevel(dDevCase, maxTransDurationDevCase, minTransDurationDevCase)
      }
    };
  });

  var maxConnAct = 0,
    minConnAct = Infinity,
    maxConnCase = 0,
    minConnCase = Infinity,
    maxConnMax = 0,
    minConnMax = Infinity,

    maxConnDurationAvgNone = 0,
    minConnDurationAvgNone = Infinity,
    maxConnDurationAvgAbs = 0,
    minConnDurationAvgAbs = Infinity,
    maxConnDurationAvgCase = 0,
    minConnDurationAvgCase = Infinity,

    maxConnDurationMedNone = 0,
    minConnDurationMedNone = Infinity,
    maxConnDurationMedAbs = 0,
    minConnDurationMedAbs = Infinity,
    maxConnDurationMedCase = 0,
    minConnDurationMedCase = Infinity,

    maxConnDurationMaxNone = 0,
    minConnDurationMaxNone = Infinity,

    maxConnDurationMinNone = 0,
    minConnDurationMinNone = Infinity,

    maxConnDurationDevNone = 0,
    minConnDurationDevNone = Infinity,
    maxConnDurationDevAbs = 0,
    minConnDurationDevAbs = Infinity,
    maxConnDurationDevCase = 0,
    minConnDurationDevCase = Infinity,

    sumConnAct = 0,
    sumConnCase = 0,
    sumConnMax, sumConnDurationAvg = 0,
    sumConnDurationMed = 0,
    sumConnDurationMax = 0,
    sumConnDurationMin = 0,
    sumConnDurationDev = 0;
  connections.forEach(function(c) {
  	if(c.isStart || c.isEnd) return;
    var act = c.addon.count.act || 0,
      cas = c.addon.count.case || 0,
      max = c.addon.count.max || 0,
      dAvg = c.addon.duration.avg || 0,
      dMed = c.addon.duration.med || 0,
      dMax = c.addon.duration.max || 0,
      dMin = c.addon.duration.min || 0,
      dDev = c.addon.duration.dev || 0;

    sumConnAct += act;
    sumConnCase += cas;
    sumConnMax += max;
    sumConnDurationAvg += dAvg;
    sumConnDurationMed += dMed;
    sumConnDurationMax += dMax;
    sumConnDurationMin += dMin;
    sumConnDurationDev += dDev;
    if (act > maxConnAct) {
      maxConnAct = act;
    }
    if (act < minConnAct) {
      minConnAct = act;
    }
    if (cas > maxConnCase) {
      maxConnCase = cas;
    }
    if (cas < minConnCase) {
      minConnCase = cas;
    }
    if (max > maxConnMax) {
      maxConnMax = max;
    }
    if (max < minConnMax) {
      minConnMax = max;
    }

    if (dAvg > maxConnDurationAvgNone) {
      maxConnDurationAvgNone = dAvg;
    }
    if (dAvg < minConnDurationAvgNone) {
      minConnDurationAvgNone = dAvg;
    }
    if (dMed > maxConnDurationMedNone) {
      maxConnDurationMedNone = dMed;
    }
    if (dMed < minConnDurationMedNone) {
      minConnDurationMedNone = dMed;
    }
    if (dMax > maxConnDurationMaxNone) {
      maxConnDurationMaxNone = dMax;
    }
    if (dMax < minConnDurationMaxNone) {
      minConnDurationMaxNone = dMax;
    }
    if (dMin > maxConnDurationMinNone) {
      maxConnDurationMinNone = dMin;
    }
    if (dMin < minConnDurationMinNone) {
      minConnDurationMinNone = dMin;
    }
    if (dDev > maxConnDurationDevNone) {
      maxConnDurationDevNone = dDev;
    }
    if (dDev < minConnDurationDevNone) {
      minConnDurationDevNone = dDev;
    }
  });
  connections.forEach(function(c) {
    var act = c.addon.count.act || 0,
      cas = c.addon.count.case || 0,
      max = c.addon.count.max || 0,
      dAvg = c.addon.duration.avg || 0,
      dMed = c.addon.duration.med || 0,
      dMax = c.addon.duration.max || 0,
      dMin = c.addon.duration.min || 0,
      dDev = c.addon.duration.dev || 0;

    var dAvgAbs = c.addon.duration.avgByAbs = sumConnAct * dAvg == 0 ? 0 : (act / sumConnAct * dAvg),
      dAvgCase = c.addon.duration.avgByCase = sumConnCase * dAvg == 0 ? 0 : (cas / sumConnCase * dAvg),
      dMedAbs = c.addon.duration.medByAbs = sumConnAct * dMed == 0 ? 0 : (act / sumConnAct * dMed),
      dMedCase = c.addon.duration.medByCase = sumConnCase * dMed == 0 ? 0 : (cas / sumConnCase * dMed),
      dDevAbs = c.addon.duration.devByAbs = sumConnAct * dDev == 0 ? 0 : (act / sumConnAct * dDev),
      dDevCase = c.addon.duration.devByCase = sumConnCase * dDev == 0 ? 0 : (cas / sumConnCase * dDev);

    if(c.isStart || c.isEnd) return;

    if (dAvgAbs > maxConnDurationAvgAbs) {
      maxConnDurationAvgAbs = dAvgAbs;
    }
    if (dAvgAbs < minConnDurationAvgAbs) {
      minConnDurationAvgAbs = dAvgAbs;
    }
    if (dAvgCase > maxConnDurationAvgCase) {
      maxConnDurationAvgCase = dAvgCase;
    }
    if (dAvgCase < minConnDurationAvgCase) {
      minConnDurationAvgCase = dAvgCase;
    }

    if (dMedAbs > maxConnDurationMedAbs) {
      maxConnDurationMedAbs = dMedAbs;
    }
    if (dMedAbs < minConnDurationMedAbs) {
      minConnDurationMedAbs = dMedAbs;
    }
    if (dMedCase > maxConnDurationMedCase) {
      maxConnDurationMedCase = dMedCase;
    }
    if (dMedCase < minConnDurationMedCase) {
      minConnDurationMedCase = dMedCase;
    }

    if (dDevAbs > maxConnDurationDevAbs) {
      maxConnDurationDevAbs = dDevAbs;
    }
    if (dDevAbs < minConnDurationDevAbs) {
      minConnDurationDevAbs = dDevAbs;
    }
    if (dDevCase > maxConnDurationDevCase) {
      maxConnDurationDevCase = dDevCase;
    }
    if (dDevCase < minConnDurationDevCase) {
      minConnDurationDevCase = dDevCase;
    }
  });
  connections.forEach(function(t) {
    var act = t.addon.count.act || 0,
      cas = t.addon.count.case || 0,
      max = t.addon.count.max || 0,
      dAvg = t.addon.duration.avg || 0,
      dMed = t.addon.duration.med || 0,
      dMax = t.addon.duration.max || 0,
      dMin = t.addon.duration.min || 0,
      dDev = t.addon.duration.dev || 0,
      dAvgAbs = t.addon.duration.avgByAbs,
      dAvgCase = t.addon.duration.avgByCase,
      dMedAbs = t.addon.duration.medByAbs,
      dMedCase = t.addon.duration.medByCase,
      dDevAbs = t.addon.duration.devByAbs,
      dDevCase = t.addon.duration.devByCase;
    t.highlightLevel = {
      count: {
        abs: fnCheckHighlightLevel(act, maxConnAct, minConnAct),
        'case': fnCheckHighlightLevel(cas, maxConnCase, minConnCase),
        max: fnCheckHighlightLevel(max, maxConnMax, minConnMax)
      },
      duration: {
        avg: fnCheckHighlightLevel(dAvg, maxConnDurationAvgNone, minConnDurationAvgNone),
        med: fnCheckHighlightLevel(dMed, maxConnDurationMedNone, minConnDurationMedNone),
        max: fnCheckHighlightLevel(dMax, maxConnDurationMaxNone, minConnDurationMaxNone),
        min: fnCheckHighlightLevel(dMin, maxConnDurationMinNone, minConnDurationMinNone),
        dev: fnCheckHighlightLevel(dDev, maxConnDurationDevNone, minConnDurationDevNone),
        avgByAbs: fnCheckHighlightLevel(dAvgAbs, maxConnDurationAvgAbs, minConnDurationAvgAbs),
        avgByCase: fnCheckHighlightLevel(dAvgCase, maxConnDurationAvgCase, minConnDurationAvgCase),
        medByAbs: fnCheckHighlightLevel(dMedAbs, maxConnDurationMedAbs, minConnDurationMedAbs),
        medByCase: fnCheckHighlightLevel(dMedCase, maxConnDurationMedCase, minConnDurationMedCase),
        devByAbs: fnCheckHighlightLevel(dDevAbs, maxConnDurationDevAbs, minConnDurationDevAbs),
        devByCase: fnCheckHighlightLevel(dDevCase, maxConnDurationDevCase, minConnDurationDevCase)
      }
    };
  });

  res.transaction.absoluteFrequency.activity.max = maxTransAct;
  res.transaction.caseFrequency.activity.max = maxTransCase;
  res.transaction.maximumRepetitions.activity.max = maxTransMax;
  res.transaction.absoluteFrequency.activity.min = minTransAct;
  res.transaction.caseFrequency.activity.min = minTransCase;
  res.transaction.maximumRepetitions.activity.min = minTransMax;

  res.transaction.absoluteFrequency.connection.max = maxConnAct;
  res.transaction.caseFrequency.connection.max = maxConnCase;
  res.transaction.maximumRepetitions.connection.max = maxConnMax;
  res.transaction.absoluteFrequency.connection.min = minConnAct;
  res.transaction.caseFrequency.connection.min = minConnCase;
  res.transaction.maximumRepetitions.connection.min = minConnMax;

  // Activity Max
  res.duration.average.none.activity.max = maxTransDurationAvgNone;
  res.duration.average.absoluteFrequency.activity.max = maxTransDurationAvgAbs;
  res.duration.average.caseFrequency.activity.max = maxTransDurationAvgCase;
  res.duration.median.none.activity.max = maxTransDurationMedNone;
  res.duration.median.absoluteFrequency.activity.max = maxTransDurationMedAbs;
  res.duration.median.caseFrequency.activity.max = maxTransDurationMedCase;
  res.duration.deviation.none.activity.max = maxTransDurationDevNone;
  res.duration.deviation.absoluteFrequency.activity.max = maxTransDurationDevAbs;
  res.duration.deviation.caseFrequency.activity.max = maxTransDurationDevCase;
  res.duration.maximum.none.activity.max = maxTransDurationMaxNone;
  res.duration.minimum.none.activity.max = maxTransDurationMinNone;
  // Activity Min
  res.duration.average.none.activity.min = minTransDurationAvgNone;
  res.duration.average.absoluteFrequency.activity.min = minTransDurationAvgAbs;
  res.duration.average.caseFrequency.activity.min = minTransDurationAvgCase;
  res.duration.median.none.activity.min = minTransDurationMedNone;
  res.duration.median.absoluteFrequency.activity.min = minTransDurationMedAbs;
  res.duration.median.caseFrequency.activity.min = minTransDurationMedCase;
  res.duration.deviation.none.activity.min = minTransDurationDevNone;
  res.duration.deviation.absoluteFrequency.activity.min = minTransDurationDevAbs;
  res.duration.deviation.caseFrequency.activity.min = minTransDurationDevCase;
  res.duration.maximum.none.activity.min = minTransDurationMaxNone;
  res.duration.minimum.none.activity.min = minTransDurationMinNone;

  res.duration.average.none.connection.max = maxConnDurationAvgNone;
  res.duration.average.absoluteFrequency.connection.max = maxConnDurationAvgAbs;
  res.duration.average.caseFrequency.connection.max = maxConnDurationAvgCase;
  res.duration.median.none.connection.max = maxConnDurationMedNone;
  res.duration.median.absoluteFrequency.connection.max = maxConnDurationMedAbs;
  res.duration.median.caseFrequency.connection.max = maxConnDurationMedCase;
  res.duration.deviation.none.connection.max = maxConnDurationDevNone;
  res.duration.deviation.absoluteFrequency.connection.max = maxConnDurationDevAbs;
  res.duration.deviation.caseFrequency.connection.max = maxConnDurationDevCase;
  res.duration.maximum.none.connection.max = maxConnDurationMaxNone;
  res.duration.minimum.none.connection.max = maxConnDurationMinNone;

  res.duration.average.none.connection.min = minConnDurationAvgNone;
  res.duration.average.absoluteFrequency.connection.min = minConnDurationAvgAbs;
  res.duration.average.caseFrequency.connection.min = minConnDurationAvgCase;
  res.duration.median.none.connection.min = minConnDurationMedNone;
  res.duration.median.absoluteFrequency.connection.min = minConnDurationMedAbs;
  res.duration.median.caseFrequency.connection.min = minConnDurationMedCase;
  res.duration.deviation.none.connection.min = minConnDurationDevNone;
  res.duration.deviation.absoluteFrequency.connection.min = minConnDurationDevAbs;
  res.duration.deviation.caseFrequency.connection.min = minConnDurationDevCase;
  res.duration.maximum.none.connection.min = minConnDurationMaxNone;
  res.duration.minimum.none.connection.min = minConnDurationMinNone;

  return res;
};

function Static(connections, transitions) {
  this._connections = connections;
  this._transitions = transitions;
  this.data = fnCaculateStaticData(transitions, connections);
}

Static.prototype.getData = function() {
  if (!this.data) {
    this.data = fnCaculateStaticData(this._transitions, this._connections);
  }
  return this.data;
};


export default Static
