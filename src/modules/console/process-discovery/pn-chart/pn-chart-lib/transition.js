import common from './common.js'

function PNTransition(parent, container, p) {
  this._parent = parent;
  this._container = container;
  this._tran = p;
  this._pos = p.position;
  this._size = p.size;
  this._title = p.name;
  this._token = p.token;
  this._addon = p.addon;
  this._isStart = !!p.isStart;
  this._textSize = p.textSize;
  this._displayTitle = p.displayTitle;
  this._isEnd = !!p.isEnd;
  this._id = p.id;
  this._pid = p.pid;
  this._commentCount = p.commentCount;
}

PNTransition.prototype.changeTitle = function(title) {
  this._title = title;
  this.titleNode.innerHTML = title;
};

PNTransition.prototype.draw = function(opts, globalOpts) {
  opts = Object.assign({}, opts);
  globalOpts = Object.assign({}, globalOpts);
  var self = this;
  var container = this._container,
    thisTran = this._tran,
    sID = this._id,
    oPos = this._pos,
    oSize = this._size,
    sTitle = this._title,
    sDisplayTitle = this._displayTitle,
    oTextSize = this._textSize,
    nToken = this._token || 0,
    bIsStart = this._isStart,
    bIsEnd = this._isEnd,
    invisible = false,
    hpConf = globalOpts.hpConf,
    notyService = globalOpts.notyService,
    _connections = globalOpts.connections,
    disabledAddon = !!opts.disabledAddon,
    commentCount = this._commentCount || 0,
    fnDeletedTranInHP = function(tTran, hpConf) {
      var tIndex = -1,
        curLastTran = null;

      curLastTran = hpConf.selectedTrans[hpConf.selectedTrans.length - 1];

      // update candidates
      hpConf.candidateTrans.forEach(function(t) {
        t.node.classList.add('inactive');
        t.node.classList.remove('candidate');

        var connections = common.getConnsByTransWithName(_connections, t.name, t.previousNodes.map(function(d) { return d.name }));
        connections.forEach(function(c) {
          if (c.source === curLastTran) {
            c.opacity = 0.1;
            c.node.node.style.opacity = 0.1;
          }
        });
      });

      // update all selected tran util tTran
      hpConf.selectedTrans.forEach(function(t, i) {
        // find the last one, even it's not needed now.
        if (t === thisTran) tIndex = i;
      });
      for (var i = hpConf.selectedTrans.length - 1; i >= tIndex; i--) {
        hpConf.selectedTrans[i].node.classList.add('inactive');
        hpConf.selectedTrans[i].node.classList.remove('active');
        if (hpConf.selectedTrans[i].isMiddle) hpConf.selectedTrans[i].node.style.backgroundColor = '#fff';

        var t = hpConf.selectedTrans[i];
        var connections = common.getConnsByTransWithName(_connections, t.name, t.previousNodes.map(function(d) { return d.name }));
        connections.forEach(function(c) {
          if (c.source === hpConf.selectedTrans[i - 1]) {
            c.opacity = 0.1;
            c.node.node.style.opacity = 0.1;
          }
        });
      }

      // update state center
      curLastTran = hpConf.selectedTrans[tIndex - 1];
      hpConf.selectedTrans = hpConf.selectedTrans.slice(0, tIndex);
      hpConf.candidateTrans = [];
      curLastTran.nextNodes.forEach(function(t) {
        hpConf.selectedTrans.indexOf(t) === -1 && hpConf.candidateTrans.push(t);
      });

      // update next candidates
      hpConf.candidateTrans.forEach(function(t) {
        t.node.classList.add('candidate');
        t.node.classList.remove('inactive');

        var connections = common.getConnsByTransWithName(_connections, t.name, t.previousNodes.map(function(d) { return d.name }));
        connections.forEach(function(c) {
          if (c.source === curLastTran) {
            c.opacity = 1;
            c.node.node.style.opacity = 1;
          }
        });
      });

      fnChangedMarkingInfo(hpConf, false);
    },
    fnSelectedTranInHP = function(tTran, hpConf) {
      var curLastTran = null;

      curLastTran = hpConf.selectedTrans[hpConf.selectedTrans.length - 1];

      // update candidates
      hpConf.candidateTrans.forEach(function(t) {
        if (t === tTran) {
          t.node.classList.add('active');
          t.node.classList.remove('candidate');
          if (t.isMiddle) t.node.style.backgroundColor = '#333';
        } else {
          var connections = common.getConnsByTransWithName(_connections, t.name, t.previousNodes.map(function(d) { return d.name }));
          connections.forEach(function(c) {
            if (c.source === curLastTran) {
              c.opacity = 0.1;
              c.node.node.style.opacity = 0.1;

              c.target.node.classList.add('inactive');
              c.target.node.classList.remove('candidate');
            }
          });
        }
      });

      // update state center
      curLastTran = tTran;
      hpConf.selectedTrans.push(tTran);
      hpConf.candidateTrans = [];
      curLastTran.nextNodes.forEach(function(t) {
        hpConf.selectedTrans.indexOf(t) === -1 && hpConf.candidateTrans.push(t);
      });

      // update next candidates
      hpConf.candidateTrans.forEach(function(t) {
        t.node.classList.add('candidate');
        t.node.classList.remove('inactive');

        var connections = common.getConnsByTransWithName(_connections, t.name, t.previousNodes.map(function(d) { return d.name }));
        connections.forEach(function(c) {
          if (c.source === curLastTran) {
            c.opacity = 1;
            c.node.node.style.opacity = 1;
          }
        });
      });

      // auto select
      if (hpConf.candidateTrans.length === 1) {
        fnSelectedTranInHP(hpConf.candidateTrans[0], hpConf);
        return;
      }

      // is end
      if (tTran.isEnd) {
        var isHave = false;

        if (hpConf.isAdd) {
          for (var k in hpConf.allFullHP) {
            if (common.judgeArrIsEqualByName(hpConf.selectedTrans, hpConf.allFullHP[k].selectedTrans)) {
              isHave = true;
              break;
            }
          }
        } else if (hpConf.isEdit) {
          for (var k in hpConf.allFullHP) {
            if (k !== hpConf.cur && common.judgeArrIsEqualByName(hpConf.selectedTrans, hpConf.allFullHP[k].selectedTrans)) {
              isHave = true;
              break;
            }
          }
        }

        if (isHave) {
          notyService.alertWithOneButton({ text: 'The same path has exist!' });
        } else {
          fnChangedMarkingInfo(hpConf, true);
        }

        return;
      }

      fnChangedMarkingInfo(hpConf, false);
    },
    fnChangedMarkingInfo = function(hpConf, isEnd) {
      if (common.isFunction(hpConf.fnChangedMarkingInfo)) {
        var conf = null;

        if (!isEnd) {
          conf = { isEnd: false };
        } else {
          var selectedConns = [];
          hpConf.selectedTrans.forEach(function(t, i) {
            if (i !== hpConf.selectedTrans.length - 1) {
              var tran = hpConf.selectedTrans[i];
              var connections = common.getConnsByTransWithName(_connections, tran.name, tran.nextNodes.map(function(d) { return d.name }), true);
              connections.some(function(c) {
                if (c.target === hpConf.selectedTrans[i + 1]) {
                  selectedConns.push({ id: c.id });
                  return true;
                }
              });
            }
          });

          if (hpConf.isAdd) {
            conf = {
              isEnd: true,
              new: hpConf.new,
              isAdd: true,
              selectedConns: selectedConns
            };
          } else if (hpConf.isEdit) {
            conf = {
              isEnd: true,
              cur: hpConf.cur,
              new: hpConf.new,
              isEdit: true,
              isChangedName: hpConf.cur != hpConf.new,
              selectedConns: selectedConns
            };
          }
        }

        hpConf.fnChangedMarkingInfo(conf);
      }
    },
    fnHover = function() {
      if (common.isFunction(opts.onHover)) {
        opts.onHover.call(self, self);
      }
      if (globalOpts.editable && !self.editBox) {
        var fnCreateEditBox = function() {
          var editPanel = self._parent.editPanel;
          var noty = self._parent._notyService;

          var editBox = self.editBox = document.createElement('div');
          editBox.className = 'edit-box';
          if ((globalOpts.newWhiteboard && bIsStart) || (!globalOpts.newWhiteboard && bIsEnd)) {
            editBox.className += ' action-1'
          } else if (globalOpts.newWhiteboard && !bIsEnd && !bIsStart) {
            editBox.className += ' action-3';
          } else if (bIsStart && !globalOpts.newWhiteboard) {
            editBox.className += ' action-2';
          }
          self.node.appendChild(editBox);

          if (!bIsStart && !bIsEnd) {
            var fnToEdit = function(act) {
              var _act = {
                name: act._title
              };
              var disabledSave = true,
                saveBtn = null;
              var editWrapper = editPanel.drawWrapper('-116px');

              var editHeader = editPanel.drawWrapperHeader('Edit Activity');
              editWrapper.appendChild(editHeader);

              var editForm = editPanel.drawWrapperForm(editWrapper);

              var nameFormGroup = editPanel.drawInputTextGroup('Activity Name', 'activityName', act._title, function() {
                _act.name = this.value.trim();

                var existed = false;
                self._parent._transitions.forEach(t => {
                  if (t.name == _act.name && t.name != act._title) {
                    existed = true;
                    return false;
                  }
                  return true;
                });

                if (!common.validateActivityNameChars(_act.name)) {
                  disabledSave = true;
                  noty.alertWithOneButton({
                    text: '<br/>Invalid activity name.<br/><br/>',
                  });
                } else if (existed) {
                  disabledSave = true;
                  noty.alertWithOneButton({
                    text: '<br/>Duplicate activity name.<br/><br/>',
                  });
                } else if (_act.name.trim().length > 0 && _act.name != act._title) {
                  disabledSave = false;
                } else {
                  disabledSave = true;
                }
                if (disabledSave) {
                  saveBtn.classList.add('disabled');
                } else {
                  saveBtn.classList.remove('disabled');
                }
              });
              editForm.appendChild(nameFormGroup);

              var actionGroup = editPanel.drawWrapperAction([{
                title: 'Save',
                className: 'btn btn-primary disabled',
                onClick: function() {
                  if (!disabledSave) {
                    var res = editPanel.updateTransition(act, _act.name);
                    if (res.code != '000') {
                      noty.alertWithOneButton({
                        text: '<br/>' + editPanel.errorMap()[res.code] + '<br/><br/>',
                      });
                    } else {
                      editPanel.hide();
                    }
                  }
                }
              }, {
                title: 'Reset',
                className: 'btn btn-default',
                onClick: function() {
                  _act.name = act._title;
                  editPanel.hide();
                }
              }]);
              saveBtn = actionGroup.childNodes[0];
              editForm.appendChild(actionGroup);

              editPanel.show(editWrapper);
            };
            var fnClickEdit = function(evt) {
              evt.preventDefault();
              evt.stopPropagation();

              fnToEdit(self);
            };

            var fnClickRemove = function(evt) {
              evt.preventDefault();
              evt.stopPropagation();

              noty.alertWithTwoButtons({
                text: "<br/>Are you sure to delete this activity?<br/><br/>",
                btn1text: "OK",
                btn1onclick: function() {
                  var message = '',
                    res = editPanel.removeTransition(self);
                  if (res.code != '000') {
                    if (res.code == '110') {
                      message = '<br/>Not able to delete, it relates to Happy Path: ' +
                        res.hpNames.join(',') +
                        '. Please remove all related Happy Paths before deleting this activity.<br/><br/>';
                    } else {
                      message = '<br/>' + editPanel.errorMap()[res.code] + '<br/><br/>';
                    }
                    noty.alertWithOneButton({ text: message });
                  }
                },
                btn2text: "Cancel",
                btn2class: 'btn btn-secondary'
              });
            };

            var editBtn = document.createElement('span');
            editBtn.className = 'edit-action';
            editBtn.innerHTML = '<i class="icon-pencil"></i>';
            editBox.appendChild(editBtn);

            var removeBtn = document.createElement('span');
            removeBtn.className = 'edit-action';
            removeBtn.innerHTML = '<i class="icon-trash-o"></i>';
            editBox.appendChild(removeBtn);
            editBtn.addEventListener("click", fnClickEdit);
            removeBtn.addEventListener("click", fnClickRemove);
          }

          if (!globalOpts.newWhiteboard) {
            var fnClickComment = function(evt) {
              evt.preventDefault();
              evt.stopPropagation();

              if (common.isFunction(globalOpts.onToggleComment)) {
                globalOpts.onToggleComment.call(self, self);
              }

            };
            var commentBtn = document.createElement('span');
            commentBtn.className = 'edit-action';
            commentBtn.innerHTML = '<i class="icon-comment-o"></i>';
            editBox.appendChild(commentBtn);
            commentBtn.addEventListener("click", fnClickComment);
          }

          if (!bIsEnd) {
            var addBtn = document.createElement('span');
            addBtn.className = 'edit-action';
            addBtn.innerHTML = '<i class="icon-plus"></i>';
            editBox.appendChild(addBtn);

            var fnToAdd = function(act, acts) {
              var previousName = act._title,
                nextName = act._title,
                disabledSave = false,
                saveBtn = null;
              var validate = function(isNewAct) {
                var existed = false;
                acts.forEach(t => {
                  if (t.title == nextName && isNewAct) {
                    existed = true;
                    return false;
                  }
                  return true;
                });
                if (!common.validateActivityNameChars(nextName)) {
                  disabledSave = true;
                  noty.alertWithOneButton({
                    text: '<br/>Invalid activity name.<br/><br/>',
                  });
                } else if (existed) {
                  disabledSave = true;
                  noty.alertWithOneButton({
                    text: '<br/>Duplicate activity name.<br/><br/>',
                  });
                } else if (previousName && previousName.trim().length > 0 && nextName && nextName.trim().length > 0) {
                  disabledSave = false;
                } else {
                  disabledSave = true;
                }
                if (disabledSave) {
                  saveBtn.classList.add('disabled');
                } else {
                  saveBtn.classList.remove('disabled');
                }
              };
              var editWrapper = editPanel.drawWrapper('-116px');

              var editHeader = editPanel.drawWrapperHeader('New Connection');
              editWrapper.appendChild(editHeader);

              var editForm = editPanel.drawWrapperForm(editWrapper);

              // var pActivityFormGroup = editPanel.drawSelectGroup('Previous Activity', 'previousActivityName', act._title, acts, function(val) {
              //   previousName = val;
              //   validate();
              // });
              var pActivityFormGroup = editPanel.drawSpanGroup('Previous Activity', act._title);
              editForm.appendChild(pActivityFormGroup);
              var nActivityFormGroup = editPanel.drawSelectGroup('Next Activity', 'nextActivityName', act._title, acts.filter(function(act) {
                return !act.isStart;
              }), function(val) {
                nextName = val.trim();
                validate();
              }, function(isNew) {
                nnActivityFormGroup.style.display = isNew ? 'block' : 'none';
              }, function(val) {
                nextName = val.trim();
                validate(true);
              });
              editForm.appendChild(nActivityFormGroup);

              var nnActivityFormGroup = editPanel.drawSpanGroup('End Activity', self._parent._endTransition.name);
              nnActivityFormGroup.style.display = "none";
              editForm.appendChild(nnActivityFormGroup);

              var actionGroup = editPanel.drawWrapperAction([{
                title: 'Create Connection',
                className: 'btn btn-primary',
                onClick: function() {
                  if (disabledSave) return;
                  var res = editPanel.addConnection(previousName, nextName);
                  if (res.code != '000') {
                    noty.alertWithOneButton({
                      text: '<br/>' + editPanel.errorMap()[res.code] + '<br/><br/>',
                    });
                  } else {
                    editPanel.hide();
                  }
                }
              }]);
              saveBtn = actionGroup.childNodes[0];
              editForm.appendChild(actionGroup);
              editPanel.show(editWrapper);
            };

            var fnClickAdd = function(evt) {
              evt.preventDefault();
              evt.stopPropagation();

              var options = self._parent._transitions.map(function(t) {
                return {
                  title: t._title,
                  id: t._id,
                  isStart: t._isStart,
                  isEnd: t._isEnd
                }
              });

              fnToAdd(self, options);
            };
            addBtn.addEventListener("click", fnClickAdd);
          }
        };

        if (!globalOpts.newWhiteboard || !bIsEnd) {
          fnCreateEditBox();
        }
      }
      if (hpConf && (hpConf.isAdd || hpConf.isEdit) && hpConf.selectedTrans.indexOf(thisTran) !== -1 && !thisTran.isStart && !thisTran.isEnd && !self.editBox) {
        var noty = self._parent._notyService;

        var editBox = self.editBox = document.createElement('div');
        editBox.classList.add('edit-box', 'action-1');
        self.node.appendChild(editBox);

        var fnClickRemove = function(evt) {
          evt.preventDefault();
          evt.stopPropagation();

          noty.alertWithTwoButtons({
            text: "<br/>Are you sure to delete this happy path?<br/><br/>",
            btn1text: "OK",
            btn1onclick: function() {
              fnDeletedTranInHP(thisTran, hpConf);
            },
            btn2text: "Cancel",
            btn2class: 'btn btn-secondary'
          });
        };

        var removeBtn = document.createElement('span');
        removeBtn.className = 'edit-action';
        removeBtn.innerHTML = '<i class="icon-trash-o"></i>';
        editBox.appendChild(removeBtn);
        removeBtn.addEventListener("click", fnClickRemove);
      }
    },
    fnUnHover = function() {
      if (common.isFunction(opts.onUnHover)) {
        opts.onUnHover.call(self, self);
      }

      if (self.editBox) {
        self.editBox.parentNode.removeChild(self.editBox);
        self.editBox = null;
      }
    },
    fnClick = function() {
      if (common.isFunction(opts.onClick)) {
        opts.onClick.call(self, self);
      }

      if (hpConf && (hpConf.isAdd || hpConf.isEdit) && hpConf.candidateTrans.indexOf(thisTran) !== -1) {
        fnSelectedTranInHP(thisTran, hpConf);
      }
    };

  var wrapper = this.node = document.createElement("div");
  if (invisible) {
    wrapper.className = "pn-node pn-trans invisible";
  } else {
    wrapper.className = "pn-node pn-trans";
  }
  if (bIsStart) {
    wrapper.className += " start";
  } else if (bIsEnd) {
    wrapper.className += " end";
  }
  if (disabledAddon) {
    wrapper.className += " no-addon";
  }
  if (hpConf) {
    if (hpConf.isView && hpConf.cur) {
      if (!common.isArray(thisTran.happyPaths) || thisTran.happyPaths.indexOf(hpConf.cur) === -1) {
        if (thisTran.isMiddle) wrapper.classList.add('pn-hp', 'inactive');
      } else {
        wrapper.classList.add('pn-hp', 'active');
      }
    }

    if (hpConf.isAdd || hpConf.isEdit) {
      if (hpConf.selectedTrans.indexOf(thisTran) !== -1) {
        wrapper.classList.add('pn-hp', 'active');
      } else if (hpConf.candidateTrans.indexOf(thisTran) !== -1) {
        wrapper.classList.add('pn-hp', 'candidate');
      } else {
        wrapper.classList.add('pn-hp', 'inactive');
      }
    }
  }

  wrapper.style.left = oPos.x + "px";
  wrapper.style.top = oPos.y + "px";
  wrapper.style.width = oSize.w + "px";
  wrapper.style.height = oSize.h + "px";
  container.appendChild(wrapper);

  wrapper.addEventListener("mouseenter", fnHover);
  wrapper.addEventListener("mouseleave", fnUnHover);
  wrapper.addEventListener("click", fnClick);

  var pointElem = document.createElement('div');
  pointElem.className = 'point';
  // pointElem.innerHTML = sID;
  wrapper.appendChild(pointElem);

  if (invisible) {
    pointElem.innerHTML = "Invisible";
    return self;
  }

  if (!bIsStart && !bIsEnd) {
    var captionElem = document.createElement('div');
    captionElem.className = 'caption';
    wrapper.appendChild(captionElem);

    var titleElem = this.titleNode = document.createElement('div');
    titleElem.className = 'title';
    titleElem.innerHTML = sDisplayTitle;
    captionElem.appendChild(titleElem);

    if (commentCount > 0 && !hpConf) {
      var commentElem = document.createElement('div');
      commentElem.className = 'comment';
      commentElem.innerHTML = '<i class="icon-comment"></i>';
      wrapper.appendChild(commentElem);
      commentElem.addEventListener("click", function(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        if (common.isFunction(globalOpts.onToggleComment)) {
          globalOpts.onToggleComment.call(self, self);
        }
      });
    }

    if (bIsStart || bIsEnd || disabledAddon) {
      return self;
    }

    var labelElem = document.createElement('div');
    labelElem.className = 'label';
    labelElem.innerHTML = nToken + '';
    captionElem.appendChild(labelElem);
  }



  return self;
};

export default PNTransition
