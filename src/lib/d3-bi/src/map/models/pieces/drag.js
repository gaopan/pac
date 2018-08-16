import Utils from '../utils.js';

function Drag(ctnr, conf) {
  this.isDrag = false;
  this.ctnr = ctnr;
  this.callBack = {
    drag: conf.drag,
    dragStart: conf.dragStart,
    dragEnd: conf.dragEnd
  };

  this.ctnr.addEventListener('mousedown', this.dragStart);
  document.addEventListener('mousemove', this.drag);
  document.addEventListener('mouseup', this.dragEnd);
}

Drag.prototype.drag = function(e) {
  if (!this.isDrag) return ;
  if (Utils.isFunction(this.callBack.drag)) this.callBack.drag(e);
};

Drag.prototype.dragStart = function(e) {
  this.isDrag = true;
  if (Utils.isFunction(this.callBack.dragStart)) this.callBack.dragStart(e);
};

Drag.prototype.dragEnd = function(e) {
  this.isDrag = false;
  if (Utils.isFunction(this.callBack.dragEnd)) this.callBack.dragEnd(e);
};

Drag.prototype.destroyed = function() {
  this.ctnr.removeEventListener('mousedown', this.dragStart);
  document.removeEventListener('mousemove', this.drag);
  document.removeEventListener('mouseup', this.dragEnd);
};


export default Drag;