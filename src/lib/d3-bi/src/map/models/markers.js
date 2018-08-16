import Utils from './utils.js'
import Marker from './marker.js'


function Markers(ctnr, conf) {
  this.ctnr = ctnr;
  this.list = [];

  this.ctnr.className = 'markers-wrapper';

  this.redrawMarkers(conf.list, conf);
}

Markers.prototype.redrawMarkers = function(list, conf) {
  this.list = [];
  this.ctnr.innerHTML = '';

  for (var i=0; i< list.length; i++) {
    if (!list[i]['id'] || !list[i]['name'] || !list[i]['coords']) break;
    this.list.push( new Marker(Utils.append(this.ctnr, 'div'), Object.assign(list[i], conf)) );
  }
};

Markers.prototype.updateMarkersPosition = function() {
  for (var i=0; i< this.list.length; i++) this.list[i].updatePosition();
};


export default Markers