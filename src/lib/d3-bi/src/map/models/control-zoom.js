import Utils from './utils.js'


function ZoomControl(ctnr, conf) {
  this.state = 1;
  this.ctnr = ctnr;
  this.addZoomButton = null;
  this.cutZoomButton = null;
  this.customize = conf.customize;
  this.zoomRange = conf.zoomRange;
  this.zoomCallback = conf.zoomCallback;

  this.initCtnr();
}

ZoomControl.prototype.initCtnr = function() {
  this.ctnr.className = 'zoom-control';

  this.addZoomButton = initAddZoomButton(this);
  this.cutZoomButton = initCutZoomButton(this);
  this.ctnr.appendChild(this.addZoomButton);
  this.ctnr.appendChild(this.cutZoomButton);

  this.addZoomButton.disabled = this.state >= this.zoomRange[1] ? true : false;
  this.cutZoomButton.disabled = this.state <= this.zoomRange[0] ? true : false;

  function initAddZoomButton(that) {
    var button = document.createElement('button');

    button.className = "add";
    button.appendChild(document.createTextNode('+'));
    button.addEventListener('click', function(){
      that.zoomCallback(++that.state);
      that.addZoomButton.disabled = that.state >= that.zoomRange[1] ? true : false;
      that.cutZoomButton.disabled = that.state <= that.zoomRange[0] ? true : false;
    });

    return button;
  }

  function initCutZoomButton(that) {
    var button = document.createElement('button');

    button.className = "cut";
    button.appendChild(document.createTextNode('-'));
    button.addEventListener('click', function(){
      that.zoomCallback(--that.state);
      that.addZoomButton.disabled = that.state >= that.zoomRange[1] ? true : false;
      that.cutZoomButton.disabled = that.state <= that.zoomRange[0] ? true : false;
    });

    return button;
  }
}


export default ZoomControl