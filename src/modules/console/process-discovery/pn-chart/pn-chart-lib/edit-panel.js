import Common from './common.js'
import PNFuzzyChartAdapter from './adapter.fuzzy.js'
import _ from 'underscore'

var UUIDGenerator = Common.UUIDGenerator;

function fnFindConnectionFromModelWidthLabel(connections, sourceLabel, targetLabel) {
  var matched = null;
  connections.every(function(conn) {
    if (conn.sourceLabel == sourceLabel && conn.targetLabel == targetLabel) {
      matched = conn;
      return false;
    }
    return true;
  });
  return matched;
}

function reachableToStart(transitions) {
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
  var reachable = true,
    startTransition = null;
  transitions.every(function(t) {
    if (t.isStart) {
      startTransition = t;
      return false;
    }
    return true;
  });
  var reachableTrans = [startTransition];

  transitions.every(function(t) {
    if (!t.isEnd && !fnReachableToStart(t)) {
      reachable = false;
      return false;
    }
    return true;
  });

  return reachable;
}

function EditPanel(container, parent, globalOpts) {
  this.container = container;
  this.parent = parent;
  this.globalOpts = globalOpts;

  var data = parent._data;

  var model = this.model = {
    id: data.id,
    name: data.name,
    processMap: {
      connections: [],
      transitions: []
    }
  };
  data.connections.forEach(function(c) {
    model.processMap.connections.push({
      id: c.id,
      sourceId: c.sourceId,
      targetId: c.targetId,
      sourceLabel: c.sourceLabel,
      targetLabel: c.targetLabel,
      metadata: c._metadata
    });
  });
  data.transitions.forEach(function(t) {
    model.processMap.transitions.push({
      id: t.id,
      name: t.name,
      nodeType: t.nodeType,
      virtual: t.virtual
    });
  });
}

EditPanel.prototype.redrawProcessMap = function(diff, isNoChange) {
  var globalOpts = Object.assign({}, this.globalOpts),
    self = this;
  if (!isNoChange & Common.isFunction(this.parent.opts.onChange)) {
    this.parent.opts.onChange.call(this, this.model, diff);
  }
  var theData = PNFuzzyChartAdapter.adaptData(this.model).data;

  var textWidths = [],
    addedWidth = 21,
    fontConf = {
      fontSize: '9px',
      fontWeight: 'bold'
    };
  theData.transitions.forEach(function(t) {
    var theName = t.name;
    var textSize = Common.getTextSize(theName, fontConf);
    t.textSize = textSize;
    textWidths.push(textSize.width);
  });
  textWidths.sort(function(a, b) { return a - b; });
  var minWidth = Common.getTextSize('Start Process', fontConf).width + addedWidth;
  var nodeWidth = textWidths[Math.ceil(textWidths.length * 0.5)] + addedWidth;
  var theNodeWidth = this.parent.opts.nodeWidth = nodeWidth >= minWidth ? nodeWidth : minWidth;
  theData.transitions.forEach(function(t) {
    if (t.textSize.width + addedWidth <= theNodeWidth) {
      t.displayTitle = t.name;
      return;
    }
    var theName = t.name;
    for (var i = theName.length - 1; i > 0; i--) {
      var displayTitle = theName.substring(0, i);
      var textSize = Common.getTextSize(displayTitle, fontConf);
      if (textSize.width + addedWidth + 9 <= theNodeWidth) {
        t.displayTitle = displayTitle + '...';
        break;
      }
    }
  });
  this.parent.data(theData).draw(this.parent.opts);

  if (Common.isObject(diff)) {
    var connsDiff = diff.connections,
      transDiff = diff.transitions;
    connsDiff.forEach(function(c) {
      self.parent.highlightConnection(c.id);
    });
    transDiff.forEach(function(t) {
      self.parent.highlightTransition(t.id);
    });
  }
};

EditPanel.prototype.removeConnection = function(connObj) {
  var model = this.model,
    self = this,
    res = { code: "000" };

  var transitions = this.parent._transitions.map(function(t) {
      return t.model;
    }),
    connections = this.parent._connections.map(function(c) {
      return c.model;
    });

  // Verify whether it belong to some happy paths? @ren-yuan.tan@hpe.com
  if (connObj.model
      && connObj.model.metadata
      && Common.isArray(connObj.model.metadata.happyPaths)
      && connObj.model.metadata.happyPaths.length) {
    res.code = '210';
    res.hpNames = connObj.model.metadata.happyPaths;
    return res;
  }

  var matchedConn = Common.findItemFromListWithId(connections, connObj.id);
  if (matchedConn) {
    connections.splice(connections.indexOf(matchedConn, 1), 1);
    var source = matchedConn.source,
      target = matchedConn.target;
    source.nextNodes.splice(source.nextNodes.indexOf(target), 1);
    target.previousNodes.splice(target.previousNodes.indexOf(source), 1);

    if ((!target.isEnd && reachableToStart(transitions)) || (target.isEnd && target.previousNodes.length > 0)) {
      var newConnFromSourceToEnd = null;
      if (!target.isEnd && source.nextNodes.length < 1) {
        newConnFromSourceToEnd = {
          id: UUIDGenerator.purchase(),
          sourceId: source.id,
          sourceLabel: source.name,
          targetId: self.parent._endTransition.id,
          targetLabel: self.parent._endTransition.name,
          metadata: {}
        };
        self.model.processMap.connections.push(newConnFromSourceToEnd);
      }
      self.model.processMap.connections.splice(Common.findItemIndexFromListWithId(self.model.processMap.connections, connObj.id), 1);
      var diff = { transitions: [], connections: [] };
      if (newConnFromSourceToEnd) {
        diff.connections.push(newConnFromSourceToEnd);
      }
      self.redrawProcessMap(diff);
    } else {
      res.code = "200";
      self.redrawProcessMap(null, true);
    }
  }
  return res;
};

EditPanel.prototype.addConnection = function(previousName, nextName) {
  var model = this.model,
    self = this,
    res = { code: "000" },
    newConnFromNextToEnd = null,
    needToAddPreviousTrans = false,
    needToAddNextTrans = false;

  var existedPreviousTrans = Common.findItemFromListWithName(model.processMap.transitions, previousName);
  var existedNextTrans = Common.findItemFromListWithName(model.processMap.transitions, nextName);

  if (!existedPreviousTrans) {
    needToAddPreviousTrans = true;
    existedPreviousTrans = {
      id: UUIDGenerator.purchase(),
      name: previousName,
      nodeType: "MIDDLE",
      virtual: false
    };
    model.processMap.transitions.push(existedPreviousTrans);
  }
  if (!existedNextTrans) {
    needToAddNextTrans = true;
    existedNextTrans = {
      id: UUIDGenerator.purchase(),
      name: nextName,
      nodeType: "MIDDLE",
      virtual: false
    };
    model.processMap.transitions.push(existedNextTrans);
    var newConnFromNextToEnd = {
      id: UUIDGenerator.purchase(),
      sourceId: existedNextTrans.id,
      sourceLabel: existedNextTrans.name,
      targetId: self.parent._endTransition.id,
      targetLabel: self.parent._endTransition.name,
      metadata: {}
    };
    model.processMap.connections.push(newConnFromNextToEnd);
  }

  var existedConn = fnFindConnectionFromModelWidthLabel(model.processMap.connections, existedPreviousTrans.name, existedNextTrans.name);
  if (existedConn) {
    res.code = '201';
  } else {
    var newConn = {
      id: UUIDGenerator.purchase(),
      sourceId: existedPreviousTrans.id,
      sourceLabel: previousName,
      targetId: existedNextTrans.id,
      targetLabel: nextName,
      metadata: {}
    };
    model.processMap.connections.push(newConn);
    var diff = { connections: [], transitions: [] };
    if (newConnFromNextToEnd) {
      diff.connections.push(newConnFromNextToEnd);
    }
    diff.connections.push(newConn);
    if (needToAddNextTrans) {
      diff.transitions.push(existedNextTrans);
    }
    if (needToAddPreviousTrans) {
      diff.transitions.push(existedPreviousTrans);
    }
    self.redrawProcessMap(diff);
  }

  return res;
};

EditPanel.prototype.updateConnection = function(newConn, oldConn) {
  var model = this.model,
    self = this,
    res = { code: "000" };

  // Verify whether it belong to some happy paths? @ren-yuan.tan@hpe.com
  var connections = self.parent._connections.map(function(c) { return c.model });
  var oldC = Common.findConnectionFromListWithName(connections, oldConn.source, oldConn.target);
  if (oldC
      && oldC.metadata
      && Common.isArray(oldC.metadata.happyPaths)
      && oldC.metadata.happyPaths.length) {
    res.code = '210';
    res.hpNames = oldC.metadata.happyPaths;
    return res;
  }

  var existedPreviousTransInModel = Common.findItemFromListWithName(model.processMap.transitions, newConn.source);
  var existedNextTransInModel = Common.findItemFromListWithName(model.processMap.transitions, newConn.target);
  var needToAddPreviousTrans = false,
    needToAddNextTrans = false;

  if (!existedPreviousTransInModel) {
    existedPreviousTransInModel = {
      id: UUIDGenerator.purchase(),
      name: newConn.source,
      nodeType: "MIDDLE",
      virtual: false
    };
    needToAddPreviousTrans = true;
  }
  if (!existedNextTransInModel) {
    if (newConn.source != newConn.target) {
      existedNextTransInModel = {
        id: UUIDGenerator.purchase(),
        name: newConn.target,
        nodeType: "MIDDLE",
        virtual: false
      };
      needToAddNextTrans = true;
    } else {
      existedNextTransInModel = existedPreviousTransInModel;
    }
  }

  var existedConn = fnFindConnectionFromModelWidthLabel(model.processMap.connections, existedPreviousTransInModel.name, existedNextTransInModel.name);
  if (existedConn) {
    res.code = "201";
    self.redrawProcessMap(null, true);
  } else {
    var connections = self.parent._connections.map(function(c) {
        return c.model;
      }),
      transitions = self.parent._transitions.map(function(t) {
        return t.model;
      }),
      oldConnSource = null,
      oldConnTarget = null;
    var matchedConn = Common.findConnectionFromListWithName(connections, oldConn.source, oldConn.target);
    if (matchedConn) {
      connections.splice(connections.indexOf(matchedConn), 1);
      oldConnSource = matchedConn.source,
        oldConnTarget = matchedConn.target;
      oldConnSource.nextNodes.splice(oldConnSource.nextNodes.indexOf(oldConnTarget), 1);
      oldConnTarget.previousNodes.splice(oldConnTarget.previousNodes.indexOf(oldConnSource), 1);
    }
    var existedPreviousTrans = Common.findItemFromListWithName(transitions, newConn.source);
    var existedNextTrans = Common.findItemFromListWithName(transitions, newConn.target);
    if (!existedPreviousTrans) {
      existedPreviousTrans = {
        id: UUIDGenerator.purchase(),
        name: newConn.source,
        nodeType: "MIDDLE",
        virtual: false,
        previousNodes: [],
        nextNodes: [],
        isStart: false,
        isEnd: false,
        isMiddle: true,
        isTransition: true
      };
      transitions.push(existedPreviousTrans);
    }
    if (!existedNextTrans) {
      if (newConn.source == newConn.target) {
        existedNextTrans = existedPreviousTrans;
      } else {
        existedNextTrans = {
          id: UUIDGenerator.purchase(),
          name: newConn.target,
          nodeType: "MIDDLE",
          virtual: false,
          previousNodes: [],
          nextNodes: [],
          isStart: false,
          isEnd: false,
          isMiddle: true,
          isTransition: true
        };
        transitions.push(existedNextTrans);
      }
      existedNextTrans.previousNodes.push(existedPreviousTrans);
      existedPreviousTrans.nextNodes.push(existedNextTrans);
      connections.push({
        id: UUIDGenerator.purchase(),
        isConnection: true,
        source: existedPreviousTrans,
        sourceLabel: existedPreviousTrans.name,
        target: existedNextTrans,
        targetLabel: existedNextTrans.name
      });
    }
    if (reachableToStart(transitions)) {
      var newConnFromNextToEnd = null,
        newConnFromOldSourceToEnd = null;
      if (needToAddPreviousTrans) {
        self.model.processMap.transitions.push(existedPreviousTransInModel);
      }
      if (!oldConnTarget.isEnd && oldConnSource.nextNodes.length < 1) {
        newConnFromOldSourceToEnd = {
          id: UUIDGenerator.purchase(),
          sourceId: oldConnSource.id,
          sourceLabel: oldConnSource.name,
          targetId: self.parent._endTransition.id,
          targetLabel: self.parent._endTransition.name,
          metadata: {}
        };
        self.model.processMap.connections.push(newConnFromOldSourceToEnd);
      }
      if (needToAddNextTrans) {
        self.model.processMap.transitions.push(existedNextTransInModel);
        newConnFromNextToEnd = {
          id: UUIDGenerator.purchase(),
          sourceId: existedNextTransInModel.id,
          sourceLabel: existedNextTransInModel.name,
          targetId: self.parent._endTransition.id,
          targetLabel: self.parent._endTransition.name,
          metadata: {}
        };
        self.model.processMap.connections.push(newConnFromNextToEnd);
      }
      var newConn = {
        id: UUIDGenerator.purchase(),
        sourceId: existedPreviousTransInModel.id,
        sourceLabel: existedPreviousTransInModel.name,
        targetId: existedNextTransInModel.id,
        targetLabel: existedNextTransInModel.name,
        metadata: {}
      };
      var oldConnInModel = fnFindConnectionFromModelWidthLabel(model.processMap.connections, oldConn.source, oldConn.target);
      self.model.processMap.connections.splice(model.processMap.connections.indexOf(oldConnInModel), 1);
      self.model.processMap.connections.push(newConn);
      var diff = { connections: [], transitions: [] };
      diff.connections.push(newConn);
      if (newConnFromNextToEnd) {
        diff.connections.push(newConnFromNextToEnd);
      }
      if (needToAddNextTrans) {
        diff.transitions.push(existedNextTransInModel.id);
      }
      if (needToAddPreviousTrans) {
        diff.transitions.push(existedPreviousTransInModel.id);
      }
      if (newConnFromOldSourceToEnd) {
        diff.connections.push(newConnFromOldSourceToEnd);
      }
      self.redrawProcessMap(diff);
    } else {
      res.code = "202";
      self.redrawProcessMap(null, true);
    }
  }
  return res;
};

EditPanel.prototype.removeTransition = function(transObj) {
  var model = this.model,
    self = this,
    res = { code: "000" };
  var connections = self.parent._connections.map(function(c) {
      return c.model;
    }),
    transitions = self.parent._transitions.map(function(t) {
      return t.model;
    });

  // Verify whether it belong to some happy paths? @ren-yuan.tan@hpe.com
  var hpNames = relatedHappyPaths(transObj, connections);
  if (hpNames.length) {
    res.code = "110";
    res.hpNames = hpNames;
    return res;
  }

  var matchedTrans = Common.findItemFromListWithId(transitions, transObj._id);
  if (matchedTrans) {
    var connsToRemoveInModel = [],
      upStreamConnsToRemove = [];
    matchedTrans.previousNodes.forEach(function(pNode) {
      var matchedConn = Common.findConnectionFromList(connections, pNode.id, matchedTrans.id);
      var matchedConnInModel = fnFindConnectionFromModelWidthLabel(model.processMap.connections, pNode.name, matchedTrans.name);
      if (matchedConn) {
        upStreamConnsToRemove.push(matchedConn);
        connections.splice(connections.indexOf(matchedConn), 1);
      }
      if (matchedConnInModel) {
        connsToRemoveInModel.push(matchedConnInModel);
      }
      pNode.nextNodes.splice(pNode.nextNodes.indexOf(matchedTrans), 1);
    });
    matchedTrans.nextNodes.forEach(function(nNode) {
      var matchedConn = Common.findConnectionFromList(connections, matchedTrans.id, nNode.id);
      var matchedConnInModel = fnFindConnectionFromModelWidthLabel(model.processMap.connections, matchedTrans.name, nNode.name);
      if (matchedConn) {
        connections.splice(connections.indexOf(matchedConn), 1);
      }
      if (matchedConnInModel) {
        connsToRemoveInModel.push(matchedConnInModel);
      }
      nNode.previousNodes.splice(nNode.previousNodes.indexOf(matchedTrans), 1);
    });
    transitions.splice(transitions.indexOf(matchedTrans), 1);
    if (!reachableToStart(transitions)) {
      res.code = "100";
      self.redrawProcessMap(null, true);
    } else {
      var diff = { connections: [], transitions: [] };
      upStreamConnsToRemove.forEach(function(c) {
        var source = c.source,
          target = c.target;
        if (source.nextNodes.length < 1) {
          var newConn = {
            id: UUIDGenerator.purchase(),
            sourceId: source.id,
            sourceLabel: source.name,
            targetId: self.parent._endTransition.id,
            targetLabel: self.parent._endTransition.name,
            metadata: {}
          };
          diff.connections.push(newConn);
          model.processMap.connections.push(newConn);
        }
      });
      connsToRemoveInModel.forEach(function(c) {
        model.processMap.connections.splice(model.processMap.connections.indexOf(c), 1);
      });
      var matchedTransInModelIndex = Common.findItemIndexFromListWithId(model.processMap.transitions, transObj._id);
      model.processMap.transitions.splice(matchedTransInModelIndex, 1);
      self.redrawProcessMap(diff);
    }
  }

  return res;

  function relatedHappyPaths(transObj, connections) {
    var hpNames = [],
      allRelationConns = [],
      curNodeName = transObj._tran.name,
      nextNodesName = transObj._tran.nextNodes.map(function(n){ return n.name }),
      preNodesName = transObj._tran.previousNodes.map(function(n){ return n.name });

    if (preNodesName.length) {
      allRelationConns = allRelationConns.concat(Common.getConnsByTransWithName(connections, curNodeName, preNodesName, false));
    }
    if (nextNodesName.length) {
      allRelationConns = allRelationConns.concat(Common.getConnsByTransWithName(connections, curNodeName, nextNodesName, true));
    }

    if (allRelationConns.length) {
      allRelationConns.forEach(function(c){
        if (c.metadata) {
          Common.isArray(c.metadata.happyPaths) && c.metadata.happyPaths.forEach(function(name){
            hpNames.indexOf(name) === -1 && hpNames.push(name);
          });
        }
      });
    }

    return hpNames;
  }
};

// PNTransition Instance
EditPanel.prototype.updateTransition = function(transObj, newName) {
  var model = this.model,
    self = this;
  if (newName.trim().length > 50) {
    return { code: "001" };
  }
  if(Common.findItemFromListWithName(model.processMap.transitions, newName)) {
    return { code: "002"};
  }
  var matchedTransInModel = Common.findItemFromListWithId(model.processMap.transitions, transObj._id);
  if (matchedTransInModel) {
    matchedTransInModel.name = newName;

    model.processMap.connections.forEach(function(c) {
      if (c.sourceLabel == transObj._title) {
        c.sourceLabel = newName;
      }
      if (c.targetLabel == transObj._title) {
        c.targetLabel = newName;
      }
    });
    self.redrawProcessMap();
    self.parent.highlightTransition(transObj._id);
  }

  return { code: "000" };
};

EditPanel.prototype.errorMap = function() {
  return {
    "000": "Operation succeed.",
    "001": "The activity name should not be longger than 50 characters.",
    "002": "The activity already existed.",
    "100": "Not able to delete, it will cause broken connection in the process map. Please work on the connection for the impacted activities before deleting this activity.",
    "110": "Not able to delete, it relates to some Happy Path. Please remove all related Happy Path before deleting this activity.",
    "200": "Not able to delete, it will cause broken connection in the process map. Please work on the connection for the impacted activities before deleting this connection.",
    "201": "The connection already existed.",
    "202": "Not able to delete, it will cause broken connection in the process map. Please work on the connection for the impacted activities before updating this connection.",
    "210": "Not able to delete, it relates to some Happy Path. Please remove all related Happy Path before deleting this connection.",
  };
};

EditPanel.prototype.show = function(editWrapper) {
  this.node.innerHTML = "";
  this.node.style.display = 'block';
  this.node.appendChild(editWrapper);
};

EditPanel.prototype.hide = function() {
  this.node.style.display = 'none';
};

EditPanel.prototype.drawWrapper = function(sMarginTop) {
  var editWrapper = document.createElement('div');
  editWrapper.className = 'edit-wrapper';
  editWrapper.style.marginTop = sMarginTop;
  return editWrapper;
}

EditPanel.prototype.drawWrapperHeader = function(sTitie) {
  var self = this;
  var editHeader = document.createElement('div');
  editHeader.className = 'edit-header';
  var title = document.createElement('div');
  title.className = 'edit-title';
  title.innerHTML = sTitie;
  editHeader.appendChild(title);
  var closeBtn = document.createElement('div');
  closeBtn.className = 'edit-close';
  closeBtn.innerHTML = '<i class="icon-close2"></i>';
  editHeader.appendChild(closeBtn);
  closeBtn.addEventListener("click", function() {
    self.hide();
  });
  return editHeader;
};

EditPanel.prototype.drawWrapperForm = function(editWrapper) {
  var editBody = document.createElement('div');
  editBody.className = 'edit-body';
  editWrapper.appendChild(editBody);

  var editForm = document.createElement('div');
  editForm.className = 'form';
  editBody.appendChild(editForm);

  return editForm;
};

EditPanel.prototype.drawWrapperAction = function(aActions) {
  var actionGroup = document.createElement('div');
  actionGroup.className = 'action-group';

  aActions.forEach(function(action) {
    let btn = document.createElement('button');
    btn.innerHTML = action.title;
    btn.className = action.className;
    actionGroup.appendChild(btn);

    btn.addEventListener('click', action.onClick);
  });

  return actionGroup;
};

EditPanel.prototype.drawSpanGroup = function(sLabel, sValue) {
  var formGroup = document.createElement('div');
  formGroup.className = 'form-group';
  var label = document.createElement('label');
  label.innerHTML = sLabel;
  formGroup.appendChild(label);
  var spanWrapper = document.createElement('div');
  formGroup.appendChild(spanWrapper);
  var span = document.createElement('span');
  span.innerHTML = sValue;
  spanWrapper.appendChild(span);

  return formGroup;
};

EditPanel.prototype.drawInputTextGroup = function(sLabel, sName, sValue, fnOnChange) {
  var formGroup = document.createElement('div');
  formGroup.className = 'form-group';
  var label = document.createElement('label');
  label.innerHTML = sLabel;
  formGroup.appendChild(label);
  var inputWrapper = document.createElement('div');
  formGroup.appendChild(inputWrapper);
  var input = document.createElement('input');
  input.type = 'text';
  input.name = sName;
  input.className = 'form-control';
  input.value = sValue;
  input.addEventListener("keyup", _.debounce(function(){
    fnOnChange.call(input);
  }, 400));
  inputWrapper.appendChild(input);

  return formGroup;
};

EditPanel.prototype.drawSelectGroup = function(sLabel, sName, sValue, aOptions, fnOnChange, fnOnToggleNew, fnOnNewActivity) {
  var self = this;

  var fnUpdateValue = function(value) {
    if (Common.isFunction(fnOnChange)) {
      fnOnChange.call(self, value);
    }
  };

  var fnNewActivity = function(value){
    if(Common.isFunction(fnOnNewActivity)) {
      fnOnNewActivity.call(self, value);
    }
  };

  var fnToggleNewAct = function(isNew) {
    if (Common.isFunction(fnOnToggleNew)) {
      fnOnToggleNew.call(self, isNew);
    }
  };

  var fnUpdateDropdownList = function(_eList, _aOptions, _fnItemOnClick) {
    _eList.innerHTML = '';

    _aOptions.forEach(function(option) {
      var li = document.createElement('li');
      li.innerHTML = option.title;
      li.addEventListener("click", _fnItemOnClick);
      _eList.appendChild(li);
    });
  };
  var formGroup = document.createElement('div');
  formGroup.className = 'form-group';
  var label = document.createElement('label');
  label.innerHTML = sLabel;
  formGroup.appendChild(label);
  var selectWrapper = document.createElement('div');
  selectWrapper.style.verticalAlign = 'middle';
  formGroup.appendChild(selectWrapper);

  var newActInputGroup = document.createElement('div');
  newActInputGroup.className = 'input-group';
  newActInputGroup.style.display = 'none';
  var newActInput = document.createElement('input');
  newActInput.type = 'text';
  newActInput.className = 'form-control';
  newActInput.placeholder = 'New Activity Name';
  newActInput.addEventListener("keyup", _.debounce(function(){
    fnNewActivity.call(newActInput, newActInput.value);
  }, 400));
  newActInputGroup.appendChild(newActInput);
  var newActCancelBtnWrapper = document.createElement('span');
  newActCancelBtnWrapper.className = 'input-group-btn';
  var newActCancelBtn = document.createElement('button');
  newActCancelBtn.className = 'btn';
  newActCancelBtn.innerHTML = '<i class="icon-close"></i>';
  newActCancelBtn.addEventListener('click', function() {
    select.style.display = 'block';
    newActInputGroup.style.display = 'none';
    selected.innerHTML = '';
    fnUpdateValue('');
  });
  newActCancelBtnWrapper.appendChild(newActCancelBtn);
  newActInputGroup.appendChild(newActCancelBtnWrapper);
  selectWrapper.appendChild(newActInputGroup);

  var select = document.createElement('div');
  select.className = 'pn-select';
  selectWrapper.appendChild(select);

  var selectInput = document.createElement('div');
  selectInput.className = 'pn-select-input';
  var selected = document.createElement('span');
  selected.innerHTML = sValue;
  selectInput.appendChild(selected);
  var label = document.createElement('label');
  label.innerHTML = '&#9660;';
  selectInput.appendChild(label);
  selectInput.addEventListener("click", function() {
    if (select.classList.contains('active')) {
      select.classList.remove('active');
    } else {
      select.classList.add('active');
    }
  });
  select.appendChild(selectInput);

  var dropdown = document.createElement('div');
  dropdown.className = 'pn-select-dropdown';
  var newActOption = document.createElement('div');
  newActOption.className = 'pn-select-dropdown-option option-clickable';
  
  //Azhaziq - 15/03/2017 - Fix button css issue, change from div element to button
  var newActOptionBtn = document.createElement('button');
  newActOptionBtn.className = 'btn btn-primary';
  newActOptionBtn.innerHTML = 'New Activity';
  newActOption.appendChild(newActOptionBtn);
  newActOptionBtn.addEventListener('click', function() {
    fnToggleNewAct(true);
    select.style.display = 'none';
    newActInputGroup.style.display = 'table';
    newActInput.value = '';
    fnUpdateValue('');
  });
  dropdown.appendChild(newActOption);
  var existOption = document.createElement('div');
  existOption.className = 'pn-select-dropdown-option';
  dropdown.appendChild(existOption);
  var tip = document.createElement('div');
  tip.innerHTML = 'Select existing (click on any)';
  existOption.appendChild(tip);
  var fnOnClickExistOptionList = function() {
    fnToggleNewAct(false);
    var newValue = this.innerHTML.trim();
    selected.innerHTML = newValue;
    select.classList.remove('active');
    fnUpdateValue(newValue);
  };
  var fnOnSearch = function() {
    var _aOptions = [],
      searchText = searchInput.value;
    aOptions.forEach(function(_option) {
      if (_option.title.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
        _aOptions.push({
          title: _option.title,
          id: _option.id
        });
      }
    });
    fnUpdateDropdownList(existOptionList, _aOptions, fnOnClickExistOptionList);
  };
  var searchWrapper = document.createElement('div');
  searchWrapper.className = 'input-group';
  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search';
  searchInput.className = 'form-control';
  searchInput.addEventListener('keyup', fnOnSearch);
  searchWrapper.appendChild(searchInput);
  var searchBtnWrapper = document.createElement('span');
  searchBtnWrapper.className = 'input-group-btn';
  var searchBtn = document.createElement('button');
  searchBtn.className = 'btn';
  searchBtn.addEventListener("click", fnOnSearch);
  searchBtn.innerHTML = '<i class="icon-search"></i>';
  searchBtnWrapper.appendChild(searchBtn);
  searchWrapper.appendChild(searchBtnWrapper);
  existOption.appendChild(searchWrapper);
  var existOptionList = document.createElement('ul');
  existOption.appendChild(existOptionList);
  fnUpdateDropdownList(existOptionList, aOptions, fnOnClickExistOptionList);
  select.appendChild(dropdown);

  return formGroup;
};

EditPanel.prototype.draw = function() {
  var container = this.container,
    self = this;

  var editPanel = self.node = document.createElement("div");
  editPanel.className = 'edit-panel';
  container.appendChild(editPanel);

  return self;
};


export default EditPanel
