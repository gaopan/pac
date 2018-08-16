import Utils from './utils.js'


function CoordsConverter(conf) {
  this.imgCtnrSize = conf.imgCtnrSize || {w: 1, h: 1};

  this.projection = conf.projection || 'mercator';
  this.tlRealCoords = conf.tlRealCoords || {x: -180, y: 85};
  this.sizeRealCoords = conf.sizeRealCoords || {x: 360, y: 170};
}

CoordsConverter.prototype.realToDomCoords = function(rCoords) {
  var iCurCoords = this.realToImgCoords(rCoords),
    iTLCoords = this.realToImgCoords(this.tlRealCoords),
    iRange = this.countImgCoordsRang(this.tlRealCoords, this.sizeRealCoords);

  return {
    x: (iCurCoords.x - iTLCoords.x) / iRange.x * this.imgCtnrSize.w,
    y: (iTLCoords.y - iCurCoords.y) / iRange.y * this.imgCtnrSize.h
  };
}

CoordsConverter.prototype.domToRealCoords = function(dCoords) {
  var iTLCoords = this.realToImgCoords(this.tlRealCoords),
    iRange = this.countImgCoordsRang(this.tlRealCoords, this.sizeRealCoords);

  return this.imgToRealCoords({
    x: iTLCoords.x + dCoords.x / this.imgCtnrSize.w * iRange.x,
    y: iTLCoords.y - dCoords.y / this.imgCtnrSize.h * iRange.y
  });
}

CoordsConverter.prototype.countImgCoordsRang = function(tlCoords, sizeCoords) {
  var tlImgCoords = this.realToImgCoords(tlCoords),
    brImgCoords = this.realToImgCoords({x: tlCoords.x + sizeCoords.x, y: tlCoords.y - sizeCoords.y});

  return {
    x: brImgCoords.x - tlImgCoords.x,
    y: tlImgCoords.y - brImgCoords.y
  };
};

CoordsConverter.prototype.realToImgCoords = function(coords) {
  var fnProjection = Utils.projectionType[this.projection]
  return Utils.isFunction(fnProjection.convert) ? fnProjection.convert(coords) : {x: undefined, y: undefined};
}

CoordsConverter.prototype.imgToRealCoords = function(coords) {
  var fnProjection = Utils.projectionType[this.projection]
  return Utils.isFunction(fnProjection.reverse) ? fnProjection.reverse(coords) : {x: undefined, y: undefined};
}


export default CoordsConverter