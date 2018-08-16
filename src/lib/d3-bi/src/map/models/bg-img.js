import Utils from './utils.js'
import CoordsConverter from './coords-converter.js'


function BgImg(ctnr, conf) {
  this.zoom = 0;

  this.mapCtnrSize = conf.mapCtnrSize;
  this.dragCallback = conf.dragCallback;

  this.imgCur = null;
  this.imgByZoom = this.classifyImgsByZoom(conf.mapCtnrSize, conf.imgConf.list);

  this.ctnr = ctnr;
  this.ctnrSize = Utils.getSuitSizeWidth(conf.mapCtnrSize, this.imgByZoom[0].source.size);
  this.ctnrXOffset = 0;
  this.ctnrYOffset = 0;
  this.ctnrYMoveDistance = 0;
  this.ctnrPosRange = {x: [], y: []};

  CoordsConverter.call(this, {
    projection: conf.imgConf.projection,
    tlRealCoords: conf.imgConf.tlCoords,
    sizeRealCoords: conf.imgConf.sizeCoords
  });

  this.initCtnr();
  this.updateByZoom(1, conf.center || this.rightDomToRealCoords({
    x: this.mapCtnrSize.w / 2,
    y: this.mapCtnrSize.h / 2
  }));
}

BgImg.prototype = Object.create(CoordsConverter.prototype);
BgImg.prototype.constructor = BgImg;

BgImg.prototype.initCtnr = function() {
  var that = this, ctnr = this.ctnr;

  ctnr.className = 'bg-img';
  ctnr.style.width = this.ctnrSize.w + 'px';
  ctnr.style.height = this.ctnrSize.h + 'px';

  Utils.enabledDrag(ctnr, {
    start: function() {
      ctnr.classList.add('drag');
    },
    drag: function(c) {
      var ndx, ndy, // new dx, dy
        dx = c.dx,
        dy = c.dy,
        ctnr = that.ctnr,
        posRange = that.ctnrPosRange,
        ntop = parseFloat(ctnr.style.top),
        nleft = parseFloat(ctnr.style.left);

      if (dx > 0) {
        if (nleft < posRange.x[1]) {
          ndx = ((nleft + dx) >= posRange.x[1]) ? (posRange.x[1] - nleft) : dx;
        }
      } else if (dx < 0) {
        if (nleft > posRange.x[0]) {
          ndx = ((nleft + dx) <= posRange.x[0]) ? (posRange.x[0] - nleft) : dx;
        }
      }

      if (that.ctnrYMoveDistance <= 0) {
        if (dy > 0) {
          if (ntop < posRange.y[1]) {
            ndy = ((ntop + dy) >= posRange.y[1]) ? (posRange.y[1] - ntop) : dy;
          }
        } else if (dy < 0) {
          if (ntop > posRange.y[0]) {
            ndy = ((ntop + dy) <= posRange.y[0]) ? (posRange.y[0] - ntop) : dy;
          }
        }
      }

      that.dragCallback(ndx, ndy, {posRange: posRange});
    },
    end: function() {
      that.dragCallback();
      ctnr.classList.remove('drag');
    }
  });
}

BgImg.prototype.classifyImgsByZoom = function(mapCtnrSize, imgs) {
  var resArr = [], nAdd = 0.5, initWidth = mapCtnrSize.w;

  var i = 0;
  while (i< imgs.length) {
    if (initWidth * (nAdd * resArr.length + 1) > imgs[i].size.w) {
      i++;
    } else {
      resArr.push(imgs[i]);
    }
  }

  if (!resArr.length) resArr.push(imgs[imgs.length-1]);

  for(i=0; i<resArr.length; i++) {
    if (resArr[i] === resArr[i+1]) {
      i++;
    } else {
      resArr.splice(i+1, 0, resArr[i]);
      i += 2;
    }
  }

  for(i=0; i<resArr.length; i++) resArr[i] = {zoom: nAdd * 10 * i / 10 + 1, source: resArr[i]};
  
  return resArr;
};

BgImg.prototype.updateByZoom = function(zoom, cCoords) {
  var curZoomConf = this.imgByZoom[zoom-1];

  if (!Utils.isObject(curZoomConf)) return ;

  var that = this, curZoom = curZoomConf.zoom, ctnrSize = this.ctnrSize;

  this.zoom = curZoom;

  this.imgCur = curZoomConf.source;
  this.imgCtnrSize = {
    w: ctnrSize.w * curZoom,
    h: ctnrSize.h * curZoom
  };

  this.ctnrXOffset = getOffset(ctnrSize.w, curZoom);
  this.ctnrYOffset = getOffset(ctnrSize.h, curZoom);
  this.ctnrYMoveDistance = this.mapCtnrSize.h > this.imgCtnrSize.h
    ? this.ctnrYOffset + (this.mapCtnrSize.h - this.imgCtnrSize.h) / 2 
    : 0;
  this.ctnrPosRange = getPosRange();
  
  this.updateCtnrStyle(cCoords);

  function getOffset(num, zoom) {
    return zoom > 1 ? (num * (zoom - 1) / 2) : (- num * (1 - zoom) / 2);
  }
  function getPosRange() {
    var xMax = that.ctnrXOffset,
      xMin = xMax,
      yMax = that.ctnrYOffset,
      yMin = yMax,
      mapSize = that.mapCtnrSize,
      ctnrSize = that.imgCtnrSize;

    if (ctnrSize.w > mapSize.w) xMin -= ctnrSize.w - mapSize.w;
    if (ctnrSize.h > mapSize.h) yMin -= ctnrSize.h - mapSize.h;

    return {
      x: [xMin, xMax],
      y: [yMin, yMax]
    };
  }
};

BgImg.prototype.updateCtnrStyle = function(cCoords) {
  var dom = this.ctnr,
    position = this.getCtnrPosByCenter(cCoords);

  dom.style.top = position.y + 'px';
  dom.style.left = position.x + 'px';
  dom.style.transform = 'scale('+ this.zoom + ')';
  dom.style.backgroundImage = 'url('+ this.imgCur.url +')';
};

BgImg.prototype.getCtnrPosByCenter = function(cCoords) {
  var rx, ry,
    posRange = this.ctnrPosRange,
    mapCtnrSize = this.mapCtnrSize,
    ctnrYMoveDistance = this.ctnrYMoveDistance,
    dCoords = this.realToDomCoords(cCoords);

  rx = this.ctnrXOffset - dCoords.x + mapCtnrSize.w / 2;
  ry = this.ctnrYOffset - dCoords.y + mapCtnrSize.h / 2;

  if (rx < posRange.x[0]) {
    rx = posRange.x[0];
  } else if (rx > posRange.x[1]) {
    rx = posRange.x[1];
  }

  if (ctnrYMoveDistance > 0) {
    ry = ctnrYMoveDistance
  } else {
    if (ry < posRange.y[0]) {
      ry = posRange.y[0];
    } else if (ry > posRange.y[1]) {
      ry = posRange.y[1];
    }
  }

  return { x: rx, y: ry };
};

BgImg.prototype.realToRightDomCoords = function(rCoords) {
  var dCoords = this.realToDomCoords(rCoords);
  var rImgPos = {
    x: parseFloat(Utils.style(this.ctnr, 'left')) - this.ctnrXOffset,
    y: parseFloat(Utils.style(this.ctnr, 'top')) - this.ctnrYOffset
  };

  return {
    x: rImgPos.x + dCoords.x,
    y: rImgPos.y + dCoords.y
  };
};

BgImg.prototype.rightDomToRealCoords = function(rdCoords) {
  var rImgPos = {
    x: parseFloat(Utils.style(this.ctnr, 'left')) - this.ctnrXOffset,
    y: parseFloat(Utils.style(this.ctnr, 'top')) - this.ctnrYOffset
  };

  return this.domToRealCoords({
    x: rdCoords.x - rImgPos.x,
    y: rdCoords.y - rImgPos.y
  });
};


export default BgImg