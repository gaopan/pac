function PNPlace(container, p) {
  this._container = container;
  this._pos = p.position;
  this._size = p.size;
  this._title = p.name;
  this._token = p.token;
  this._isStart = !!p.isStart;
  this._isEnd = !!p.isEnd;
  this._id = p.id;
}

PNPlace.prototype.draw = function() {
  var self = this;
  var container = this._container,
    oPos = this._pos,
    oSize = this._size,
    sTitle = this._title || "Place",
    nToken = this._token || 0,
    bIsStart = this._isStart,
    bIsEnd = this._isEnd,
    sID = this._id;

  var wrapper = document.createElement("div");
  wrapper.className = "pn-node pn-place";
  if(bIsStart) {
  	wrapper.className += " start";
  } else if(bIsEnd) {
  	wrapper.className += " end";
  }
  wrapper.style.left = oPos.x + "px";
  wrapper.style.top = oPos.y + "px";
  wrapper.style.width = oSize.w + "px";
  wrapper.style.height = oSize.h + "px";

  var pointElem = document.createElement('div');
  pointElem.className = 'point';
  // pointElem.innerHTML = sID;
  wrapper.appendChild(pointElem);

  var captionElem = document.createElement('div');
  captionElem.className = 'caption';
  wrapper.appendChild(captionElem);

  var titleElem = document.createElement('div');
  titleElem.className = 'title';
  titleElem.title = sTitle;
  titleElem.innerHTML = sTitle;
  captionElem.appendChild(titleElem);

  var labelElem = document.createElement('div');
  labelElem.className = 'label';
  labelElem.innerHTML = nToken + '';
  captionElem.appendChild(labelElem);

  container.appendChild(wrapper);

  this.node = wrapper;
  return self;
};

export default PNPlace
