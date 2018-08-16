import Vue from "vue"
import PNTransition from "./transition.js"
import PNStraightConnector from "./connector.straight.js"
import PNTrapezoidConnector from './connector.trapezoid.js'
import PNCurveConnector from './connector.curve.js'
import common from './common.js'
import EditPanel from './edit-panel.js'
import Static from './static.js'

function PNFuzzyChart() {}

// Patching for Initializaion(Should be removed later): 
// 1. Transitions not reachable to start transition
// 2. End transition has no previous nodes, but there existed middle transitions 
var fnInitializationPatch = function() {
  var self = this,
    connections = self.connections,
    transitions = self.transitions;
  var startTran = null,
    endTran = null,
    firstMiddleTran = null;

  transitions.forEach(function(t) {
    if (t.isStart) {
      startTransition = t;
    } else if (t.isEnd) {
      endTransition = t;
    } else if (!firstMiddleTran) {
      firstMiddleTran = t;
    }
  });

  // Hanlde case 2
  if (endTran.previousNodes.length == 0 && firstMiddleTran) {
    connections.push({
      id: common.UUIDGenerator.purchase(),
      source: firstMiddleTran,
      target: endTran,
      isEnd: true,
      addon: { duration: {}, count: {} },
      metadata: { happyPaths: [] }
    });
    firstMiddleTran.nextNodes.push(endTran);
    endTran.previousNodes.push(firstMiddleTran);
  }

  // handle case 1
  var reachableTrans = [startTran];
  var fnReachableToStart = function(tran) {
    var found = false;
    var fnHandle = function(t, path) {
      if (found) {
        return false;
      }
      if (!path) {
        path = [t];
      }
      if (t == startTran || path.indexOf(startTran) > -1) {
        found = true;
        return false;
      }
      if (reachableTrans.indexOf(t) > -1) {
        found = true;
        return false;
      }
      // not found in path, not is, not found
      if (t.previousNodes && t.previousNodes.length > 0) {
        t.previousNodes.every(function(theT) {
          if (found) {
            return false;
          }
          if (path.indexOf(startTran) > -1 || theT == startTran) {
            found = true;
            return false;
          }
          if (reachableTrans.indexOf(theT) > -1) {
            found = true;
            return false;
          }
          if (path.indexOf(theT) < 0) {
            var newPath = path.slice(0).concat([theT]);
            var shouldContinue = fnHandle(theT, newPath);
            if (!shouldContinue) {
              return false;
            }
          }
          return true;
        });
      }
      return !found;
    };
    fnHandle(tran);

    return found;
  };
  transitions.forEach(function(t) {
    // find a path to startTran
    if (!fnReachableToStart(t)) {
      connections.push({
        id: common.UUIDGenerator.purchase(),
        isConnection: true,
        source: startTran,
        target: t,
        isStart: true,
        addon: { duration: {}, count: {} },
        metadata: { happyPaths: [] }
      });
      startTran.nextNodes.push(t);
      t.previousNodes.push(startTran);
    } else {
      if (reachableTrans.indexOf(t) < 0) {
        reachableTrans.push(t);
      }
    }
  });
};

// Initialization: Build Model & Correlate Models
var fnInitialize = function() {
  var self = this,
    connections = self.connections = [],
    transitions = self.transitions = [];

  if (common.isObject(self.data)) {
  	// Build Models: Transition & Connection
    self.data.connections.forEach(function(conn) {
      connections.push({
        id: conn.id,
        source: conn.sourceLabel,
        target: conn.targetLabel,
        addon: conn.addon,
        metadata: conn.metadata
      });
    });
    self.data.transitions.forEach(function(tran) {
      transitions.push({
        id: tran.id,
        name: tran.name,
        addon: tran.addon,
        nodeType: tran.nodeType,
        isStart: tran.isStart,
        isEnd: tran.isEnd,
        isMiddle: tran.isMiddle,
        position: tran.position,
        size: tran.size,
        previousNodes: [],
        nextNodes: [],
        happyPaths: []
      });
    });

    // Correlate Transitions & Connections
    common.correlateData(connections, transitions, false, true);

    // Patching which should be removed later
    fnInitializationPatch.call(self);

    // Populate happyPaths to transitions
    connections.forEach(function(c) {
      var source = c.source,
        target = c.target;
      if (source.isStart) {
        c.isStart = true;
      }
      if (target.isEnd) {
        c.isEnd = true;
      }
      c.metadata.happyPaths.forEach(function(hp) {
        if (!source.happyPaths) {
          source.happyPaths = [hp];
        } else {
          if (source.happyPaths.indexOf(hp) < 0) {
            source.happyPaths.push(hp);
          }
        }
        if (!target.happyPaths) {
          target.happyPaths = [hp];
        } else {
          if (target.happyPaths.indexOf(hp) < 0) {
            target.happyPaths.push(hp);
          }
        }
      });
    });

    // Enrich the addon of transitions and connections, and make statistics based on that
    self.static = new Static(connections, transitions);

    if (common.isFunction(self._initialized)) {
      self._initialized.call(self);
    }
  } else {
    if (common.isFunction(self._dataEmpty)) {
      self._dataEmpty.call(self);
    }
  }
};

// Visualization: Build Node Distribution Graph(Calculate Positions) & Stylize Connections(How to show connections) 
var fnVisualize = function() {
  var self = this, connections = self.connections, transitions = self.transitions;

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
          // t.name = "End Process";
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
          // t.name = "Start Process";
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
      lastLeftItems.forEach(function(n) {
        var existedNodeInItems = common.findItemFromListWithId(items, n.id);
        if (!existedNodeInItems) {
          items.push(n);
        }
      });
      var fnHandleMainLine = function(theItems) {
        if (isMainLineFull) return;
        var lastLevelMainItem = mainLine[mainLine.length - 1];
        var lastMainItemChilds = [];
        theItems.forEach(function(theItem) {
          if (lastLevelMainItem.nextNodes.indexOf(theItem) > -1) {
            lastMainItemChilds.push(theItem);
          }
        });
        var weightArray = lastMainItemChilds.map(function(d) {
          return d.addon.count.act || 0;
        });
        var maxWeight = Math.max.apply(this, weightArray);
        var currentMainItem = null;
        lastMainItemChilds.every(function(theItem) {
          var theWeight = theItem.addon.count.act || 0;
          if (theWeight == maxWeight) {
            var theConn = common.findConnectionFromList(connections, lastLevelMainItem.id, theItem.id);
            theConn.isOnMainLine = true;
            theItem.isOnMainLine = true;
            mainLine.push(currentMainItem = theItem);
            return false;
          }
          return true;
        });

        if (currentMainItem) {
          // if all next nodes in existedNodes
          var allNextNodesInExistedNodes = true;
          currentMainItem.nextNodes.forEach(function(nextNode) {
            if (existedNodes.indexOf(nextNode) < 0) {
              allNextNodesInExistedNodes = false;
            }
          });
          if (allNextNodesInExistedNodes) {
            var theConn = common.findConnectionFromList(connections, currentMainItem.id, aEndTrans[0].id);
            if (theConn) {
              theConn.isOnMainLine = true;
            }

            mainLine.push(aEndTrans[0]);
            isMainLineFull = true;
          }
        }
      };
      // lastLevelItems = items.slice(0, items.length);
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
        var fnCalculateNodesOnSameLevel = function(theItems) {
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
        };

        var fnFindItemsWithoutMainConn = function(mainItem, theItems) {
          var matched = [];
          theItems.forEach(function(theItem) {
            if (mainItem != theItem &&
              theItem.previousNodes.indexOf(mainItem) < 0 &&
              theItem.nextNodes.indexOf(mainItem) < 0) {
              matched.push(theItem);
            }
          });
          return matched;
        };
        var remainItems = [],
          restItems = [];
        var mainChilds = [],
          mainChildInItems = null,
          lastLevelMainItem = mainLine[mainLine.length - 1];
        theItems.forEach(function(theItem) {
          if (lastLevelMainItem.nextNodes.indexOf(theItem) > -1) {
            mainChilds.push(theItem);
          }
        });
        var weightArray = mainChilds.map(function(child) {
          var theConn = common.findConnectionFromList(connections, lastLevelMainItem.id, child.id);
          return theConn.addon.count.act || 0;
        });
        var maxWeight = Math.max.apply(this, weightArray);
        mainChilds.every(function(theItem) {
          var theConn = common.findConnectionFromList(connections, lastLevelMainItem.id, theItem.id);
          var theWeight = theConn.addon.count.act || 0;
          if (theWeight == maxWeight) {
            mainChildInItems = theItem;
            remainItems.push(theItem);
            return false;
          }
          return true;
        });

        var possibleItems = fnFindItemsWithoutMainConn(mainChildInItems, theItems);
        theItems.forEach(function(theItem) {
          if (possibleItems.indexOf(theItem) < 0 && mainChildInItems != theItem) {
            restItems.push(theItem);
          }
        });
        fnCalculateNodesOnSameLevel(possibleItems);

        var previousNodesCountArray = possibleItems.map(function(d) {
          return d.previousNodesOnSameLevel.length;
        });
        var maxPreviousNodesCount = Math.max.apply(this, previousNodesCountArray);
        if (maxPreviousNodesCount <= 0) {
          remainItems = remainItems.concat(possibleItems);
        } else {
          var minPreviousNodesCount = Math.min.apply(this, previousNodesCountArray);

          if (minPreviousNodesCount > 0) {
            var itemWeightArray = possibleItems.map(function(d) {
              return d.addon.count.act || 0;
            });
            var maxItemWeight = Math.max.apply(this, itemWeightArray);
            var maxWeightItemIndex = itemWeightArray.indexOf(maxItemWeight);
            remainItems.push(possibleItems[maxWeightItemIndex]);
            possibleItems.forEach(function(theItem, index) {
              if (index != maxWeightItemIndex) {
                restItems.push(theItem);
              }
            });

          } else if (minPreviousNodesCount == 0) {
            possibleItems.forEach(function(item) {
              if (item.previousNodesOnSameLevel.length == 0) {
                remainItems.push(item);
              } else {
                restItems.push(item);
              }
            });
          }
        }

        fnInflateLevel(fnDeleteProperties(remainItems), theLevel);
        lastLevelItems = remainItems.slice(0, remainItems.length);
        fnHandleMainLine(remainItems);

        lastLeftItems = restItems;

      };

      _fnHandleLevelItems(items, l);

      return items.length > 0;
    };


    var aStartTrans = oLevels[0] = fnFindStartTrans(transitions),
      aEndTrans = fnFindEndTrans(transitions),
      mainLine = [aStartTrans[0]],
      isMainLineFull = false;
    var l = 1,
      aItems = null,
      lastLevelItems = aStartTrans,
      lastLeftItems = [];

    aStartTrans[0].isOnMainLine = true;
    aEndTrans[0].isOnMainLine = true;
    existedNodes = existedNodes.concat(aStartTrans, aEndTrans);
    while (fnHandleLevelItems()) {}
    oLevels[l] = aEndTrans;

    var keys = Object.keys(oLevels);
    keys.sort(function(a, b) {
      return parseInt(a) - parseInt(b);
    });
    keys.forEach(function(k) {
      var levelItems = oLevels[k];
      var hasMainItem = false;
      levelItems.forEach(function(levelItem) {
        if (mainLine.indexOf(levelItem) > -1) {
          hasMainItem = true;
        }
      });
      var theLevelSize = hasMainItem ? levelItems.length : (levelItems.length + 1);
      if (tower.maxLevelSize < theLevelSize) {
        tower.maxLevelSize = theLevelSize;
      }
      levelItems.forEach(function(levelItem) {
        levelItem.levelSize = theLevelSize;
        levelItem.hasMainItem = hasMainItem;
      });
    });
    keys.forEach(function(k) {
      tower.levels.push(oLevels[k]);
      var levelItems = oLevels[k],
        realLevel = tower.levels.length - 1;
      levelItems.sort(function(a, b) {
        var latestUpLevelPreviousOrderA = 0,
          latestUpLevelPreviousOrderB = 0,
          distPreviousA = Infinity,
          distPreviousB = Infinity,
          latestUpLevelNextOrderA = 0,
          latestUpLevelNextOrderB = 0,
          distNextA = Infinity,
          distNextB = Infinity;
        a.previousNodes.forEach(function(n) {
          if (n.level && n.level < realLevel && realLevel - n.level < distPreviousA) {
            latestUpLevelPreviousOrderA = n.order;
          }
        });
        b.previousNodes.forEach(function(n) {
          if (n.level && n.level < realLevel && realLevel - n.level < distPreviousB) {
            latestUpLevelPreviousOrderB = n.order;
          }
        });
        a.nextNodes.forEach(function(n) {
          if (n.level && n.level < realLevel && realLevel - n.level < distNextA) {
            latestUpLevelNextOrderA = n.order;
          }
        });
        b.nextNodes.forEach(function(n) {
          if (n.level && n.level < realLevel && realLevel - n.level < distNextB) {
            latestUpLevelNextOrderB = n.order;
          }
        });
        var res = 0;
        if (latestUpLevelPreviousOrderA == latestUpLevelPreviousOrderB) {
          if (latestUpLevelNextOrderA == latestUpLevelNextOrderB) {
            res = 0;
          } else if (latestUpLevelNextOrderA < latestUpLevelNextOrderB) {
            res = -1;
          } else {
            res = 1;
          }
        } else if (latestUpLevelPreviousOrderA < latestUpLevelPreviousOrderB) {
          res = -1;
        } else {
          res = 1;
        }
        return res;
      });
      var hasMainItem = levelItems[0].hasMainItem;
      var occupiedOrder = -1,
        usedOccupiedOrder = false,
        middleOrder = Math.floor(tower.maxLevelSize / 2) - Math.ceil((tower.maxLevelSize - levelItems[0].levelSize) / 2);
      levelItems.forEach(function(n, index) {
        n.level = realLevel;
        if (mainLine.indexOf(n) > -1) {
          n.order = middleOrder;
          occupiedOrder = index;
        }
      });
      levelItems.forEach(function(n, index) {
        if (mainLine.indexOf(n) < 0) {
          if (index == middleOrder && hasMainItem) {
            n.order = occupiedOrder;
            usedOccupiedOrder = true;
          } else if (index == middleOrder) {
            n.order = index + 1;
            usedOccupiedOrder = true;
          } else {
            if (usedOccupiedOrder && !hasMainItem) {
              n.order = index + 1;
            } else {
              n.order = index;
            }
          }
        }
      });
    });

    return tower;
  };
  var fnSimulateCalculate = function(connections, transitions, tower, availableW, availableH, marginTop, simulatedCellX, simulatedCellY) {
    // Simulate the transition's position
    var maxX = 0;
    transitions.forEach(function(n, i) {
      var levelSize = n.levelSize;
      n.position.y = n.level * simulatedCellY + marginTop + titleH;
      n.position.x = (n.order + Math.ceil((tower.maxLevelSize - levelSize) / 2)) * simulatedCellX + padding;
      if (maxX < n.position.x) {
        maxX = n.position.x;
      }
    });
    // Simulate the connection's rise height and get rightmost connections count
    var rightMostConnCountWithRiseHeight = 0,
      rightMostSelfCount = 0;
    connections.forEach(function(c) {
      var source = c.source,
        target = c.target;
      if (source.position.x == target.position.x && source.position.x == maxX) {
        if ((Math.abs(source.level - target.level) > 1 && !c.isOnMainLine) ||
          (source.level - target.level == 1 &&
            common.findConnectionFromList(connections, target.id, source.id))) {
          rightMostConnCountWithRiseHeight++;
        } else if (source == target) {
          rightMostSelfCount++;
        }
      }
    });
    var rightMostMaxTooltipWidth = 0;
    if (tooltipW) {
      rightMostMaxTooltipWidth = tooltipW;
      transitions.forEach(function(t) {
        if (t.position.x == maxX) {
          if (t.textSize.width > tooltipW - 40) {
            rightMostMaxTooltipWidth = t.textSize.width + 40;
          }
        }
      });
    }

    return {
      rightMostSelfCount: rightMostSelfCount,
      rightMostCount: rightMostConnCountWithRiseHeight,
      rightMostMaxTooltipWidth: rightMostMaxTooltipWidth
    };
  };
  var fnCalculatePositions = function(connections, transitions) {
    var tower = fnCreateTowerModel(connections, transitions);
    var marginTop = padding;
    var availableH = h - titleH - nodeH - marginTop * 2,
      availableW = w - nodeW - padding * 2 - controlBarWidth;
    tower.maxLevelSize = tower.maxLevelSize < 2 ? 2 : tower.maxLevelSize;
    var result = fnSimulateCalculate(connections, transitions, tower, availableW, availableH, marginTop, 100, 100);

    var maxBetweenSelfConnAndTooltipWidth = 0,
      selfConnWidth = 0,
      tooltipWidth = 0,
      marginRight = 0;
    if (result.rightMostSelfCount > 0) {
      selfConnWidth = selfConnRiseHeight + maxConnWidth;
    }
    maxBetweenSelfConnAndTooltipWidth = Math.max(selfConnWidth, tooltipWidth);
    marginRight = maxBetweenSelfConnAndTooltipWidth;
    availableW = w - nodeW - padding * 2 - controlBarWidth - marginRight;
    var cellX = tower.maxLevelSize <= 2 ? availableW / 2 : (availableW / (tower.maxLevelSize - 1)),
      cellY = tower.levels.length <= 2 ? availableH / 2 : (availableH / (tower.levels.length - 1));
    if (result.rightMostCount > 0 && marginRight < cellX) {
      while (marginRight < cellX) {
        marginRight += 2;
        availableW = w - nodeW - padding * 2 - controlBarWidth - marginRight;
        cellX = tower.maxLevelSize < 2 ? availableW / 2 : (availableW / (tower.maxLevelSize - 1));
      }
    }
    var ratioX = cellX / minCellX,
      ratioY = cellY / minCellY,
      minRatio = Math.min(ratioX, ratioY);
    if (minRatio < 1) {
      chartContainerScale = minRatio;
      var _scale = 1 / minRatio;
      chartContainerSize.w *= _scale;
      chartContainerSize.h *= _scale;
      chartContainerPos.x = w / 2 * (1 - _scale);
      chartContainerPos.y = h / 2 * (1 - _scale);
      availableW *= _scale;
      availableH *= _scale;
      cellX *= _scale;
      cellY *= _scale;
      chartContainer.style.width = chartContainerSize.w + "px";
      chartContainer.style.height = chartContainerSize.h + "px";
      chartContainer.style.left = chartContainerPos.x + "px";
      chartContainer.style.top = chartContainerPos.y + "px";
      chartContainer.style.transform = "scale(" + minRatio + ")";
    }
    var availableRanges = [];
    for (var i = 0; i < tower.maxLevelSize; i++) {
      availableRanges.push({
        startX: nodeW + padding + i * cellX,
        endX: padding - maxConnWidth + (i + 1) * cellX,
        connections: []
      });
    }

    transitions.forEach(function(n, i) {
      var levelSize = n.levelSize;
      n.position.y = n.level * cellY + marginTop + titleH;
      n.position.x = (n.order + Math.ceil((tower.maxLevelSize - levelSize) / 2)) * cellX + padding;
      n.connRangeIndex = n.order + Math.ceil((tower.maxLevelSize - levelSize) / 2);
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
        [9, 0],
        [0.5, 0],
        [1, 0],
        [0, 0.5],
        [1, 0.5],
        [0, 1],
        [9, 1],
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
      if (source.position.x == target.position.x && Math.abs(source.level - target.level) > 1 && !conn.isOnMainLine) {
        var connSpace = availableRanges[source.connRangeIndex].connections;
        if (connSpace.indexOf(conn) < 0) {
          connSpace.push(conn);
        }
      } else if (source.position.x == target.position.x && (source.level - target.level) == 1) {
        if (common.findConnectionFromList(connections, target.id, source.id)) {
          var connSpace = availableRanges[source.connRangeIndex].connections;
          if (connSpace.indexOf(conn) < 0) {
            connSpace.push(conn);
          }
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
    var kpi = vtOpts.kpi == 'abs' ? 'act' : vtOpts.kpi,
      colorKey = vtOpts.kpi;
    if (common.isString(vtOpts.weightedBy)) {
      colorKey += 'By' + common.capitalize(vtOpts.weightedBy);
    }
    connections.forEach(function(conn) {
      var count = common.isNumber(conn.addon.count.act) ? conn.addon.count.act : 0;
      var duration = common.isNumber(conn.addon.duration) ? conn.addon.duration.avg : 0;
      if (vt == 0) {
        conn.weight = count / maxCount;
        conn.width = Math.floor((0.5 + conn.weight * 0.5) * maxConnWidth);
        var percent = duration / longestDuration;
        conn.opacity = 0.5 + percent * 0.5;
        conn.color = '#333';
      } else if (vt == 1) {
        conn.weight = count / maxCount;
        conn.width = Math.floor((0.5 + conn.weight * 0.5) * maxConnWidth);

        if (enabledHighlightLevel && enabledHeatmap) {
          conn.color = countConnColor[conn.highlightLevel.count[colorKey]];
        } else {
          conn.color = '#333';
        }

        conn.opacity = 1;
      } else if (vt == 2) {
        conn.weight = duration / longestDuration;
        conn.width = Math.floor((0.5 + conn.weight * 0.5) * maxConnWidth);

        if (enabledHighlightLevel && enabledHeatmap) {
          conn.color = durationConnColor[conn.highlightLevel.duration[colorKey]];
        } else {
          conn.color = '#333';
        }

        conn.opacity = 1;
      }
    });
    availableRanges.forEach(function(r) {
      var positions = [];
      var avgCapacity = r.connections.length + 1;
      var rangeCellX = (r.endX - r.startX) / avgCapacity;
      for (var i = 1; i <= avgCapacity; i++) {
        positions.push({
          x: r.startX + i * rangeCellX,
          count: 0,
          capacity: 1
        });
      }

      r.connections.forEach(function(c) {
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
    });
  };

  if (common.isFunction(self._beforeRender)) {
    self._beforeRender.call(self);
  }
};

// Rendering: Draw 
var fnRender = function() {
  var self = this;

  if (common.isFunction(self._afterRender)) {
    self._afterRender.call(self);
  }
};

PNFuzzyChart.prototype.opts = function(opts) {
  this.opts = opts;
};

PNFuzzyChart.prototype.noty = function(notyService) {
  this.notyService = notyService;
  return this;
};

PNFuzzyChart.prototype.data = function(data) {
  this.data = data;
  return this;
};

PNFuzzyChart.prototype.dataEmpty = function(fnOnDataEmpty) {
  if (common.isFunction(fnOnDataEmpty)) {
    this._dataEmpty = fnOnDataEmpty;
  }
};

PNFuzzyChart.prototype.initialized = function(fnOnInitialized) {
  if (common.isFunction(fnOnInitialized)) {
    this._initialized = fnOnInitialized;
  }
};

PNFuzzyChart.prototype.beforeRender = function(fnBeforeRender) {
  if (common.isFunction(fnBeforeRender)) {
    this._beforeRender = fnBeforeRender;
  }
};

PNFuzzyChart.prototype.afterRender = function(fnAfterRender) {
  if (common.isFunction(fnAfterRender)) {
    this._afterRender = fnAfterRender;
  }
};

export default PNFuzzyChart;
