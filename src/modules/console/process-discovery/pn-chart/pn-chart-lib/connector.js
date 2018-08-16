import SVG from 'svg.js'
import common from './common.js'

function PNConnector(parent, container, startNode, endNode) {

  var self = this;
  this.parent = parent;
  this.type = null;
  this.svg = null; // svg
  this.label = null; // label container
  this.isSelected = false;
  this.isHover = false;
  this.isHighlighted = false;
  this.container = container;
  this.source = startNode;
  this.target = endNode;
  this.start = SVG.adopt(startNode.node);
  this.end = SVG.adopt(endNode.node);

  this.setHover = function(isHover) {
    this.isHover = isHover;
    if (this.svg) {
      var path = this.svg.select('path');
      var polyline = this.svg.select('polyline');
      if (this.isHover) {
        path.stroke({ color: "#2BA229", opacity: 1 });
        polyline.fill({ color: "#2BA229", opacity: 1 });
        this.svg.style({ "z-index": 2 });
      } else {
        if (this.opts && this.opts.lineColor) {
          path.stroke({ color: this.opts.lineColor, opacity: this.opts.opacity });
        }
        if (this.opts && this.opts.arrowColor) {
          polyline.fill({ color: this.opts.arrowColor, opacity: this.opts.opacity });
        }
        this.svg.style({ "z-index": 0 });
      }
    }
    if (this.label) {
      var theLabel = SVG.adopt(this.label);
      if (this.isHover) {
        theLabel.addClass("hover");
      } else {
        theLabel.removeClass("hover");
      }
    }
  };
  this.setClick = function() {

  }
  this.setSelected = function(isSelected) {
    this.isSelected = isSelected;
    if (this.svg) {
      var path = this.svg.select('path');
      var polyline = this.svg.select('polyline');
      if (this.isSelected) {
        path.stroke("#2BA229");
        polyline.fill("#2BA229");
        this.svg.style({ "z-index": 2 });
      } else {
        if (this.opts && this.opts.lineColor) {
          path.stroke(this.opts.lineColor);
        }
        if (this.opts && this.opts.arrowColor) {
          polyline.fill(this.opts.arrowColor);
        }
        this.svg.style({ "z-index": 0 });
      }
    }
    if (this.label) {
      var theLabel = SVG.adopt(this.label);
      if (this.isHover) {
        theLabel.addClass("hover");
      } else {
        theLabel.removeClass("hover");
      }
    }
  };
  this.setHighlight = function(isHighlighted) {
    this.isHighlighted = isHighlighted;
    if (this.svg) {
      var path = this.svg.select('path');
      var polyline = this.svg.select('polyline');
      if (this.isHighlighted) {
        path.stroke({ color: "#2BA229", opacity: 1 });
        polyline.fill({ color: "#2BA229", opacity: 1 });
        this.svg.style({ "z-index": 2 });
      } else {
        if (this.opts && this.opts.lineColor) {
          path.stroke({ color: this.opts.lineColor, opacity: this.opts.opacity });
        }
        if (this.opts && this.opts.arrowColor) {
          polyline.fill({ color: this.opts.arrowColor, opacity: this.opts.opacity });
        }
        this.svg.style({ "z-index": 0 });
      }
    }
    if (this.label) {
      var theLabel = SVG.adopt(this.label);
      if (this.isHover) {
        theLabel.addClass("highlight");
      } else {
        theLabel.removeClass("highlight");
      }
    }
  };
  this.selectConnector = function() {
    this.setSelected(!this.isSelected);
  };
  this.hoverConnector = function() {
    var self = this;
    this.setHover(true);
    // hover source and target
    this.start.addClass("hover");
    this.end.addClass("hover");

    if (this.globalOpts.editable && !this.editBox) {
      if (self.target.isEnd && self.source.isStart && self.parent._connections.length == 1) {
        return;
      }
      // unhover all other connections
      this.parent._connections.forEach(function(c) {
        if (c != self && c.editBox) {
          c.editBox.parentNode.removeChild(c.editBox);
          c.editBox = null;
        }
      });
      var editBox = this.editBox = document.createElement('div');
      editBox.className = 'edit-box';
      editBox.style.left = this.middlePos.x + 'px';
      editBox.style.top = this.middlePos.y + 'px';
      this.container.appendChild(editBox);

      var editPanel = self.parent.editPanel;
      var noty = self.parent._notyService;

      var fnToEdit = function(conn, acts) {
        var source = conn.source,
          target = conn.target,
          oldConn = {
            source: source.name,
            target: target.name
          },
          newConn = {
            source: source.name,
            target: target.name
          },
          saveBtn = null,
          disabledSave = false, isNewSource = false, isNewTarget = false;
        var validate = function() {
          var existedSource = false,
            existedTarget = false;
          self.parent._transitions.forEach(t => {
            if (t.name == newConn.source && isNewSource) {
              existedSource = true;
            }
            if (t.name == newConn.target && isNewTarget) {
              existedTarget = true;
            }
          });
          if(existedSource) {
            disabledSave = true;
            noty.alertWithOneButton({
              text: '<br/>Duplicate previous activity name.<br/><br/>',
            });
          } else if (existedTarget){
            disabledSave = true;
            noty.alertWithOneButton({
              text: '<br/>Duplicate next activity name.<br/><br/>',
            });
          }else if (!common.validateActivityNameChars(newConn.source)) {
            disabledSave = true;
            noty.alertWithOneButton({
              text: '<br/>Invalid previous activity name.<br/><br/>',
            });
          } else if (!common.validateActivityNameChars(newConn.target)) {
            disabledSave = true;
            noty.alertWithOneButton({
              text: '<br/>Invalid next activity name.<br/><br/>',
            });
          } else if (newConn.source && newConn.source.trim().length > 0 && newConn.target && newConn.target.trim().length > 0) {
            disabledSave = false;
          } else {
            disabledSave = true;
          }
          if (newConn.source == oldConn.source && newConn.target == oldConn.target) {
            disabledSave = true;
          }
          if (disabledSave) {
            saveBtn.classList.add('disabled');
          } else {
            saveBtn.classList.remove('disabled');
          }
        };
        var editWrapper = editPanel.drawWrapper('-116px');

        var editHeader = editPanel.drawWrapperHeader('Edit Connection');
        editWrapper.appendChild(editHeader);

        var editForm = editPanel.drawWrapperForm(editWrapper);

        var pActivityFormGroup = editPanel.drawSelectGroup('Previous Activity', 'previousActivityName', source.name, acts.filter(function(act) {
          return !act.isEnd;
        }), function(val) {
          isNewSource = false;
          newConn.source = val.trim();
          validate();
        }, null, function(val){
          isNewSource = true;
          newConn.source = val.trim();
          validate();
        });
        editForm.appendChild(pActivityFormGroup);
        var nActivityFormGroup = editPanel.drawSelectGroup('Next Activity', 'nextActivityName', target.name, acts.filter(function(act) {
          return !act.isStart;
        }), function(val) {
          isNewTarget = false;
          newConn.target = val.trim();
          validate();
        }, null, function(val){
          isNewTarget = true;
          newConn.target = val.trim();
          validate();
        });
        editForm.appendChild(nActivityFormGroup);

        var actionGroup = editPanel.drawWrapperAction([{
          title: 'Save Connection',
          className: 'btn btn-primary',
          onClick: function() {
            if (disabledSave) return;
            noty.alertWithTwoButtons({
              text: "<br/>Are you sure to update this connection ?<br/><br/>",
              btn1text: "OK",
              btn1onclick: function() {
                var message = '',
                  res = editPanel.updateConnection(newConn, oldConn);
                if (res.code != '000') {
                  if (res.code == '210') {
                    message = '<br/>Not able to update, it relates to Happy Path: ' +
                      res.hpNames.join(',') +
                      '. Please remove all related Happy Paths before updating this connection.<br/><br/>';
                  } else {
                    message = '<br/>' + editPanel.errorMap()[res.code] + '<br/><br/>';
                  }
                  noty.alertWithOneButton({ text: message });
                }
              },
              btn2text: "Cancel",
              btn2class: 'btn btn-secondary'
            });
          }
        }]);
        saveBtn = actionGroup.childNodes[0];
        editForm.appendChild(actionGroup);
        editPanel.show(editWrapper);
      };

      var fnOnClickEdit = function(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        var options = self.parent._transitions.map(function(t) {
          return {
            title: t._title,
            id: t._id,
            isStart: t._isStart,
            isEnd: t._isEnd
          }
        });

        fnToEdit(self, options);
      };

      var fnOnClickRemove = function(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        noty.alertWithTwoButtons({
          text: "<br/>Are you sure to delete this connection ?<br/><br/>",
          btn1text: "OK",
          btn1onclick: function() {
            var message = '',
              res = editPanel.removeConnection(self);
            if (res.code != '000') {
              if (res.code == '210') {
                message = '<br/>Not able to delete, it relates to Happy Path: ' +
                  res.hpNames.join(',') +
                  '. Please remove all related Happy Paths before deleting this connection.<br/><br/>';
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
      editBtn.addEventListener("click", fnOnClickEdit);
      editBox.appendChild(editBtn);

      var removeBtn = document.createElement('span');
      removeBtn.className = 'edit-action';
      removeBtn.innerHTML = '<i class="icon-trash-o"></i>';
      removeBtn.addEventListener("click", fnOnClickRemove);
      editBox.appendChild(removeBtn);

      editBox.addEventListener("mouseleave", function() {
        this.parentNode.removeChild(this);
        self.editBox = null;
      });
    }
  };
  this.unHoverConnector = function() {
    this.setHover(false);
    // unhover source and target
    this.start.removeClass("hover");
    this.end.removeClass("hover");
  };
  this.highlightConnector = function() {
    this.setHighlight(true);
    this.start.addClass("highlight");
    this.end.addClass("highlight");
  };
  this.unHighlightConnector = function() {
    this.setHighlight(false);
    this.start.removeClass("highlight");
    this.end.removeClass("highlight");
  };
  this.draw = function() {
    return this.node;
  };
  this.convertPointWithObliqueAngle = function(nObliqueAngle, oPoint) {
    var nOriginAngle = Math.atan2(oPoint.y, oPoint.x);
    var nDeltAngle = nOriginAngle - nObliqueAngle;
    var nDist = Math.sqrt(Math.pow(oPoint.x, 2) + Math.pow(oPoint.y, 2));
    return {
      x: nDist * Math.cos(nDeltAngle),
      y: nDist * Math.sin(nDeltAngle)
    };
  };

  this.calculatePointsForArrowOnLine = function(nLineWidth, nLineObliqueAngle, nArrowWidth, nArrowLength, oEndPoint) {
    oEndPoint = this.convertPointWithObliqueAngle(nLineObliqueAngle, oEndPoint);
    var arrowPoint1 = {
        x: oEndPoint.x - nArrowLength,
        y: oEndPoint.y - 0.5 * nArrowWidth
      },
      arrowPoint2 = {
        x: oEndPoint.x - nArrowLength,
        y: oEndPoint.y + 0.5 * nArrowWidth
      },
      arrowPoint3 = {
        x: oEndPoint.x - 0.7 * nArrowLength,
        y: oEndPoint.y
      };

    var oOPoint = {
      x: oEndPoint.x - 0.5 * nArrowWidth,
      y: oEndPoint.y - 0.5 * nLineWidth
    };

    return {
      arrowPoint1: this.convertPointWithObliqueAngle(-nLineObliqueAngle, arrowPoint1),
      arrowPoint2: this.convertPointWithObliqueAngle(-nLineObliqueAngle, arrowPoint2),
      arrowPoint3: this.convertPointWithObliqueAngle(-nLineObliqueAngle, arrowPoint3)
    };
  };
}

export default PNConnector
