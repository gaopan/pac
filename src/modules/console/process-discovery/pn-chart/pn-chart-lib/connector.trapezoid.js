import SVG from 'svg.js'
import common from './common.js'
import PNConnector from './connector.js'
import TypeChecker from '@/utils/type-checker.js'

function PNTrapezoidConnector(parent, container, startNode, endNode) {
  var self = this;
  PNConnector.call(this, parent, container, startNode, endNode);

  this.draw = function(startArchorPoint, endArchorPoint, opts, globalOpts) {
    globalOpts = this.globalOpts = Object.assign({}, globalOpts);
    this.opts = opts = Object.assign({
      lineWidth: 4,
      lineColor: '#D542A9',
      linePlainPercent: 0.6,
      riseHeight: 100,
      arrowWidth: 15,
      arrowLength: 15,
      arrowColor: '#D542A9',
      opacity: 1
    }, opts);
    var labelSize = common.getTextSize(opts.label, { fontSize: '9px' }),
      labelWidth = labelSize.width,
      labelHeight = labelSize.height;
    var oStartPosition = {
        x: startArchorPoint.x,
        y: startArchorPoint.y
      },
      oEndPosition = {
        x: endArchorPoint.x,
        y: endArchorPoint.y
      },
      container = this.container,
      obliqueAngle = opts.obliqueAngle = Math.atan2(oEndPosition.y - oStartPosition.y, oEndPosition.x - oStartPosition.x),
      direction = obliqueAngle == 0 ? 1 : (obliqueAngle / Math.abs(obliqueAngle)),
      initW = Math.abs(oStartPosition.x - oEndPosition.x),
      initH = Math.abs(oStartPosition.y - oEndPosition.y),
      oBox = {
        x: Math.min(oStartPosition.x, oEndPosition.x),
        y: Math.min(oStartPosition.y, oEndPosition.y),
        w: initW,
        h: initH
      },
      oStartPointInSVG = {},
      oEndPointInSVG = {},
      oStartPointPInSVG = {},
      oStartPointOInSVG = {},
      oEndPointPInSVG = {},
      oEndPointOInSVG = {},
      oArrowPoints;

    // firstly changes for rise height and init the objects' value
    var handleChangesForRiseHeight = function() {
      oStartPointInSVG.x = oStartPosition.x - oBox.x;
      oStartPointInSVG.y = oStartPosition.y - oBox.y;
      oEndPointInSVG.x = oEndPosition.x - oBox.x;
      oEndPointInSVG.y = oEndPosition.y - oBox.y;
      if (initW > initH) {
        var nMaxY = Math.max(oStartPosition.y, oEndPosition.y);
        oBox.h = nMaxY - oBox.y + opts.riseHeight;
        oStartPointOInSVG.y = oStartPointPInSVG.y = oEndPointOInSVG.y = oEndPointPInSVG.y = oBox.h;
        oStartPointOInSVG.x = oStartPointInSVG.x = oStartPosition.x - oBox.x;
        oStartPointPInSVG.x = oStartPosition.x - oBox.x + (1 - opts.linePlainPercent) * (oEndPosition.x - oStartPosition.x) / 2;
        oEndPointOInSVG.x = oEndPosition.x - oBox.x;
        oEndPointPInSVG.x = oEndPosition.x - oBox.x - (1 - opts.linePlainPercent) * (oEndPosition.x - oStartPosition.x) / 2;
      } else if (initH > initW) {
        var nMaxX = Math.max(oStartPosition.x, oEndPosition.x);
        oBox.w = nMaxX - oBox.x + opts.riseHeight;
        oStartPointOInSVG.x = oStartPointPInSVG.x = oEndPointOInSVG.x = oEndPointPInSVG.x = oBox.w;
        oStartPointOInSVG.y = oStartPointInSVG.y = oStartPosition.y - oBox.y;
        oStartPointPInSVG.y = oStartPosition.y - oBox.y + (1 - opts.linePlainPercent) * (oEndPosition.y - oStartPosition.y) / 2;
        oEndPointOInSVG.y = oEndPointInSVG.y = oEndPosition.y - oBox.y;
        oEndPointPInSVG.y = oEndPosition.y - oBox.y - (1 - opts.linePlainPercent) * (oEndPosition.y - oStartPosition.y) / 2;
      }
    };

    var applyChanges = function(oSizeChanges, oPositionChanges, oSPositionChanges, oEPositionChanges, oAPositionChanges) {
      oBox.w += oSizeChanges.x;
      oBox.h += oSizeChanges.y;
      oBox.x += oPositionChanges.x;
      oBox.y += oPositionChanges.y;
      oStartPointInSVG.x += oSPositionChanges.x;
      oStartPointInSVG.y += oSPositionChanges.y;
      oStartPointOInSVG.x += oSPositionChanges.x;
      oStartPointOInSVG.y += oSPositionChanges.y;
      oStartPointPInSVG.x += oSPositionChanges.x;
      oStartPointPInSVG.y += oSPositionChanges.y;
      oEndPointInSVG.x += oEPositionChanges.x;
      oEndPointInSVG.y += oEPositionChanges.y;
      oEndPointOInSVG.x += oEPositionChanges.x;
      oEndPointOInSVG.y += oEPositionChanges.y;
      oEndPointPInSVG.x += oEPositionChanges.x;
      oEndPointPInSVG.y += oEPositionChanges.y;

      if (oArrowPoints) {
        oArrowPoints.arrowPoint1.x += oAPositionChanges.x;
        oArrowPoints.arrowPoint1.y += oAPositionChanges.y;
        oArrowPoints.arrowPoint2.x += oAPositionChanges.x;
        oArrowPoints.arrowPoint2.y += oAPositionChanges.y;
        oArrowPoints.arrowPoint3.x += oAPositionChanges.x;
        oArrowPoints.arrowPoint3.y += oAPositionChanges.y;
      }
    };

    // changes for line width and text width
    var handleChangesForLineAndText = function() {
      var oSizeChanges = { x: 0, y: 0 };
      if (initW > initH) {
        oSizeChanges.x += opts.lineWidth;
        oSizeChanges.y += Math.max(opts.lineWidth, labelHeight);
      } else if (initH > initW) {
        oSizeChanges.y += opts.lineWidth;
        oSizeChanges.x += Math.max(opts.lineWidth, labelHeight);
      }
      var oPositionChanges = { x: -oSizeChanges.x / 2, y: -oSizeChanges.y / 2 },
        oSPositionChanges = { x: 　oSizeChanges.x / 2, y: oSizeChanges.y / 2 },
        oEPositionChanges = { x: oSizeChanges.x / 2, y: oSizeChanges.y / 2 };

      applyChanges(oSizeChanges, oPositionChanges, oSPositionChanges, oEPositionChanges);
    };

    var handleChangesForArrow = function() {
      var oSizeChanges = { x: 0, y: 0 },
        oPositionChanges = { x: 0, y: 0 },
        nObliqueAngle = Math.atan2(oEndPointInSVG.y - oEndPointOInSVG.y, oEndPointInSVG.x - oEndPointOInSVG.x);
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
        x: oPositionChanges.x * direction,
        y: oPositionChanges.y * direction
      };

      applyChanges(oSizeChanges, oPositionChanges, oPositionChangesForPointsInSVG, oPositionChangesForPointsInSVG, oPositionChangesForPointsInSVG);
    };

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
      var path = 'M' + oStartPointInSVG.x + ' ' + oStartPointInSVG.y + ' ' + 'Q' + oStartPointOInSVG.x + ' ' + oStartPointOInSVG.y + ' ' + oStartPointPInSVG.x + ' ' + oStartPointPInSVG.y + ' ' + 'L' + oEndPointPInSVG.x + ' ' + oEndPointPInSVG.y + ' ' + 'Q' + oEndPointOInSVG.x + ' ' + oEndPointOInSVG.y + ' ' + oArrowPoints.arrowPoint3.x + ' ' + oArrowPoints.arrowPoint3.y;

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
        [oArrowPoints.arrowPoint3.x, oArrowPoints.arrowPoint3.y],
        [oArrowPoints.arrowPoint1.x, oArrowPoints.arrowPoint1.y]
      ]).fill({
        color: opts.arrowColor,
        opacity: opts.opacity
      }).stroke('none');
      arrow.on("click", function() { self.selectConnector(); });
      arrow.on("mouseenter", function() { self.hoverConnector(); });
      arrow.on("mouseleave", function() { self.unHoverConnector(); });

      self.middlePos = {
        x: oBox.x + oBox.w,
        y: oBox.y + oBox.h / 2
      };

      if (opts.label != null && opts.label != undefined) {
        var overlapLabelWrapper = self.label = document.createElement('div');
        overlapLabelWrapper.className = 'connector-label';
        overlapLabelWrapper.style.left = oBox.x + oBox.w - labelWidth / 2 - opts.lineWidth / 2 + 6 + 'px';
        overlapLabelWrapper.style.top = oBox.y + oBox.h / 2 - labelHeight / 2 + 'px';
        overlapLabelWrapper.innerHTML = opts.label;

        container.appendChild(overlapLabelWrapper);
      }
    };

    handleChangesForRiseHeight();
    handleChangesForLineAndText();
    handleChangesForArrow();
    _draw();
    return self;
  }

}

export default PNTrapezoidConnector
