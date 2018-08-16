import Utils from './utils.js'


function Marker(ctnr, conf) {
  this.ctnr = ctnr;

  this.id = conf.id;
  this.name = conf.name;
  this.coords = conf.coords;
  this.active = conf.active;
  this.cusClass = conf.cusClass ? ' ' + conf.cusClass : '';
  this.clickCallback = conf.clickCallback;
  this.posOffset = conf.posOffset || {top: 0, left: 0};
  this.getDomCoords = conf.getDomCoords;

  this.initCtnr();
}

Marker.prototype.initCtnr = function() {
  var that = this, ctnr = this.ctnr;

  ctnr.title = this.name;
  ctnr.className = 'marker marker-' + this.id + this.cusClass;
  if (this.active) ctnr.className += ' active';
  
  this.updatePosition();

  this.clickCallback && ctnr.addEventListener('click', function(e) { that.clickCallback(that, e) });
};

Marker.prototype.updatePosition = function() {
  var dCoords = this.getDomCoords(this.coords);
  this.ctnr.style.top = dCoords.y + this.posOffset.top + 'px';
  this.ctnr.style.left = dCoords.x + this.posOffset.left + 'px';
};


export default Marker