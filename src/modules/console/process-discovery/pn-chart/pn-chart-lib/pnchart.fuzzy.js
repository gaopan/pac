import Vue from "vue"
import PNTransition from "./transition.js"
import PNStraightConnector from "./connector.straight.js"
import PNTrapezoidConnector from './connector.trapezoid.js'
import PNCurveConnector from './connector.curve.js'
import common from './common.js'
import EditPanel from './edit-panel.js'
import Static from './static.js'

function PNFuzzyChart(container) {
  this._container = container;
  this._transitions = null;
  this._connections = null;
}

PNFuzzyChart.prototype.noty = function(notyService) {
  this._notyService = notyService;
  return this;
};

PNFuzzyChart.prototype.data = function(data) {
  this._data = data;
  return this;
};

PNFuzzyChart.prototype.draw = function(_opts) {
  var self = this;

  _opts = this.opts = Object.assign({
    viewType: 0, // 0: Both Transition and duration, 1: Transition, 2: Duration
    viewOpts: {
      kpi: "abs"
    },
    padding: 10,
    transition: {},
    controlBar: true
  }, _opts);

  var container = this._container,
    notyService = this._notyService,
    chartContainer = null,
    data = common.deepClone(this._data),
    id = _opts.id || common.UUIDGenerator.purchase(),
    vt = _opts.viewType,
    vtOpts = _opts.viewOpts,
    w = this._container.clientWidth,
    h = this._container.clientHeight,
    title = _opts.title,
    nodeW = _opts.nodeWidth ? _opts.nodeWidth : 80,
    nodeH = 26,
    maxConnWidth = 6,
    selfConnRiseHeight = maxConnWidth * 3,
    minCellX = nodeW + selfConnRiseHeight + maxConnWidth,
    minCellY = nodeH,
    tooltipW = 0,
    tooltipH = 0,
    tooltipIgnoreStartAndEnd = true,
    disabledAddon = !!_opts.disabledAddon,
    enabledHighlightPath = !!_opts.enabledHighlightPath,
    highlightTimeout = _opts.highlightTimeout || 3000,
    enabledWhiteboardMark = !!_opts.enabledWhiteboardMark,
    whiteboardMarkCallback = _opts.whiteboardMarkCallback,
    enabledHighlightLevel = !!_opts.enabledHighlightLevel,
    enabledHeatmap = !!_opts.enabledHeatmap,
    editable = !!_opts.editable,
    showTitle = !!_opts.showTitle,
    controlBar = !!_opts.controlBar,
    controlBarWidth = controlBar ? 24 : 0,
    hpConf = _opts.hpConf,
    titleH = 0,
    chartContainerScale = 1,
    chartContainerSize = { w: w, h: h },
    chartContainerPos = { x: 0, y: 0 },
    padding = _opts.padding,
    countTransColor = ["#00ceff", "#80e5ff", "#b7edfe", "#ccf4ff", "#e8f8ff"].reverse(),
    countConnColor = ["#040404", "#414141", "#525252", "#606060", "#7e7e7e"].reverse(),
    durationTransColor = ["#fc951f", "#FAA039", "#FAAD52", "#FCBF74", "#FAC990"].reverse(),
    durationConnColor = ["#fc951f", "#FAA039", "#FAAD52", "#FCBF74", "#FAC990"].reverse();

  if (showTitle) {
    titleH = 30;
  }

  if (_opts.transition.tooltip && common.isNumber(_opts.transition.tooltip.width) && _opts.transition.tooltip.width > 0) {
    tooltipW = _opts.transition.tooltip.width;
    tooltipH = _opts.transition.tooltip.height || 150;
    tooltipIgnoreStartAndEnd = !!_opts.transition.tooltip.ignoreStartAndEnd;
  }

  _opts.transition.disabledAddon = disabledAddon;

  if (!data) {
    console.warn("PN Fuzzy Chart data is null");
    // return;
  }

  var fnCorrelateData = function(connections, transitions, happyPaths) {
    console.log(connections);
    console.log(transitions);
    common.correlateData(connections, transitions, false, true);


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

    if(endTransition.previousNodes.length == 0 && transitions.length > 2) {
      var firstMiddleTrans = null;
      transitions.every(function(t){
        if(!t.isStart && !t.isEnd) {
          firstMiddleTrans = t;
          return false;
        }
        return true;
      });
      if(firstMiddleTrans) {
        connections.push({
          id: common.UUIDGenerator.purchase(),
          isConnection: true,
          source: firstMiddleTrans,
          target: endTransition,
          isEnd: true,
          addon: { duration: {}, count: {} },
          metadata: { happyPaths: [] }
        });
        firstMiddleTrans.nextNodes.push(endTransition);
        endTransition.previousNodes.push(firstMiddleTrans);
      }
    }

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

    var reachableTrans = [startTransition];
    var fnReachableToStart = function(tran) {
      var found = false;
      var fnHandle = function(t, path) {
        if (found) {
          return false;
        }
        if (!path) {
          path = [t];
        }
        if (t == startTransition || path.indexOf(startTransition) > -1) {
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
            if (path.indexOf(startTransition) > -1 || theT == startTransition) {
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
      if (!t.nextNodes) {
        t.nextNodes = [];
      }
      if (!t.previousNodes) {
        t.previousNodes = [];
      }
      // find a path to startTransition
      if (!fnReachableToStart(t)) {
        connections.push({
          id: common.UUIDGenerator.purchase(),
          isConnection: true,
          source: startTransition,
          target: t,
          isStart: true,
          addon: { duration: {}, count: {} },
          metadata: { happyPaths: [] }
        });
        if (!startTransition.nextNodes) {
          startTransition.nextNodes = [t];
        } else {
          startTransition.nextNodes.push(t);
        }
        t.previousNodes.push(startTransition);
      } else {
        if (reachableTrans.indexOf(t) < 0) {
          reachableTrans.push(t);
        }
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
          // t.name = "结束";
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
          // t.name = "开始";
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
            // if (!theConn) {
            //   theConn = {
            //     id: common.UUIDGenerator.purchase(),
            //     isConnection: true,
            //     source: currentMainItem,
            //     target: aEndTrans[0],
            //     isEnd: true,
            //     addon: { duration: {}, count: {} }
            //   };
            //   connections.push(theConn);
            // }
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
  }

  var fnCalculatePositions = function(connections, transitions) {
    var tower = fnCreateTowerModel(connections, transitions);
    // var marginTop = tooltipIgnoreStartAndEnd ? padding : Math.max(padding, tooltipH);
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
    // if (tooltipW > 0) {
    //   tooltipWidth = result.rightMostMaxTooltipWidth;
    // }
    maxBetweenSelfConnAndTooltipWidth = Math.max(selfConnWidth, tooltipWidth);
    marginRight = maxBetweenSelfConnAndTooltipWidth;
    availableW = w - nodeW - padding * 2 - controlBarWidth - marginRight;
    var cellX = tower.maxLevelSize <= 2 ? availableW / 2 : (availableW / (tower.maxLevelSize - 1)),
      cellY = tower.levels.length <= 2 ? availableH / 2 : (availableH / (tower.levels.length - 1));
    // if (result.rightMostCount < 1) {
    //   cellX = tower.maxLevelSize <= 2 ? availableW / 2 : (availableW / (tower.maxLevelSize - 1));
    // }
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

  var fnDrawTransition = function(tran, container) {
    tran.token = 0;
    var kpi = vtOpts.kpi == 'abs' ? 'act' : vtOpts.kpi,
      bgColor = '#fff',
      colorKey = vtOpts.kpi;
    if (tran.isMiddle && enabledHeatmap) {
      if (vt == 2) {
        if (common.isString(vtOpts.weightedBy)) {
          colorKey += 'By' + common.capitalize(vtOpts.weightedBy);
          var weightedBy = vtOpts.weightedBy == 'abs' ? 'act' : vtOpts.weightedBy;
          tran.token = common.convertDurationToStr(tran.addon.duration[kpi]) + " (" + common.convertCountToStr(tran.addon.count[weightedBy]) + ")";
        } else {
          tran.token = common.convertDurationToStr(tran.addon.duration[kpi]);
        }
        bgColor = durationTransColor[tran.highlightLevel.duration[colorKey]];
      } else {
        tran.token = common.convertCountToStr(tran.addon.count[kpi]);
        bgColor = countTransColor[tran.highlightLevel.count[colorKey]];
      }
    } else if(tran.isMiddle){
      tran.token = common.convertCountToStr(tran.addon.count[kpi]);
    }

    if (disabledAddon) {
      tran.token = null;
    }

    tran.pid = id;
    var instance = new PNTransition(self, container, tran).draw(_opts.transition, {
      editable: editable,
      onToggleComment: _opts.onToggleComment,
      newWhiteboard: !!_opts.newWhiteboard,
      hpConf: hpConf,
      connections: data.connections,
      notyService: notyService
    });
    tran.node = instance.node;
    
    if (hpConf) {
      if (hpConf.isView && hpConf.cur) {
        if (common.isArray(tran.happyPaths) && tran.happyPaths.indexOf(hpConf.cur) !== -1) bgColor = '#333';
      }
      if (hpConf.isAdd || hpConf.isEdit) {
        if (hpConf.selectedTrans.indexOf(tran) !== -1) bgColor = '#333';
      }
    }

    if (tran.isMiddle) {
      tran.node.style.backgroundColor = bgColor;
    }

    if (tran.isStart) {
      self._startTransition = tran;
    } else if (tran.isEnd) {
      self._endTransition = tran;
    }
    instance.happyPaths = tran.happyPaths;
    instance.model = tran;
    instance.id = tran.id;
    return instance;
  };

  var fnDrawConnection = function(conn, container) {
    var kpi = vtOpts.kpi == 'abs' ? 'act' : vtOpts.kpi;
    if (vt == 2) {
      if (common.isString(vtOpts.weightedBy)) {
        var weightedBy = vtOpts.weightedBy == 'abs' ? 'act' : vtOpts.weightedBy;
        conn.token = common.convertDurationToStr(conn.addon.duration[kpi]) + " (" + common.convertCountToStr(conn.addon.count[weightedBy]) + ")";
      } else {
        conn.token = common.convertDurationToStr(conn.addon.duration[kpi]);
      }
    } else {
      conn.token = common.convertCountToStr(conn.addon.count[kpi]);
    }
    if (disabledAddon) {
      conn.token = null;
    }
    var source = conn.source,
      target = conn.target,
      isSameNode = source == target,
      isOnSameX = source.position.x == target.position.x,
      ignoredEndpoints = [];

    // ignoredEndpoints = [0, 1, 3, 4, 5, 6, 7, 9];
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

    var opts = {
        lineWidth: conn.width,
        arrowLength: 10,
        arrowWidth: 10,
        lineColor: conn.color,
        arrowColor: conn.color,
        opacity: conn.opacity,
        label: conn.token,
        connSourceName:conn.sourceLabel,
        connTargetName:conn.targetLabel,
        addon:conn.addon,
        enabledClickPop:conn.enabledClickPop
      },
      globalOpts = {
        editable: editable,
        hpConf: hpConf
      };

    if (conn.isStart || conn.isEnd) {
      opts.lineDashArray = '2 4';
      opts.label = null;
    }

    var instance = null;
    if (conn.riseHeight) {
      opts['riseHeight'] = conn.riseHeight;
      instance = new PNTrapezoidConnector(self, container, source, target).draw(bestSourcePoint, bestTargetPoint, opts, globalOpts);
    } else {
      if (isOnSameX) {
        instance = new PNStraightConnector(self, container, source, target).draw(bestSourcePoint, bestTargetPoint, opts, globalOpts);
      } else {
        instance = new PNCurveConnector(self, container, source, target).draw(bestSourcePoint, bestTargetPoint, opts, globalOpts);
      }
    }
    conn.node = instance.node;
    instance.model = conn;
    instance.id = conn.id;

    if (hpConf) {
      if (hpConf.isView && hpConf.cur) {
        if (!common.isArray(conn.metadata.happyPaths) || conn.metadata.happyPaths.indexOf(hpConf.cur) === -1) {
          conn.opacity = 0.1;
          conn.node.node.style.opacity = 0.1;
        }else {
          conn.opacity = 1;
          conn.node.node.style.opacity = 1;
        }
      }
      if (hpConf.isAdd || hpConf.isEdit) {
        var found = false;
        if (conn.source === hpConf.selectedTrans[hpConf.selectedTrans.length - 1] && hpConf.candidateTrans.indexOf(conn.target) !== -1) {
          found = true;
        } else {
          // exsited issue: when from A to B has two connection.
          var sIndex = hpConf.selectedTrans.indexOf(conn.source);
          var tIndex = hpConf.selectedTrans.indexOf(conn.target);
          if (sIndex !== -1 && tIndex !== -1 && tIndex - sIndex === 1) found = true;
        }

        if (found) {
          conn.opacity = 1;
          conn.node.node.style.opacity = 1;
        } else {
          conn.opacity = 0.1;
          conn.node.node.style.opacity = 0.1;
        }
      }
    }

    return instance;
  };

  var fnDrawTitle = function(title, container) {
    if (title) {
      var titleWrapper = document.createElement("div");
      titleWrapper.innerHTML = title;
      titleWrapper.className = 'pn-title';

      container.appendChild(titleWrapper);
    }
  };

  var fnDrawControlBar = function(controlBarContainer, happyPaths) {
    var _scale = chartContainerScale,
      thresholdScale = chartContainerScale,
      maxScale = chartContainerScale * 10,
      minScale = chartContainerScale / 10,
      zoomInInterval = chartContainerScale,
      zoomOutInterval = chartContainerScale / 10,
      inertiaTimer = null,
      lastPosX = 0,
      lastPosY = 0,
      startX = 0,
      startY = 0,
      speedX = 0,
      speedY = 0,
      lastX = 0,
      lastY = 0,
      pos = { x: 0, y: 0 },
      posLimit = { minX: pos.x, maxX: pos.x, minY: pos.y, maxY: pos.y };

    var fnUpdatePosLimit = function() {
      var d = 0;
      if (_scale > thresholdScale) {
        d = _scale - thresholdScale;
      }

      posLimit.minX = -d * chartContainerSize.w / 2 + pos.x;
      posLimit.maxX = d * chartContainerSize.w / 2 + pos.x;
      posLimit.minY = -d * chartContainerSize.h / 2 + pos.y;
      posLimit.maxY = d * chartContainerSize.h / 2 + pos.y;
    };

    var fnUpdateTransform = function() {
      if (_scale <= thresholdScale) {
        pos.x = 0;
        pos.y = 0;
      }
      chartContainer.style.transform = "scale(" + (_scale) + ") translate(" + pos.x + "px," + pos.y + "px)";
    };

    var controlBarWrapper = document.createElement("div");
    controlBarWrapper.className = "pn-controls";
    controlBarContainer.appendChild(controlBarWrapper);

    // Zoom in and out buttons
    var zoomInBtn = document.createElement("button");
    zoomInBtn.className = "control-btn";
    zoomInBtn.innerHTML = "+";
    controlBarWrapper.appendChild(zoomInBtn);

    var zoomOutBtn = document.createElement("button");
    zoomOutBtn.className = "control-btn";
    zoomOutBtn.innerHTML = "-";
    controlBarWrapper.appendChild(zoomOutBtn);

    var selectedHappyPath = function() {
      var selectedHappyPaths = [];
      happyPaths.forEach(function(hp) {
        if (hp.selected) {
          selectedHappyPaths.push(hp);
        }
      });

      self._transitions.forEach(function(t) {
        if (t.happPathWrapper) {
          t.happPathWrapper.parentNode.removeChild(t.happPathWrapper);
        }
        var hpWrapper = t.happPathWrapper = document.createElement('div');
        hpWrapper.className = 'hp-wrapper';
        t.node.appendChild(hpWrapper);
        if (t.happyPaths) {
          t.happyPaths.forEach(function(hpName) {
            var theHp = common.findItemFromListWithName(selectedHappyPaths, hpName);
            if (theHp) {
              var hpNode = document.createElement('div');
              hpNode.className = 'hp-item';
              hpNode.style.backgroundColor = theHp.color.value;
              hpWrapper.appendChild(hpNode);
            }
          });
        }
      });
    };

    if (happyPaths && happyPaths.length > 0) {
      happyPaths.forEach(function(hp) {
        hp.selected = false;
        var hpBtnWrapper = document.createElement('div');
        hpBtnWrapper.className = 'hp-toggle-wrapper';
        controlBarWrapper.appendChild(hpBtnWrapper);

        var hpBtn = document.createElement('div');
        hpBtn.className = 'hp-toggle';
        hpBtn.title = hp.name;
        hpBtn.style.backgroundColor = '#fff';
        hpBtn.style.borderColor = hp.color.value;
        hpBtnWrapper.appendChild(hpBtn);

        hpBtn.addEventListener('click', function(evt) {
          evt.preventDefault();
          evt.stopPropagation();

          hp.selected = !hp.selected;
          if (hp.selected) {
            hpBtn.style.backgroundColor = hp.color.value;
          } else {
            hpBtn.style.backgroundColor = '#fff';
          }

          // change the transitions' style
          selectedHappyPath();
        });

      });
    }

    // bind events
    var fnStopBubble = function(evt) {
      evt.stopPropagation();
      evt.preventDefault();
    };
    var fnZoomIn = function(evt) {
      if (_scale >= maxScale) {
        _scale = maxScale;
      } else if (_scale >= thresholdScale) {
        _scale += zoomInInterval;
      } else {
        _scale += zoomOutInterval;
      }
      fnUpdateTransform();
      fnUpdatePosLimit();
      evt.stopPropagation();
      evt.preventDefault();
    };
    var fnZoomOut = function(evt) {
      if (_scale <= minScale) {
        _scale = minScale;
      } else if (_scale < thresholdScale + zoomInInterval) {
        _scale -= zoomOutInterval;
      } else {
        _scale -= zoomInInterval;
      }
      fnUpdateTransform();
      fnUpdatePosLimit();
      evt.stopPropagation();
      evt.preventDefault();
    };
    var fnTouchStart = function(evt) {
      clearInterval(inertiaTimer);
      lastPosX = pos.x;
      lastPosY = pos.y;
      lastX = startX = evt.clientX;
      lastY = startY = evt.clientY;
      speedX = 0;
      speedY = 0;
      container.className += " moving";
      chartContainer.addEventListener("mousemove", fnTouchMove);
      chartContainer.addEventListener("mouseup", fnTouchEnd);
      evt.stopPropagation();
      evt.preventDefault();
    };
    var fnTouchMove = function(evt) {
      speedX = evt.clientX - lastX;
      speedY = evt.clientY - lastY;
      lastX = evt.clientX;
      lastY = evt.clientY;
      pos.x = lastPosX + (evt.clientX - startX) / _scale;
      pos.y = lastPosY + (evt.clientY - startY) / _scale;
      fnUpdateTransform();
      evt.stopPropagation();
      evt.preventDefault();
    };
    var fnTouchEnd = function(evt) {
      var index = container.className.indexOf("moving");
      container.className = container.className.substring(0, index - 1) + container.className.substring(index + "moving".length, container.className.length);
      chartContainer.removeEventListener("mousemove", fnTouchMove);
      chartContainer.removeEventListener("mouseup", fnTouchEnd);
      fnStartMove();
      evt.stopPropagation();
      evt.preventDefault();
    };
    var fnStartMove = function() {
      clearInterval(inertiaTimer);
      inertiaTimer = setInterval(function() {
        var posX = pos.x + speedX / _scale,
          posY = pos.y + speedY / _scale,
          scaledPosX = pos.x + speedX,
          scaledPosY = pos.y + speedY;

        if (scaledPosX < posLimit.minX) {
          posX = posLimit.minX / _scale;
          speedX *= -0;
        } else if (scaledPosX > posLimit.maxX) {
          posX = posLimit.maxX / _scale;
          speedX *= -0;
        } else {
          speedX *= 0.8;
        }

        if (scaledPosY < posLimit.minY) {
          posY = posLimit.minY / _scale;
          speedY *= -0;
        } else if (scaledPosY > posLimit.maxY) {
          posY = posLimit.maxY / _scale;
          speedY *= -0;
        } else {
          speedY *= 0.8;
        }

        pos.x = posX;
        pos.y = posY;
        fnUpdateTransform();

        if (Math.abs(speedX) < 1) speedX = 0;
        if (Math.abs(speedY) < 1) speedY = 0;

        if (speedX == 0 && speedY == 0) {
          clearInterval(inertiaTimer);
        }
      }, 30);
    };
    zoomInBtn.addEventListener("mousedown", fnStopBubble);
    zoomInBtn.addEventListener("mouseup", fnZoomIn);
    zoomOutBtn.addEventListener("mousedown", fnStopBubble);
    zoomOutBtn.addEventListener("mousedown", fnZoomOut);
    chartContainer.addEventListener("mousedown", fnTouchStart);
  };

  var fnDrawWhiteboardMark = function(whiteboardMarkContainer) {
    var whiteboardMark = document.createElement('button');
    whiteboardMark.className = 'whiteboard-mark btn btn-primary';
    whiteboardMark.innerHTML = '作为模板编辑';
    whiteboardMarkContainer.appendChild(whiteboardMark);

    var fnOnClick = function(evt) {
      if (common.isFunction(whiteboardMarkCallback)) {
        whiteboardMarkCallback.call(self);
      }
      evt.stopPropagation();
      evt.preventDefault();
    };

    whiteboardMark.addEventListener("click", fnOnClick);
  };

  var fnDrawEditPanel = function(container) {
    self.editPanel = new EditPanel(container, self, {
      newWhiteboard: _opts.newWhiteboard
    }).draw();
  };

  var fnCalculateStaticData = function(transitions, connections) {
    self.static = new Static(connections, transitions);
  };

  var fnCalculateInitHPState = function (trans, isAdd, cur) {
    var startTran = null,
      resObj = { selectedTrans: [], candidateTrans: [], allFullHP: {} };

    for (var i=0; i< trans.length; i++) {
      if (trans[i].isStart) {
        startTran = trans[i];
        break;
      }
    }

    var calRelationTransFromStartToEnd = function(sTran, cur) {
      var resArr = [sTran];
      
      if (!cur) return resArr;

      var startSearch = function(tran) {
        if (common.isArray(tran.nextNodes)) {
          var connections = common.getConnsByTransWithName(data.connections, tran.name, tran.nextNodes.map(function(d){return d.name}), true);
          connections.some(function(c){
            if (common.isObject(c.metadata) && common.isArray(c.metadata.happyPaths) && c.metadata.happyPaths.indexOf(cur) !== -1) {
              resArr.push(c.target);
              startSearch(c.target);

              return true;
            }
          });
        }
      };

      startSearch(sTran);

      return resArr;
    };

    if (isAdd) {
      resObj.selectedTrans.push(startTran);
      startTran.nextNodes.forEach(function(t){
        t !== startTran && resObj.selectedTrans.indexOf(t) === -1 && resObj.candidateTrans.push(t);
      });
    } else {
      resObj.candidateTrans = [];
      resObj.selectedTrans = calRelationTransFromStartToEnd(startTran, cur);
    }

    data.happyPaths.forEach(function(d){
      resObj.allFullHP[d.name] = {
        name: d.name,
        selectedTrans: calRelationTransFromStartToEnd(startTran, d.name)
      };
    });

    return resObj;
  }

  var fnDrawHPLegend = function(container) {
    var hHappyPath = '\
      <ul class="content">\
        <li class="item suggested">\
          <span class="text">Suggested Happy Path</span>\
        </li>\
        <li class="item selected">\
          <span class="text">Selected Happy Path</span>\
        </li>\
      </ul>\
    ';

    var hpWrapper = document.createElement('div');
    hpWrapper.className = 'happy-path-legend-wrapper';
    hpWrapper.innerHTML = hHappyPath;

    container.appendChild(hpWrapper);
  }

  var _draw = function() {
    if(!data) {
      container.innerHTML = '<div class="no-data-tip">没有数据显示.</div>';
      return;
    }
    container.innerHTML = "";
    self._transitions = [], self._connections = [];

    var conns = data.connections;
     var trans = data.transitions,
      happyPaths = data.happyPaths;

    chartContainer = document.createElement("div");
    chartContainer.className = "pn-chart-wrapper";
    container.appendChild(chartContainer);

    if (showTitle) {
      fnDrawTitle(title || data.title, chartContainer);
    }
    // Correlate the connections with transitions
    fnCorrelateData(conns, trans, happyPaths);
    // Calculate static
    fnCalculateStaticData(trans, conns);
    // Calculate the positions of transitions
    fnCalculatePositions(conns, trans);

    if (hpConf) {
      if (hpConf.isAdd || hpConf.isEdit) {
        fnDrawHPLegend(chartContainer);
      }
      if (hpConf.isAdd) {
        hpConf = Object.assign(hpConf, fnCalculateInitHPState(trans, true));
      }else if (hpConf.isEdit) {
        hpConf = Object.assign(hpConf, fnCalculateInitHPState(trans, false, hpConf.cur));
      }
      if (hpConf.isEdit && hpConf.cur != hpConf.new) {
        if (common.isFunction(hpConf.fnChangedMarkingInfo)) {
          var conf = null;

          var selectedConns = [];
          hpConf.selectedTrans.forEach(function(t, i){
            if (i !== hpConf.selectedTrans.length - 1) {
              var tran = hpConf.selectedTrans[i];
              var connections = common.getConnsByTransWithName(data.connections, tran.name, tran.nextNodes.map(function(d){return d.name}), true);
              connections.some(function(c){
                if (c.target === hpConf.selectedTrans[i+1]) {
                  selectedConns.push({id: c.id});
                  return true;
                }
              });
            }
          });

          conf = {
            isEnd: true,
            cur: hpConf.cur,
            new: hpConf.new,
            isEdit: true,
            isChangedName: hpConf.cur != hpConf.new,
            selectedConns: selectedConns
          };

          hpConf.fnChangedMarkingInfo(conf);
        }
      }
    }

    // Draw Transitions
    trans.forEach(function(t) {
      self._transitions.push(fnDrawTransition(t, chartContainer));
    });
    // Draw Connections
    conns.forEach(function(c) {
      self._connections.push(fnDrawConnection(c, chartContainer));
    });

    if (controlBar) {
      fnDrawControlBar(container, happyPaths);
    }

    if (enabledWhiteboardMark) {
      fnDrawWhiteboardMark(container);
    }

    if (editable) {
      fnDrawEditPanel(container, self);
    }
  };

  _draw();

  // if (enabledHighlightPath && _opts.highlightedPath) {
  //   self.highlightPath(_opts.highlightedPath);
  //   if (common.isNumber(highlightTimeout)) {
  //     setTimeout(function() {
  //       self.unHighlightPath(_opts.highlightedPath);
  //     }, highlightTimeout);
  //   }
  // }

  if(common.isArray(_opts.highlightedConnections)) {
    _opts.highlightedConnections.forEach(function(connId){
      self.highlightConnection(connId);
    });
  }

  if(common.isArray(_opts.highlightedTransitions)) {
    _opts.highlightedTransitions.forEach(function(transId){
      self.highlightTransition(transId);
    });
  }

  return self;
};

PNFuzzyChart.prototype.highlightConnection = function(connId) {
  var fullConns = this._connections;
  if(!fullConns) return;
  fullConns.every(function(c) {
    if (c.model.id == connId) {
      c.setHighlight(true);
      return false;
    }
    return true;
  });
};

PNFuzzyChart.prototype.highlightTransition = function(tranId) {
  var fullTrans = this._transitions;
  if(!fullTrans) return;
  fullTrans.forEach(function(t) {
    if (t.model.id == tranId) {
      t.node.classList.add('highlight');
    } else {
      t.node.classList.remove('highlight');
    }
  });
};

PNFuzzyChart.prototype.highlightPath = function(theConns) {
  var fullConns = this._connections;
  if(!fullConns) return;
  fullConns.forEach(function(c) {
    c.unHighlightConnector();
  });
  var conns = common.deepClone(theConns);
  if (conns && conns.length > 0) {
    conns.forEach(function(c) {
      if (c.sourceLabel == 'Start') {
        c.sourceLabel = '开始';
      }
      if (c.targetLabel == 'End') {
        c.targetLabel = '结束';
      }
    });
    // find the start and end trans name from conns
    var startName = null,
      endName = null,
      theTrans = [];
    common.correlateData(conns, theTrans, true, true);
    theTrans.forEach(function(t) {
      if (!t.previousNodes || t.previousNodes.length < 1 || (t.previousNodes.length == 1 && t.previousNodes[0].name == t.name)) {
        startName = t.name;
      }
      if (!t.nextNodes || t.nextNodes.length < 1 || (t.nextNodes.length == 1 && t.nextNodes[0].name == t.name)) {
        endName = t.name;
      }
    });
    var startConn = common.findConnectionFromListWithName(fullConns, this._startTransition.name, startName);
    if (startConn) {
      startConn.highlightConnector();
    }
    conns.forEach(function(c) {
      var theConn = common.findConnectionFromListWithName(fullConns, c.sourceLabel, c.targetLabel);
      if (theConn) {
        theConn.highlightConnector();
      }
    });
    var endConn = common.findConnectionFromListWithName(fullConns, endName, this._endTransition.name);
    if (endConn) {
      endConn.highlightConnector();
    }
  }
};

PNFuzzyChart.prototype.unHighlightPath = function(theConns) {
  var fullConns = this._connections;
  if(!fullConns) return;
  fullConns.forEach(function(c) {
    c.unHighlightConnector();
  });
};

export default PNFuzzyChart
