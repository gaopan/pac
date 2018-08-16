import common from './common.js'

function PNMovie(container) {
  this._container = container;
  this._canvas = null;
  this._ctx = null;
  this._frames = [];
  this._currentFrameIndex = 0;
  this._timer = null;
  this._speed = 1000;
  this._isInitializing = false;
  this._initialized = false;
}

PNMovie.prototype.speed = function(speed) {
  if (common.isNumber(speed) && speed > 1000 / 24) {
    this._speed = speed; // milliseconds
  }
  return this;
};

PNMovie.prototype.loaded = function(cb) {
  if (common.isFunction(cb)) {
    this._loaded = cb;
  }
  return this;
};

PNMovie.prototype.playing = function(cb) {
  if (common.isFunction(cb)) {
    this._playing = cb;
  }
  return this;
};

PNMovie.prototype.played = function(cb){
	if (common.isFunction(cb)) {
    this._played = cb;
  }
  return this;
};

PNMovie.prototype.data = function(data) {
  this._data = data;
  return this;
};

PNMovie.prototype.init = function(_opts) {
  this._isInitializing = true;
  // add holder for initialization
  var loadingSpinner = this.loadingSpinner;
  if (!this.loadingSpinner) {
    loadingSpinner = this.loadingSpinner = document.createElement("div");
    loadingSpinner.innerHTML = "Initializing ... ";
    loadingSpinner.className = "pnp-loading";
    this._container.appendChild(loadingSpinner);
  } else {
    loadingSpinner.style.display = "block";
  }

  this._opts = Object.assign({
    viewType: 0, // 0: Both Transition and duration, 1: Transition, 2: Duration
    padding: 10,
    controlBar: true
  }, _opts);
  var w = this._w = this._container.clientWidth,
    h = this._h = this._container.clientHeight;
  var canvas = this._canvas = document.createElement("canvas");
  canvas.id = common.UUIDGenerator.purchase();
  canvas.width = w;
  canvas.height = h;

  if (!canvas.getContext) {
    this._container.innerHTML = "Your brower does not support Canvas.";
    return this;
  }
  this._container.appendChild(canvas);
  this._ctx = canvas.getContext("2d");

  // load
  this.load();
  this._isInitializing = false;
  loadingSpinner.innerHTML = "Initialized.";

  return this;
};

PNMovie.prototype.load = function() {
  var self = this;
  var _opts = this._opts;
  var container = this._container,
    data = common.deepClone(this._data),
    id = _opts.id || common.UUIDGenerator.purchase(),
    w = this._container.clientWidth,
    h = this._container.clientHeight,
    title = _opts.title,
    vt = 1,
    nodeW = 90,
    nodeH = 18,
    minCellX = 200,
    minCellY = 18 * 3,
    showTitle = !!_opts.showTitle,
    titleH = 0,
    containerScale = 1,
    containerSize = { w: w, h: h },
    containerPos = { x: 0, y: 0 },
    padding = _opts.padding,
    selfConnRiseHeight = 50,
    maxConnWidth = 8;

  if (showTitle) {
    titleH = 30;
  }

  var fnCorrelateData = function(connections, transitions) {

    connections.forEach(function(c) {
      c.source = common.findItemFromListWithId(transitions, c.source);
      c.target = common.findItemFromListWithId(transitions, c.target);
      c.isStart = c.source.isStart || c.target.isStart;
      c.isEnd = c.source.isEnd || c.target.isEnd;
      if (!c.source.nextNodes) {
        c.source.nextNodes = [c.target];
      } else {
        c.source.nextNodes.push(c.target);
      }
      if (!c.target.previousNodes) {
        c.target.previousNodes = [c.source];
      } else {
        c.target.previousNodes.push(c.source);
      }
    });
    var startTransition = null,
      endTransition = null;
    transitions.forEach(function(t) {
      if (t.isStart) {
        startTransition = t;
      }
      if (t.isEnd) {
        endTransition = t;
      }
    });

    transitions.forEach(function(t) {
      if (!t.nextNodes) {
        t.nextNodes = [];
      }
      if (!t.previousNodes) {
        t.previousNodes = [];
      }
      if (t.nextNodes.length == 0 && t.previousNodes.length == 0) {
        connections.push({
          id: common.UUIDGenerator.purchase(),
          isConnection: true,
          source: startTransition,
          target: t,
          addon: { duration: {}, count: {} }
        });
        connections.push({
          id: common.UUIDGenerator.purchase(),
          isConnection: true,
          source: t,
          target: endTransition,
          addon: { duration: {}, count: {} }
        });
        if (!startTransition.nextNodes) {
          startTransition.nextNodes = [t];
        } else {
          startTransition.nextNodes.push(t);
        }
        t.previousNodes.push(startTransition);
        if (!endTransition.previousNodes) {
          endTransition.previousNodes = [t];
        } else {
          endTransition.previousNodes.push(t);
        }
        t.nextNodes.push(endTransition);
      } else if (t.previousNodes.length == 0 && t.isMiddle) {
        connections.push({
          id: common.UUIDGenerator.purchase(),
          isConnection: true,
          source: startTransition,
          target: t,
          addon: { duration: {}, count: {} }
        });
        if (!startTransition.nextNodes) {
          startTransition.nextNodes = [t];
        } else {
          startTransition.nextNodes.push(t);
        }
        t.previousNodes.push(startTransition);
      }
    });
  };

  var fnFindTransWithSource = function(transitions, sourceId, excludedTrans) {
    var items = [];
    excludedTrans = excludedTrans || [];
    transitions.forEach(function(n) {
      if (!n.previousNodes || n.previousNodes.length == 0) return;
      var matchedNode = common.findItemFromListWithId(n.previousNodes, sourceId);
      if (matchedNode) {
        // Check if existed in tower
        var existedNode = common.findItemFromListWithId(excludedTrans, n.id);
        // Only use non-existed
        if (!existedNode) {
          items.push(n);
        }
      }
    });
    return items;
  };
  var fnTransItemsWithTarget = function(transitions, targetId, excludedTrans) {
    var items = [];
    excludedTrans = excludedTrans || [];
    transitions.forEach(function(n) {
      if (!n.nextNodes || n.nextNodes.length == 0) return;
      var matchedNode = common.findItemFromListWithId(n.nextNodes, targetId);
      if (matchedNode) {
        // Check if existed in tower
        var existedNode = common.findItemFromListWithId(excludedTrans, n.id);
        // Only use non-existed
        if (!existedNode) {
          items.push(n);
        }
      }
    });
    return items;
  };

  var fnCreateTowerModel = function(connections, transitions) {
    var tower = { levels: [], maxLevelSize: 0, maxLevelLastNodeWidth: 0 },
      oLevels = {},
      existedNodes = [];
    var fnFindEndTrans = function(transitions, excludedTrans) {
      excludedTrans = excludedTrans || [];
      var items = [];
      transitions.forEach(function(t) {
        // if ((!t.nextNodes || t.nextNodes.length == 0) && excludedTrans.indexOf(t) < 0) {
        // if ((t.isEnd || t.nextNodes.length == 0) && excludedTrans.indexOf(t) < 0) {
        if (t.isEnd && excludedTrans.indexOf(t) < 0) {
          t.name = "End Process";
          t.isEnd = true;
          t.level = Infinity;
          t.order = items.length;
          items.push(t);
        }
      });
      return items;
    };

    var fnFindStartTrans = function(transitions, excludedTrans) {
      excludedTrans = excludedTrans || [];
      var items = [];
      transitions.forEach(function(t) {
        // if (!t.previousNodes || t.previousNodes.length == 0) {
        if (t.isStart && excludedTrans.indexOf(t) < 0) {
          t.name = "Start Process";
          t.isStart = true;
          t.level = 0;
          t.order = items.length;
          items.push(t);
        }
      });
      return items;
    };

    var fnHandleLevelItems = function() {
      var items = [];
      lastLevelItems.forEach(function(n) {
        var theItems = fnFindTransWithSource(transitions, n.id, existedNodes);
        theItems.forEach(function(d) {
          // Check if existed in the items
          var existedNodeInItems = common.findItemFromListWithId(items, d.id);
          if (!existedNodeInItems) {
            items.push(d);
          }
        });
      });
      lastLevelItems = items.slice(0, items.length);
      var fnInflateLevel = function(theItems, theLevel) {
        if (theItems && theItems.length > 0) {
          oLevels[theLevel] = theItems;
          existedNodes = existedNodes.concat(theItems);
          l++;
        }
      };
      var fnDeleteProperties = function(theItems) {
        theItems.forEach(function(item) {
          delete item.previousNodesOnSameLevel;
          delete item.nextNodesOnSameLevel;
        });
        return theItems;
      };
      var _fnHandleLevelItems = function(theItems, theLevel) {
        for (var i = 0; i < theItems.length; i++) {
          var theItem = theItems[i];
          if (!theItem.nextNodesOnSameLevel) {
            theItem.nextNodesOnSameLevel = [];
          }
          if (!theItem.previousNodesOnSameLevel) {
            theItem.previousNodesOnSameLevel = [];
          }
          for (var j = 0; j < theItems.length; j++) {
            if (i == j) continue;
            var anotherItem = theItems[j];
            if (!anotherItem.nextNodesOnSameLevel) {
              anotherItem.nextNodesOnSameLevel = [];
            }
            if (!anotherItem.previousNodesOnSameLevel) {
              anotherItem.previousNodesOnSameLevel = [];
            }
            if (theItem.nextNodes.indexOf(anotherItem) > -1) {
              theItem.nextNodesOnSameLevel.push(anotherItem);
              anotherItem.previousNodesOnSameLevel.push(theItem);
            }
            if (theItem.previousNodes.indexOf(anotherItem) > -1) {
              theItem.previousNodesOnSameLevel.push(anotherItem);
              anotherItem.nextNodesOnSameLevel.push(theItem);
            }
          }
        }
        var previousNodesCountArray = theItems.map(function(d) {
          return d.previousNodesOnSameLevel.length;
        });
        var maxPreviousNodesCount = Math.max.apply(this, previousNodesCountArray);
        if (maxPreviousNodesCount <= 0) {
          fnInflateLevel(fnDeleteProperties(theItems), theLevel);
          return;
        }
        var minPreviousNodesCount = Math.min.apply(this, previousNodesCountArray);
        var remainItems = [],
          restItems = [];
        if (minPreviousNodesCount > 0) {
          var itemWeightArray = theItems.map(function(d) {
            return d.addon.count.act || 0;
          });
          var maxItemWeight = Math.max.apply(this, itemWeightArray);
          var remainItemIndex = itemWeightArray.indexOf(maxItemWeight);
          remainItems = [theItems[remainItemIndex]];
          theItems.splice(remainItemIndex, 1);
          restItems = theItems;
          // remain the item with bigest weight in current level
          fnInflateLevel(fnDeleteProperties(remainItems), theLevel);
          // handle the rest items
          _fnHandleLevelItems(fnDeleteProperties(restItems), theLevel + 1);
        } else if (minPreviousNodesCount == 0) {
          theItems.forEach(function(item) {
            if (item.previousNodesOnSameLevel.length == 0) {
              remainItems.push(item);
            } else {
              restItems.push(item);
            }
          });
          // select the items whose previousNodesOnSameLevel counts equals 0
          fnInflateLevel(fnDeleteProperties(remainItems), theLevel);
          // For rest items 
          _fnHandleLevelItems(fnDeleteProperties(restItems), theLevel + 1);
        }
      };

      _fnHandleLevelItems(items, l);

      return items.length > 0;
    };

    var aStartTrans = oLevels[0] = fnFindStartTrans(transitions),
      aEndTrans = fnFindEndTrans(transitions);
    var l = 1,
      aItems = null,
      lastLevelItems = aStartTrans;

    existedNodes = existedNodes.concat(aStartTrans, aEndTrans);
    while (fnHandleLevelItems()) {}
    oLevels[l] = aEndTrans;

    var keys = Object.keys(oLevels);
    keys.sort(function(a, b) {
      return parseInt(a) - parseInt(b);
    });
    keys.forEach(function(k) {
      tower.levels.push(oLevels[k]);
      if (tower.maxLevelSize < oLevels[k].length) {
        tower.maxLevelSize = oLevels[k].length;
      }
      oLevels[k].forEach(function(n, index) {
        n.level = tower.levels.length - 1;
        n.order = index;
      });
    });

    return tower;
  };

  var fnSimulateCalculate = function(connections, transitions, tower, availableW, availableH, marginTop, simulatedCellX, simulatedCellY) {
    // Simulate the transition's position
    var maxX = 0;
    transitions.forEach(function(n, i) {
      var levelSize = tower.levels[n.level].length;
      n.position.y = n.level * simulatedCellY + marginTop + titleH;
      n.position.x = (n.order + Math.ceil((tower.maxLevelSize - levelSize) / 2)) * simulatedCellX + padding + maxConnWidth;
      if (maxX < n.position.x) {
        maxX = n.position.x;
      }
    });
    // Simulate the connection's rise height and get rightmost connections count
    var rightMostConnCountWithRiseHeight = 0;
    connections.forEach(function(c) {
      var source = c.source,
        target = c.target;
      if (source.position.x == target.position.x && source.position.x == maxX) {
        if (Math.abs(source.level - target.level) > 1 ||
          (source.level - target.level == 1 &&
            common.findConnectionFromList(connections, target.id, source.id))) {
          rightMostConnCountWithRiseHeight++;
        }
      }
    });

    return {
      rightMostCount: rightMostConnCountWithRiseHeight
    };
  };

  var fnCalculatePositions = function(connections, transitions) {
    var tower = fnCreateTowerModel(connections, transitions);
    var marginTop = padding;
    var availableH = h - titleH - nodeH - marginTop * 2,
      availableW = w - nodeW - padding * 2 - maxConnWidth * 2 - selfConnRiseHeight;
    tower.maxLevelSize = tower.maxLevelSize < 2 ? 2 : tower.maxLevelSize;
    var result = fnSimulateCalculate(connections, transitions, tower, availableW, availableH, marginTop, 100, 100);
    var cellX = tower.maxLevelSize < 2 ? availableW / 2 : (availableW / (tower.maxLevelSize)),
      cellY = tower.levels.length <= 2 ? availableH / 2 : (availableH / (tower.levels.length - 1));
    if (result.rightMostCount < 1) {
      cellX = tower.maxLevelSize <= 2 ? availableW / 2 : (availableW / (tower.maxLevelSize - 1));
    }
    var ratioX = cellX / minCellX,
      ratioY = cellY / minCellY,
      minRatio = Math.min(ratioX, ratioY);
    if (minRatio < 1) {
      containerScale = minRatio;
      var _scale = 1 / minRatio;
      containerSize.w *= _scale;
      containerSize.h *= _scale;
      containerPos.x = w / 2 * (1 - _scale);
      containerPos.y = h / 2 * (1 - _scale);
      availableW *= _scale;
      availableH *= _scale;
      cellX *= _scale;
      cellY *= _scale;
      container.style.width = containerSize.w + "px";
      container.style.height = containerSize.h + "px";
      container.style.left = containerPos.x + "px";
      container.style.top = containerPos.y + "px";
      container.style.transform = "scale(" + minRatio + ")";
    }
    var availableRanges = [];
    for (var i = 0; i < tower.maxLevelSize; i++) {
      availableRanges.push({
        startX: nodeW + padding + maxConnWidth + i * cellX,
        endX: nodeW + padding + maxConnWidth + (i + 1) * cellX
      });
    }

    transitions.forEach(function(n, i) {
      var levelSize = tower.levels[n.level].length;
      n.position.y = n.level * cellY + marginTop + titleH;
      n.position.x = (n.order + Math.ceil((tower.maxLevelSize - levelSize) / 2)) * cellX + padding + maxConnWidth;
      n.size.w = nodeW;
      n.size.h = nodeH;

      var oBox = {
        x: n.position.x,
        y: n.position.y,
        w: n.size.w,
        h: n.size.h
      };
      var aEndPoints = [
        [0, 0],
        [13, 0],
        [0.5, 0],
        [1, 0],
        [0, 0.5],
        [1, 0.5],
        [0, 1],
        [13, 1],
        [0.5, 1],
        [1, 1]
      ];
      n.endPoints = [];
      aEndPoints.forEach(function(p, index) {
        var oEndPoint = {
          x: (p[0] > 1 ? p[0] : (p[0] * oBox.w)) + oBox.x,
          y: p[1] * oBox.h + oBox.y
        };
        n.endPoints.push(oEndPoint);
      });
    });

    var overlapedConns = [];
    // First Level
    var maxCount = 0.000001,
      longestDuration = 0.000001;
    connections.forEach(function(conn) {
      if (common.isNumber(conn.addon.count.act)) {
        if (conn.addon.count.act > maxCount) {
          maxCount = conn.addon.count.act;
        }
      }
      var source = conn.source,
        target = conn.target;
      if (source.position.x == target.position.x && Math.abs(source.level - target.level) > 1) {
        overlapedConns.push(conn);
      } else if (source.position.x == target.position.x && (source.level - target.level) == 1) {
        if (common.findConnectionFromList(connections, target.id, source.id)) {
          overlapedConns.push(conn);
        }
      }
      if (source == target) {
        conn.riseHeight = selfConnRiseHeight;
      }
      if (common.isNumber(conn.addon.duration.avg)) {
        if (longestDuration < conn.addon.duration.avg) {
          longestDuration = conn.addon.duration.avg;
        }
      }
    });
    connections.forEach(function(conn) {
      var count = common.isNumber(conn.addon.count.act) ? conn.addon.count.act : 0;
      var duration = common.isNumber(conn.addon.duration) ? conn.addon.duration.avg : 0;
      if (vt == 0) {
        conn.weight = count / maxCount;
        conn.width = Math.ceil((0.5 + conn.weight * 0.5) * maxConnWidth);
        var percent = duration / longestDuration;
        conn.opacity = 0.3 + percent * 0.7;
        conn.color = '#333';
      } else if (vt == 1) {
        conn.weight = count / maxCount;
        conn.width = Math.ceil((0.5 + conn.weight * 0.5) * maxConnWidth);

        conn.color = '#333';
        conn.opacity = 0.8;
      } else if (vt == 2) {
        conn.weight = duration / longestDuration;
        conn.width = Math.ceil((0.5 + conn.weight * 0.5) * maxConnWidth);

        conn.color = '#333';
        conn.opacity = 0.8;
      }
    });
    // var avgCapacity = Math.ceil(overlapedConns.length / availableRanges.length);
    var avgCapacity = overlapedConns.length;
    var positions = [];
    availableRanges.forEach(function(r) {
      var rangeCellX = (r.endX - r.startX) / avgCapacity;
      for (var i = 1; i <= avgCapacity; i++) {
        positions.push({
          x: r.startX + i * rangeCellX,
          count: 0,
          capacity: 1
        });
      }
    });
    overlapedConns.forEach(function(c, index) {
      var matchedPos = null;
      positions.every(function(p) {
        if (p.x > c.source.position.x + nodeW) {
          if (p.count == p.capacity) {
            return true;
          }
          matchedPos = p;
          p.count++;
          return false;
        }
        return true;
      });
      if (matchedPos) {
        c.riseHeight = matchedPos.x - nodeW - c.source.position.x;
      } else {
        c.riseHeight = cellX - nodeW;
      }
    });
  };

  var fnPrepareConnections = function(connections, newCases) {
    var prepareConnection = function(conn) {
      var source = conn.source,
        target = conn.target,
        isSameNode = source == target,
        isOnSameX = source.position.x == target.position.x,
        ignoredEndpoints = [];
      if (isSameNode) {
        if (source.level > 0) {
          ignoredEndpoints = [0, 1, 3, 4, 5, 6, 7, 8, 9];
        } else {
          ignoredEndpoints = [0, 1, 2, 3, 4, 5, 7, 8, 9];
        }
      } else if (isOnSameX) {
        if (conn.riseHeight) {
          ignoredEndpoints = [0, 1, 2, 4, 6, 7, 8];
        } else {
          ignoredEndpoints = [0, 2, 3, 4, 5, 6, 8, 9];
        }
      } else {
        ignoredEndpoints = [];
      }

      var bestSourcePoint = null,
        bestTargetPoint = null,
        minDist = Infinity;
      for (var i = 0; i < source.endPoints.length; i++) {
        if (ignoredEndpoints.indexOf(i) > -1) {
          continue;
        }
        var endPoint = source.endPoints[i];
        for (var j = 0; j < target.endPoints.length; j++) {
          if (ignoredEndpoints.indexOf(j) > -1) {
            continue;
          }
          var nextEndPoint = target.endPoints[j];
          var dist = Math.pow(nextEndPoint.x - endPoint.x, 2) + Math.pow(nextEndPoint.y - endPoint.y, 2);
          if (dist < minDist) {
            minDist = dist;
            bestSourcePoint = endPoint;
            bestTargetPoint = nextEndPoint;
          }
        }
      }
      if (isSameNode) {
        bestSourcePoint = source.endPoints[3];
        bestTargetPoint = target.endPoints[9];
      }

      var paintInfo = conn.paintInfo = {
        bestSourcePoint: bestSourcePoint,
        bestTargetPoint: bestTargetPoint
      };
      var opts = conn.paintInfo.opts = {
        lineWidth: conn.width,
        arrowLength: Math.floor(conn.width * 2.5),
        arrowWidth: Math.floor(conn.width * 2.5),
        lineColor: conn.color,
        arrowColor: conn.color,
        opacity: conn.opacity,
        linePlainPercent: 0.6
      };

      if (conn.isStart || conn.isEnd) {
        opts.lineDashArray = '2 4';
      }

      if (conn.riseHeight) {
        opts['riseHeight'] = conn.riseHeight;
        var initW = Math.abs(bestSourcePoint.x - bestTargetPoint.x),
          initH = Math.abs(bestSourcePoint.y - bestSourcePoint.y),
          sourceO = paintInfo.sourceO = {},
          sourceP = paintInfo.sourceP = {},
          targetO = paintInfo.targetO = {},
          targetP = paintInfo.targetP = {};
        if (initW > initH) {
          sourceO.y = sourceP.y = targetO.y = targetP.y = bestSourcePoint.y + opts.riseHeight;
          sourceO.x = bestSourcePoint.x;
          sourceP.x = bestSourcePoint.x + (1 - opts.linePlainPercent) * (bestTargetPoint.x - bestSourcePoint.x) / 2;
          targetO.x = bestTargetPoint.x;
          targetP.x = bestTargetPoint.x - (1 - opts.linePlainPercent) * (bestTargetPoint.x - bestSourcePoint.x) / 2;
        } else {
          sourceO.x = sourceP.x = targetO.x = targetP.x = bestSourcePoint.x + opts.riseHeight;
          sourceO.y = bestSourcePoint.y;
          sourceP.y = bestSourcePoint.y + (1 - opts.linePlainPercent) * (bestTargetPoint.y - bestSourcePoint.y) / 2;
          targetO.y = bestTargetPoint.y;
          targetP.y = bestTargetPoint.y - (1 - opts.linePlainPercent) * (bestTargetPoint.y - bestSourcePoint.y) / 2;
        }

        var caseHolders = paintInfo.caseHolders = [];
        if (newCases && newCases.length > 0) {
        	var fullDist = (bestTargetPoint.y - bestSourcePoint.y) * opts.linePlainPercent;
          var cellY = fullDist / (newCases.length + 1);
          newCases.forEach(function(c, index) {
            if (c.connection == conn.id) {
              var newCaseHoler = {};
              var pos = newCaseHoler.position = { x: 0, y: 0 };
              pos.x = sourceP.x;
              pos.y = sourceP.y + fullDist * c.dist;
              caseHolders.push(newCaseHoler);
            }
          });
        }

        var nLineObliqueAngle = Math.atan2(bestTargetPoint.y - targetO.y, bestTargetPoint.x - targetO.x)
        var arrowPoints = common.calculatePointsForArrowOnLine(opts.lineWidth, nLineObliqueAngle, opts.arrowWidth, opts.arrowLength, bestTargetPoint);
        paintInfo.arrowPoints = arrowPoints;
        paintInfo.type = "Trapezoid";
      } else {
        if (isOnSameX) {
          // Straight
          var nLineObliqueAngle = Math.atan2(bestTargetPoint.y - bestSourcePoint.y, bestTargetPoint.x - bestSourcePoint.x)
          var arrowPoints = common.calculatePointsForArrowOnLine(opts.lineWidth, nLineObliqueAngle, opts.arrowWidth, opts.arrowLength, bestTargetPoint);
          paintInfo.arrowPoints = arrowPoints;
          paintInfo.type = "Straight";

          var caseHolders = paintInfo.caseHolders = [];
          if (newCases && newCases.length > 0) {
          	var fullDist = (bestTargetPoint.y - bestSourcePoint.y);
            var cellY = fullDist / (newCases.length + 1);
            newCases.forEach(function(c, index) {

              if (c.connection == conn.id) {
                var newCaseHoler = {};
                var pos = newCaseHoler.position = { x: 0, y: 0 };
                pos.x = bestSourcePoint.x;
                pos.y = bestSourcePoint.y + fullDist * c.dist;
                caseHolders.push(newCaseHoler);
              }
            });
          }
        } else {
          // curve
          var controlPoint = {
            x: (bestTargetPoint.x + bestSourcePoint.x) / 2 + Math.pow(bestTargetPoint.y - bestSourcePoint.y, 2) / 2 / (bestTargetPoint.x - bestSourcePoint.x),
            y: bestSourcePoint.y
          };
          var nLineObliqueAngle = Math.atan2(bestTargetPoint.y - controlPoint.y, bestTargetPoint.x - controlPoint.x)
          var arrowPoints = common.calculatePointsForArrowOnLine(opts.lineWidth, nLineObliqueAngle, opts.arrowWidth, opts.arrowLength, bestTargetPoint);
          paintInfo.controlPoint = controlPoint;
          paintInfo.arrowPoints = arrowPoints;
          paintInfo.type = "Curve";

          var caseHolders = paintInfo.caseHolders = [];
          if (newCases && newCases.length > 0) {
            var cellT = 1 / (newCases.length + 1);
            newCases.forEach(function(c, index) {
              if (c.connection == conn.id) {
                var newCaseHoler = {};
                var pos = newCaseHoler.position = { x: 0, y: 0 };
                var t = c.dist;
                pos.x = Math.pow(1 - t, 2) * bestSourcePoint.x + 2 * (1 - t) * t * controlPoint.x + t * t * arrowPoints.arrowPoint3.x;
                pos.y = Math.pow(1 - t, 2) * bestSourcePoint.y + 2 * (1 - t) * t * controlPoint.y + t * t * arrowPoints.arrowPoint3.y;
                caseHolders.push(newCaseHoler);
              }
            });
          }
        }
      }
    };
    connections.forEach(function(d) {
      prepareConnection(d);
    });
  };
  var data = this._data;
  var ctx = this._ctx;
  this._frames = [];
  // load one frame
  var loadFramesForOnRecord = function(d) {
    if (d.newCases) {
    	var trans = d.transitions,
    	conns = d.connections;
      nodeW = 10;
      d.transitions.forEach(function(t) {
        var size = ctx.measureText(t.name);
        if (size.width + 8 > nodeW) {
          nodeW = size.width + 8;
        }
      });
      // Correlate the connections with transitions
      fnCorrelateData(conns, trans);
      // Calculate the positions of transitions
      fnCalculatePositions(conns, trans);
      // Prepare Connections
      fnPrepareConnections(conns, d.newCases);
      var frame = {
        transitions: trans,
        connections: conns,
        date: d.date
      };
      self._frames.push(frame);
      // for (var i = 1; i <= d.newCases.length; i++) {
      //   var conns = common.deepClone(d.connections),
      //     trans = common.deepClone(d.transitions);
      //   // caculate max width of transition
      //   nodeW = 10;
      //   d.transitions.forEach(function(t) {
      //     var size = ctx.measureText(t.name);
      //     if (size.width + 8 > nodeW) {
      //       nodeW = size.width + 8;
      //     }
      //   });
      //   // Correlate the connections with transitions
      //   fnCorrelateData(conns, trans);
      //   // Calculate the positions of transitions
      //   fnCalculatePositions(conns, trans);
      //   // Prepare Connections
      //   var newCases = d.newCases.slice(0, i);
      //   fnPrepareConnections(conns, newCases);
      //   var frame = {
      //     transitions: trans,
      //     connections: conns
      //   };
      //   self._frames.push(frame);
      // }
    }
  };

  data.data.forEach(function(d) {
    loadFramesForOnRecord(d);
  });

  // this.play();

  if (this._loaded) {
    this._loaded.call(this, this);
  }

  return this;
};

PNMovie.prototype.frame = function(f) {
  var ctx = this._ctx;
  // draw transitions 
  ctx.clearRect(0, 0, this._w, this._h);
  f.transitions.forEach(function(t) {
    var pos = t.position,
      size = t.size,
      isMiddle = !!t.isMiddle;
    if (isMiddle) {
      ctx.fillStyle = "#fff";
    } else {
      ctx.fillStyle = "#333";
    }

    ctx.strokeStyle = "#7d7d7d";
    ctx.lineWidth = 2;
    ctx.fillRect(pos.x, pos.y, size.w, size.h);
    ctx.strokeRect(pos.x, pos.y, size.w, size.h);

    if (isMiddle) {
      ctx.fillStyle = "#333";
    } else {
      ctx.fillStyle = "#fff";
    }
    ctx.font = "9px bold";
    ctx.textBaseline = "top";
    ctx.textAlign = "start";
    ctx.fillText(t.name, pos.x + 4, pos.y + 4);
  });
  // draw connections
  f.connections.forEach(function(conn) {
    var opts = conn.paintInfo.opts,
      type = conn.paintInfo.type,
      arrowPoints = conn.paintInfo.arrowPoints,
      caseHolders = conn.paintInfo.caseHolders,
      startPoint = conn.paintInfo.bestSourcePoint,
      endPoint = conn.paintInfo.bestTargetPoint;

    ctx.fillStyle = opts.lineColor;
    ctx.strokeStyle = opts.lineColor;
    ctx.lineWidth = opts.lineWidth;

    if (type == "Trapezoid") {
      // trapezoid
      var sourceO = conn.paintInfo.sourceO,
        sourceP = conn.paintInfo.sourceP,
        targetO = conn.paintInfo.targetO,
        targetP = conn.paintInfo.targetP;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.quadraticCurveTo(sourceO.x, sourceO.y, sourceP.x, sourceP.y);
      ctx.lineTo(targetP.x, targetP.y);
      ctx.quadraticCurveTo(targetO.x, targetO.y, arrowPoints.arrowPoint3.x, arrowPoints.arrowPoint3.y);
      ctx.stroke();

    } else if (type == "Straight") {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(arrowPoints.arrowPoint3.x, arrowPoints.arrowPoint3.y);
      ctx.stroke();
    } else if (type == "Curve") {
      var controlPoint = conn.paintInfo.controlPoint;
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, arrowPoints.arrowPoint3.x, arrowPoints.arrowPoint3.y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(arrowPoints.arrowPoint3.x, arrowPoints.arrowPoint3.y);
    ctx.lineTo(arrowPoints.arrowPoint1.x, arrowPoints.arrowPoint1.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.lineTo(arrowPoints.arrowPoint2.x, arrowPoints.arrowPoint2.y);
    ctx.closePath();
    ctx.fill();

    if (caseHolders && caseHolders.length > 0) {
      ctx.fillStyle = "#FFED00";
      ctx.lineWidth = 2;
      caseHolders.forEach(function(h) {
        ctx.beginPath();
        ctx.arc(h.position.x, h.position.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }
  });
  return this;
};

PNMovie.prototype.replay = function(){
	var self = this;
	self._currentFrameIndex = 0;
  if (this.loadingSpinner) {
    this.loadingSpinner.style.display = "none";
  }
  clearInterval(this._timer);
  this._timer = setInterval(function() {
    if (self._currentFrameIndex < self._frames.length) {
      self.frame(self._frames[self._currentFrameIndex]);
      self._currentFrameIndex++;
      if (self._playing) {
        self._playing.call(self, self._currentFrameIndex);
      }
    } else {
      clearInterval(self._timer);
      self._timer = null;
      if (self._played) {
        self._played.call(self, self._currentFrameIndex);
      }
    }
  }, this._speed);
  return this;
};

PNMovie.prototype.play = function() {
  var self = this;
  if (this.loadingSpinner) {
    this.loadingSpinner.style.display = "none";
  }
  clearInterval(this._timer);
  this._timer = setInterval(function() {
    if (self._currentFrameIndex < self._frames.length) {
      self.frame(self._frames[self._currentFrameIndex]);
      self._currentFrameIndex++;
      if (self._playing) {
        self._playing.call(self, self._currentFrameIndex);
      }
    } else {
      clearInterval(self._timer);
      self._timer = null;
      if (self._played) {
        self._played.call(self, self._currentFrameIndex);
      }
    }
  }, this._speed);
  return this;
};

PNMovie.prototype.stop = function(disableSpinner) {
  if (this.loadingSpinner && !disableSpinner) {
    this.loadingSpinner.style.display = "block";
    this.loadingSpinner.innerHTML = "Paused";
  }
  clearInterval(this._timer);
  this._timer = null;
  return this;
};

export default PNMovie
