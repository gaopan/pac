import SVG from 'svg.js'
import common from './common.js'
import PNConnector from './connector.js'
import TypeChecker from '@/utils/type-checker.js'

function PNStraightConnector(parent, container, startNode, endNode) {
  var self = this;
  PNConnector.call(this, parent, container, startNode, endNode);

  this.draw = function(startArchorPoint, endArchorPoint, opts, globalOpts) {
    globalOpts = this.globalOpts = Object.assign({}, globalOpts);
    this.opts = opts = Object.assign({
      lineWidth: 4,
      lineColor: '#07D9D6',
      arrowWidth: 15,
      arrowLength: 15,
      arrowColor: '#07D9D6',
      opacity: 1
    }, opts);
    var oStartPosition = {
        x: startArchorPoint.x,
        y: startArchorPoint.y
      },
      oEndPosition = {
        x: endArchorPoint.x,
        y: endArchorPoint.y
      },
      container = this.container,
      oBox = {
        x: Math.min(oStartPosition.x, oEndPosition.x),
        y: Math.min(oStartPosition.y, oEndPosition.y),
        w: Math.abs(oStartPosition.x - oEndPosition.x),
        h: Math.abs(oStartPosition.y - oEndPosition.y)
      },
      obliqueAngle = opts.obliqueAngle = Math.atan2(oEndPosition.y - oStartPosition.y, oEndPosition.x - oStartPosition.x),
      oStartPointInSVG = {
        x: oStartPosition.x - oBox.x,
        y: oStartPosition.y - oBox.y
      },
      oEndPointInSVG = {
        x: oEndPosition.x - oBox.x,
        y: oEndPosition.y - oBox.y
      },
      oArrowPoints = null; // points position of arrow

    // Changes for Line
    var handleChangesForLine = function() {
      var oSizeChangeOfSVGForLine = {
          x: opts.lineWidth * Math.abs(Math.sin(obliqueAngle)),
          y: opts.lineWidth * Math.abs(Math.cos(obliqueAngle))
        },
        oPositionChangeOfSVGForLine = {
          x: oSizeChangeOfSVGForLine.x * -1,
          y: oSizeChangeOfSVGForLine.y * -1
        };
      oBox.x += oPositionChangeOfSVGForLine.x;
      oBox.y += oPositionChangeOfSVGForLine.y;
      oBox.w += oSizeChangeOfSVGForLine.x;
      oBox.h += oSizeChangeOfSVGForLine.y;
      oStartPointInSVG.x -= oPositionChangeOfSVGForLine.x;
      oStartPointInSVG.y -= oPositionChangeOfSVGForLine.y;
      oEndPointInSVG.x -= oPositionChangeOfSVGForLine.x;
      oEndPointInSVG.y -= oPositionChangeOfSVGForLine.y;
    };
    // Changes for Arrow
    var handleChangesForArrow = function() {
      var oSizeChangesOfSVGForArrow = { x: 0, y: 0 },
        oPositionChangeOfSVGForArrow = { x: 0, y: 0 };
      oArrowPoints = self.calculatePointsForArrowOnLine(opts.lineWidth, opts.obliqueAngle, opts.arrowWidth, opts.arrowLength, oEndPointInSVG);
      var fnCalculateChangeOfSVGForArrowPoint = function(point) {
        if (point.x < 0) {
          oSizeChangesOfSVGForArrow.x += -point.x;
          oPositionChangeOfSVGForArrow.x += point.x
        } else if (point.x > oBox.w) {
          oSizeChangesOfSVGForArrow.x += point.x - oBox.w;
        }

        if (point.y < 0) {
          oSizeChangesOfSVGForArrow.y += -point.y;
          oPositionChangeOfSVGForArrow.y += point.y
        } else if (point.y > oBox.h) {
          oSizeChangesOfSVGForArrow.y += point.y - oBox.h;
        }
      };
      fnCalculateChangeOfSVGForArrowPoint(oArrowPoints.arrowPoint1);
      fnCalculateChangeOfSVGForArrowPoint(oArrowPoints.arrowPoint2);
      oBox.x += oPositionChangeOfSVGForArrow.x;
      oBox.y += oPositionChangeOfSVGForArrow.y;
      oBox.w += oSizeChangesOfSVGForArrow.x;
      oBox.h += oSizeChangesOfSVGForArrow.y;
      oStartPointInSVG.x -= oPositionChangeOfSVGForArrow.x;
      oStartPointInSVG.y -= oPositionChangeOfSVGForArrow.y;
      oEndPointInSVG.x -= oPositionChangeOfSVGForArrow.x;
      oEndPointInSVG.y -= oPositionChangeOfSVGForArrow.y;
      oArrowPoints.arrowPoint1.x -= oPositionChangeOfSVGForArrow.x;
      oArrowPoints.arrowPoint1.y -= oPositionChangeOfSVGForArrow.y;
      oArrowPoints.arrowPoint2.x -= oPositionChangeOfSVGForArrow.x;
      oArrowPoints.arrowPoint2.y -= oPositionChangeOfSVGForArrow.y;
      oArrowPoints.arrowPoint3.x -= oPositionChangeOfSVGForArrow.x;
      oArrowPoints.arrowPoint3.y -= oPositionChangeOfSVGForArrow.y;
    };
    // Draw line with arrow
    var _draw = function() {
      var line = self.svg = self.node = SVG(container).size(oBox.w, oBox.h);
      line.style({ left: oBox.x + 'px', top: oBox.y + 'px' });
      var lineStrokeOpts = {
        color: opts.lineColor,
        width: opts.lineWidth,
        opacity: opts.opacity
      };
      if (opts.lineDashArray) {
        lineStrokeOpts.dasharray = opts.lineDashArray;
      }

      var path = "M" + oStartPointInSVG.x + " " + oStartPointInSVG.y + " L" + oArrowPoints.arrowPoint3.x + " " + oArrowPoints.arrowPoint3.y;

      var conn = line.path(path).stroke(lineStrokeOpts).fill('none');
      if (TypeChecker.isFunction(self.opts.enabledClickPop)) {
        var dShowData = {
          _addon: self.opts.addon,
          model: {
            sourceName: self.opts.connSourceName,
            targetName:self.opts.connTargetName
          }
        }
        conn.on("click", function() { self.opts.enabledClickPop.call(dShowData, dShowData) });
      } else {
        conn.on("click", function() { self.selectConnector(); });
      }
      conn.on("mouseenter", function() { self.hoverConnector(); });
      conn.on("mouseleave", function() { self.unHoverConnector(); });
      var arrow = line.polyline([
        [oArrowPoints.arrowPoint1.x, oArrowPoints.arrowPoint1.y],
        [oEndPointInSVG.x, oEndPointInSVG.y],
        [oArrowPoints.arrowPoint2.x, oArrowPoints.arrowPoint2.y],
        [oArrowPoints.arrowPoint3.x, oArrowPoints.arrowPoint3.y]
      ]).fill({
        color: opts.arrowColor,
        opacity: opts.opacity
      }).stroke('none');
      arrow.on("click", function() { self.selectConnector(); });
      arrow.on("mouseenter", function() { self.hoverConnector(); });
      arrow.on("mouseleave", function() { self.unHoverConnector(); });

      self.middlePos = {
        x: oBox.x + oBox.w / 2,
        y: oBox.y + oBox.h / 2
      };

      if (opts.label != null && opts.label != undefined) {
        var overlapLabelWrapper = self.label = document.createElement('div');
        overlapLabelWrapper.className = 'connector-label';
        var labelSize = common.getTextSize(opts.label, { fontSize: '9px' });
        overlapLabelWrapper.style.left = oBox.x + oBox.w / 2 - labelSize.width / 2 + opts.lineWidth / 2 + 6 + 'px';
        overlapLabelWrapper.style.top = oBox.y + oBox.h / 2 - labelSize.height / 2 + 'px';
        overlapLabelWrapper.innerHTML = opts.label;

        container.appendChild(overlapLabelWrapper);
      }
    };

    handleChangesForLine();
    handleChangesForArrow();
    _draw();
    return self;
  }
}

export default PNStraightConnector
