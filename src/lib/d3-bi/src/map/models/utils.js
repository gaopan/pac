import * as d3 from 'd3'
import Style from './pieces/style.js'

var Utils = {};


Utils.initMapCtnr = function(ctnr) {
  var resDom = Utils.select(document, ctnr);
  resDom.innerHTML = '';
  resDom.className = 'bi-map';
  return resDom;
};

Utils.buildNoDataMap = function(ctnr) {
};

Utils.getSuitSize = function(cSize, iSize) {
  var resSize = null,
    usedCWidth = {w: cSize.w, h: iSize.h * cSize.w/iSize.w},
    usedCHeight = {w: cSize.w * cSize.h/iSize.h, h: cSize.h};

  if (iSize.w <= cSize.w && iSize.h <= cSize.h) {
    if (cSize.w / iSize.w > cSize.h / iSize.h) {
      resSize = usedCHeight;
    } else {
      resSize = usedCWidth;
    }
  } else if (iSize.w >= cSize.w && iSize.h >= cSize.h) {
    if (iSize.w / cSize.w > iSize.h / cSize.h) {
      resSize = usedCWidth;
    } else {
      resSize = usedCHeight;
    }
  } else if (iSize.w <= cSize.w && iSize.h >= cSize.h) {
    resSize = usedCHeight;
  } else {
    resSize = usedCWidth;
  }

  return resSize;
};

Utils.getSuitSizeWidth = function(cSize, iSize) {
  return {
    w: cSize.w,
    h: iSize.h * cSize.w/iSize.w
  };
}


Utils.select = function(pDom, cName) {
  return pDom.querySelector(cName);
};
Utils.selectAll = function(pDom, cName) {
  return pDom.querySelectorAll(cName);
};

Utils.append = function(pDom, cName) {
  return pDom.appendChild(document.createElement(cName));
}

Utils.style = Style;

Utils.enabledDrag = function(dom, conf) {
  var drag = d3.drag();
  conf.start && drag.on('start', conf.start);
  conf.drag && drag.on('drag', function(){ conf.drag({dx: d3.event.dx, dy: d3.event.dy}) });
  conf.end && drag.on('end', conf.end);

  d3.select(dom).call(drag);
}

Utils.getSize = function(dom) {
  return {
    w: parseFloat(Utils.style(dom, 'width')),
    h: parseFloat(Utils.style(dom, 'height'))
  };
};


var fnProtoToStr = Object.prototype.toString;

Utils.isObject = function(t){
  return fnProtoToStr.call(t) === '[object Object]';
};
Utils.isArray = function(t){
  return fnProtoToStr.call(t) === '[object Array]';
};
Utils.isString = function(t){
  return fnProtoToStr.call(t) === '[object String]';
};
Utils.isNumber = function(t){
  return fnProtoToStr.call(t) === '[object Number]';
};
Utils.isBoolean = function(t){
  return fnProtoToStr.call(t) === '[object Boolean]';
};
Utils.isFunction = function(t){
  return fnProtoToStr.call(t) === '[object Function]';
};

Utils.convertArrToObj = function(arr, key) {
  if (!Utils.isArray(arr) || !arr.length) return null;

  var resObj = {};

  arr.forEach(function(ele){ ele.hasOwnProperty(key) && (resObj[key] = ele); });

  return resObj;
}

Utils.setDomPosition = function(dom, pos) {
  if (Utils.isObject(pos)) {
    var pArr = ['top', 'right', 'bottom', 'left'];
    for (var k in pos) {
      if (pArr.indexOf(k) != -1) dom.style[k] = pos[k] + 'px';
    }
  }
}

Utils.uniqueId = function() {
  return Math.random().toString().substr(2);
}


Utils.projectionType = {
  default: {
    convert: function(c) {
      return {
        x: c.x,
        y: c.y
      };
    },
    reverse: function(c) {
      return {
        x: c.x,
        y: c.y
      };
    }
  },
  mercator: {
    convert: function(c) {
      return {
        x: c.x,
        y: Math.log(Math.tan((90 + c.y) * Math.PI / 360)) / (Math.PI / 180)
      };
    },
    reverse: function(c) {
      return {
        x: c.x,
        y: 180 / Math.PI * (2 * Math.atan(Math.exp(c.y * Math.PI / 180)) - Math.PI / 2)
      };
    }
  }
};


export default Utils