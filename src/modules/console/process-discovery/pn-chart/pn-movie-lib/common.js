function clone(obj) {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

var eventMatchers = {
  'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
  'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
}
var defaultOptions = {
  pointerX: 0,
  pointerY: 0,
  button: 0,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  metaKey: false,
  bubbles: true,
  cancelable: true
}

function simulate(element, eventName) {
  var options = extend(defaultOptions, arguments[2] || {});
  var oEvent, eventType = null;

  for (var name in eventMatchers) {
    if (eventMatchers[name].test(eventName)) {
      eventType = name;
      break;
    }
  }

  if (!eventType)
    throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

  if (document.createEvent) {
    oEvent = document.createEvent(eventType);
    if (eventType == 'HTMLEvents') {
      oEvent.initEvent(eventName, options.bubbles, options.cancelable);
    } else {
      oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
        options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
        options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
    }
    element.dispatchEvent(oEvent);
  } else {
    options.clientX = options.pointerX;
    options.clientY = options.pointerY;
    var evt = document.createEventObject();
    oEvent = extend(evt, options);
    element.fireEvent('on' + eventName, oEvent);
  }
  return element;
}

function extend(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
}

function getTextSize(text, styles) {
  var defaultStyles = {
    fontSize: '16px',
    position: 'absolute',
    visibility: 'hidden',
    height: 'auto',
    width: 'auto',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    fontFamily: "'Avenir', Helvetica, Arial, sans-serif"
  };
  styles = Object.assign(defaultStyles, styles);
  var wrapper = document.createElement('div');
  for (var key in styles) {
    if (styles.hasOwnProperty(key)) {
      wrapper.style[key] = styles[key];
    }
  }
  wrapper.innerHTML = text;
  document.body.appendChild(wrapper);
  var height = (wrapper.clientHeight + 1);
  var width = (wrapper.clientWidth + 1);
  wrapper.remove();

  return {
    width: width,
    height: height
  };
}

export default {
  extend: extend,
  deepClone: clone,
  simulate: simulate,
  getTextSize: getTextSize,
  protoToStr: Object.prototype.toString,
  isString: function(t) {
    return this.protoToStr.call(t) === "[object String]";
  },
  isArray: function(t) {
    return this.protoToStr.call(t) === "[object Array]";
  },
  isObject: function(t) {
    return this.protoToStr.call(t) === "[object Object]";
  },
  isNumber: function(t) {
    return this.protoToStr.call(t) === "[object Number]";
  },
  isBoolean: function(t){
    return this.protoToStr.call(t) === "[object Boolean]";
  },
  isFunction: function(t){
    return this.protoToStr.call(t) === '[object Function]';
  },
  findItemFromListWithId: function(aList, id){
    var res = null;
    aList.every(function(item, i) {
      if (item.id == id) {
        res = item;
        return false;
      }
      return true;
    });
    return res;
  },
  findItemIndexFromListWithId: function(aList, id){
    var res = -1;
    aList.every(function(item, i) {
      if (item.id == id) {
        res = i;
        return false;
      }
      return true;
    });
    return res;
  },
  removeConnectionFromList: function(connections, sourceId, targetId){
    connections.every(function(conn, index) {
      if (conn.source.id == sourceId && conn.target.id == targetId) {
        connections.splice(index, 1);
        return false;
      }
      return true;
    });
  },
  onMouseWheel: function(elem, func){
    elem.addEventListener("mousewheel", func, false);
    elem.addEventListener("DOMMouseScroll", func, false);
  },
  findConnectionFromList: function(connections, sourceId, targetId){
    var matched = null;
    connections.every(function(conn) {
      if (conn.source.id == sourceId && conn.target.id == targetId) {
        matched = conn;
        return false;
      }
      return true;
    });
    return matched;
  },
  // duration: seconds
  convertDurationToStr: function(duration){
    var divisorOfMinute = 60, divisorOfHour = 60 * 60, divisorOfDay = 60 * 60 * 24;
    // Seconds -> Minutes -> Hours -> Days
    if(!this.isNumber(duration)) return 'N/A';
    if(duration / divisorOfMinute < 1) {
      return duration.toFixed(1) + ' seconds';
    } else if(duration / divisorOfHour < 1) {
      return (duration / divisorOfMinute).toFixed(1) + ' minutes';
    } else if(duration / divisorOfDay < 1) {
      return (duration / divisorOfHour).toFixed(1) + ' hours';
    } else {
      return (duration / divisorOfDay).toFixed(1) + ' days';
    }
  },
  convertCountToStr: function(count){
    if(!this.isNumber(count)) return 'N/A';
    return count + '';
  },
  convertPointWithObliqueAngle: function(nObliqueAngle, oPoint) {
    var nOriginAngle = Math.atan2(oPoint.y, oPoint.x);
    var nDeltAngle = nOriginAngle - nObliqueAngle;
    var nDist = Math.sqrt(Math.pow(oPoint.x, 2) + Math.pow(oPoint.y, 2));
    return {
      x: nDist * Math.cos(nDeltAngle),
      y: nDist * Math.sin(nDeltAngle)
    };
  },
  calculatePointsForArrowOnLine: function(nLineWidth, nLineObliqueAngle, nArrowWidth, nArrowLength, oEndPoint) {
    oEndPoint = this.convertPointWithObliqueAngle(nLineObliqueAngle, oEndPoint);
    var arrowPoint1 = {
        x: oEndPoint.x - nArrowLength,
        y: oEndPoint.y - 0.5 * nArrowWidth
      },
      arrowPoint2 = {
        x: oEndPoint.x - nArrowLength,
        y: oEndPoint.y + 0.5 * nArrowWidth
      },
      arrowPoint3 = {
        x: oEndPoint.x - 0.7 * nArrowLength,
        y: oEndPoint.y
      };

    var oOPoint = {
      x: oEndPoint.x - 0.5 * nArrowWidth,
      y: oEndPoint.y - 0.5 * nLineWidth
    };

    return {
      arrowPoint1: this.convertPointWithObliqueAngle(-nLineObliqueAngle, arrowPoint1),
      arrowPoint2: this.convertPointWithObliqueAngle(-nLineObliqueAngle, arrowPoint2),
      arrowPoint3: this.convertPointWithObliqueAngle(-nLineObliqueAngle, arrowPoint3)
    };
  },
  UUIDGenerator: (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    var generator = {};

    generator.purchase = function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    };

    return generator;
  })()
}
