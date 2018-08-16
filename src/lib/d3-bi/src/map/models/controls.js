import Utils from './utils.js'
import ZoomControl from './control-zoom.js'


function Controls(ctnr, conf) {
  this.ctnr = ctnr;
  this.zoom = null;

  this.ctnr.className = 'controls-wrapper';

  if (conf.zoom !== null) {
    this.zoom = new ZoomControl(Utils.append(this.ctnr, 'div'), {
      customize: conf.zoom || {},
      zoomRange: conf.zoomRange,
      zoomCallback: conf.zoomCallback
    });
  }
}


export default Controls