import Utils from './models/utils.js'
import BgImg from './models/bg-img.js'
import Markers from './models/markers'
import Controls from './models/controls'


function Map(ctnr, conf) {
  this.ctnr = null;
  this.ctnrSize = null;
  this.bgImg = null;
  this.markers = null;
  this.controls = null;

  this.ctnr = Utils.initMapCtnr(ctnr);
  this.ctnrSize = Utils.getSize(this.ctnr);

  if (!Utils.isArray(conf.imgConf.list) || !conf.imgConf.list.length) {
    Utils.buildNoDataMap(this.ctnr);
    return ;
  }

  this.bgImg = new BgImg(Utils.append(this.ctnr, 'div'), {
    center: conf.center,
    imgConf: conf.imgConf,
    mapCtnrSize: this.ctnrSize,
    dragCallback: this.dragCallback.bind(this)
  });

  if (conf.markerConf && Utils.isArray(conf.markerConf.list)) {
    this.markers = new Markers(Utils.append(this.ctnr, 'div'), Object.assign(conf.markerConf, {
      getDomCoords: this.bgImg.realToRightDomCoords.bind(this.bgImg)
    }));
  }

  if (conf.controlConf !== null) {
    this.controls = new Controls(Utils.append(this.ctnr, 'div'), Object.assign(conf.controlConf || {}, {
      zoomRange: [1, this.bgImg.imgByZoom.length],
      zoomCallback: this.zoomCallback.bind(this)
    }));
  }
}

Map.prototype.zoomCallback = function(zoom, conf) {
  conf = conf || {};

  this.bgImg.updateByZoom(zoom, conf.center || this.bgImg.rightDomToRealCoords({
    x: this.ctnrSize.w / 2,
    y: this.ctnrSize.h / 2
  }));

  this.markers && this.markers.updateMarkersPosition();
}

Map.prototype.dragCallback = function(dx, dy, conf) {
  if (!dx && !dy) return ;

  conf = conf || {};

  var imgDom = this.bgImg.ctnr;
  imgDom.style.top = parseFloat(imgDom.style.top) + dy + 'px';
  imgDom.style.left = parseFloat(imgDom.style.left) + dx + 'px';

  this.markers && this.markers.updateMarkersPosition();
}


export default Map