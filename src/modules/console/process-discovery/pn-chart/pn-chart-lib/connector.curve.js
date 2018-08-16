import SVG from 'svg.js'
import common from './common.js'
import PNConnector from './connector.js'
import TypeChecker from '@/utils/type-checker.js'

function PNCurveConnector(parent, container, startNode, endNode) {
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
      oControlPointInSVG = {
        x: (oStartPointInSVG.x + oEndPointInSVG.x) / 2 + Math.pow(oBox.h, 2) / 2 / (oEndPointInSVG.x - oStartPointInSVG.x),
        y: oStartPointInSVG.y
      },
      oArrowPoints = null; // points position of arrow

    if (oControlPointInSVG.x < 0) {
      oControlPointInSVG.x = 0;
    } else if (oControlPointInSVG.x > oBox.w) {
      oControlPointInSVG.x = oBox.w;
    }

    var applyChanges = function(oSizeChanges, oPositionChanges, oSPositionChanges, oEPositionChanges, oAPositionChanges) {
      oBox.w += oSizeChanges.x;
      oBox.h += oSizeChanges.y;
      oBox.x += oPositionChanges.x;
      oBox.y += oPositionChanges.y;
      oStartPointInSVG.x += oSPositionChanges.x;
      oStartPointInSVG.y += oSPositionChanges.y;
      oControlPointInSVG.x += oEPositionChanges.x;
      oControlPointInSVG.y += oSPositionChanges.y;
      oEndPointInSVG.x += oEPositionChanges.x;
      oEndPointInSVG.y += oEPositionChanges.y;

      if (oArrowPoints) {
        oArrowPoints.arrowPoint1.x += oAPositionChanges.x;
        oArrowPoints.arrowPoint1.y += oAPositionChanges.y;
        oArrowPoints.arrowPoint2.x += oAPositionChanges.x;
        oArrowPoints.arrowPoint2.y += oAPositionChanges.y;
        oArrowPoints.arrowPoint3.x += oAPositionChanges.x;
        oArrowPoints.arrowPoint3.y += oAPositionChanges.y;
      }
    };

    // Changes for Line
    var handleChangesForLine = function() {
      var nObliqueAngle1 = Math.atan2(oControlPointInSVG.y - oStartPointInSVG.y, oControlPointInSVG.x - oStartPointInSVG.x);
      var nObliqueAngle2 = Math.atan2(oEndPointInSVG.y - oControlPointInSVG.y, oEndPointInSVG.x - oControlPointInSVG.x);
      var directionX = (oEndPointInSVG.x - oStartPointInSVG.x) / Math.abs(oEndPointInSVG.x - oStartPointInSVG.x);
      var directionY = oEndPointInSVG.y == oStartPointInSVG.y ? 1 : ((oEndPointInSVG.y - oStartPointInSVG.y) / Math.abs(oEndPointInSVG.y - oStartPointInSVG.y));
      var directionAll = directionX * directionY;
      var oSizeChange = {
        x: opts.lineWidth / 2 * Math.sin(nObliqueAngle2) * directionAll,
        y: opts.lineWidth / 2 + Math.abs(opts.lineWidth / 2 * Math.cos(nObliqueAngle2))
      };
      var oPositionChanges = {
          x: directionX > 0 ? 0 : -oSizeChange.x,
          y: directionY > 0 ? (opts.lineWidth / 2 * -directionY) : (opts.lineWidth / 2 * Math.cos(nObliqueAngle2) * directionAll)
        },
        oSPositionChanges = {
          x: -oPositionChanges.x,
          y: -oPositionChanges.y
        },
        oEPositionChanges = {
          x: -oPositionChanges.x,
          y: -oPositionChanges.y
        };
      applyChanges(oSizeChange, oPositionChanges, oSPositionChanges, oEPositionChanges);
    };
    // Changes for Arrow
    var handleChangesForArrow = function() {
      var oSizeChanges = { x: 0, y: 0 },
        oPositionChanges = { x: 0, y: 0 },
        nObliqueAngle = Math.atan2(oEndPointInSVG.y - oControlPointInSVG.y, oEndPointInSVG.x - oControlPointInSVG.x);
      oArrowPoints = self.calculatePointsForArrowOnLine(opts.lineWidth, nObliqueAngle, opts.arrowWidth, opts.arrowLength, oEndPointInSVG);

      var fnCalculateChangeOfSVGForArrowPoint = function(point) {
        if (point.x < 0) {
          oSizeChanges.x += -point.x;
          oPositionChanges.x += point.x
        } else if (point.x > oBox.w) {
          oSizeChanges.x += point.x - oBox.w;
        }

        if (point.y < 0) {
          oSizeChanges.y += -point.y;
          oPositionChanges.y += point.y
        } else if (point.y > oBox.h) {
          oSizeChanges.y += point.y - oBox.h;
        }
      };
      fnCalculateChangeOfSVGForArrowPoint(oArrowPoints.arrowPoint1);
      fnCalculateChangeOfSVGForArrowPoint(oArrowPoints.arrowPoint2);

      var oPositionChangesForPointsInSVG = {
        x: oPositionChanges.x * (oPositionChanges.x < 0 ? -1 : 0),
        y: oPositionChanges.y * (oPositionChanges.y < 0 ? -1 : 0)
      };

      applyChanges(oSizeChanges, oPositionChanges, oPositionChangesForPointsInSVG, oPositionChangesForPointsInSVG, oPositionChangesForPointsInSVG);
    };
    // Draw line with arrow
    var _draw = function() {
      var line = self.node = self.svg = SVG(container).size(oBox.w, oBox.h);
      line.style({ left: oBox.x + 'px', top: oBox.y + 'px' });
      var lineStrokeOpts = {
        color: opts.lineColor,
        width: opts.lineWidth,
        opacity: opts.opacity
      };
      if (opts.lineDashArray) {
        lineStrokeOpts.dasharray = opts.lineDashArray;
      }

      var path = 'M' + oStartPointInSVG.x + ' ' + oStartPointInSVG.y + ' ' + 'Q' + oControlPointInSVG.x + ' ' + oControlPointInSVG.y + ' ' + oArrowPoints.arrowPoint3.x + ' ' + oArrowPoints.arrowPoint3.y;

      var conn = line.path(path).stroke(lineStrokeOpts).fill('none');
      conn.on("mouseenter", function() { self.hoverConnector(); });
      conn.on("mouseleave", function() { self.unHoverConnector(); });

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
      var arrow = line.polyline([
        [oArrowPoints.arrowPoint1.x, oArrowPoints.arrowPoint1.y],
        [oEndPointInSVG.x, oEndPointInSVG.y],
        [oArrowPoints.arrowPoint2.x, oArrowPoints.arrowPoint2.y],
        [oArrowPoints.arrowPoint3.x, oArrowPoints.arrowPoint3.y],
        [oArrowPoints.arrowPoint1.x, oArrowPoints.arrowPoint1.y]
      ]).fill({
        color: opts.arrowColor,
        opacity: opts.opacity
      }).stroke('none');
      arrow.on("click", function() { self.selectConnector(); });
      arrow.on("mouseenter", function() { self.hoverConnector(); });
      arrow.on("mouseleave", function() { self.unHoverConnector(); });

      var t = 0.5;
      var labelX = Math.pow(1 - t, 2) * oStartPointInSVG.x + 2 * (1 - t) * t * oControlPointInSVG.x + t * t * oArrowPoints.arrowPoint3.x,
        labelY = Math.pow(1 - t, 2) * oStartPointInSVG.y + 2 * (1 - t) * t * oControlPointInSVG.y + t * t * oArrowPoints.arrowPoint3.y;

      self.middlePos = {
        x: oBox.x + labelX,
        y: oBox.y + labelY
      };
      if (opts.label != null && opts.label != undefined) {
        var overlapLabelWrapper = self.label = document.createElement('div');
        overlapLabelWrapper.className = 'connector-label';
        var labelSize = common.getTextSize(opts.label, { fontSize: '9px' });

        var factor = Math.tan(obliqueAngle) > 0 ? 1 : -1;
        overlapLabelWrapper.style.left = oBox.x + labelX - labelSize.width / 2 + factor * (labelSize.width) * Math.sin(obliqueAngle) + 'px';
        overlapLabelWrapper.style.top = oBox.y + labelY - labelSize.height / 2 - factor * (labelSize.height) * Math.cos(obliqueAngle) + 'px';
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

export default PNCurveConnector
