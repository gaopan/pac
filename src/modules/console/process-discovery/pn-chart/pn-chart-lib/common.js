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
  // wrapper.remove();
  //change by faiz
  document.body.removeChild(wrapper);

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
  isBoolean: function(t) {
    return this.protoToStr.call(t) === "[object Boolean]";
  },
  isFunction: function(t) {
    return this.protoToStr.call(t) === '[object Function]';
  },
  findItemFromListWithId: function(aList, id) {
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
  capitalize: function(str) {
    if (!this.isString(str)) {
      console.warn("The argument of capitalize method should be string!");
      return null;
    }
    return str.charAt(0).toUpperCase() + str.substring(1, str.length);
  },
  findItemFromListWithName: function(aList, name) {
    var res = null;
    aList.every(function(item, i) {
      if (item.name == name) {
        res = item;
        return false;
      }
      return true;
    });
    return res;
  },
  findItemIndexFromListWithId: function(aList, id) {
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
  removeConnectionFromList: function(connections, sourceId, targetId) {
    connections.every(function(conn, index) {
      if (conn.source.id == sourceId && conn.target.id == targetId) {
        connections.splice(index, 1);
        return false;
      }
      return true;
    });
  },
  onMouseWheel: function(elem, func) {
    elem.addEventListener("mousewheel", func, false);
    elem.addEventListener("DOMMouseScroll", func, false);
  },
  findConnectionFromList: function(connections, sourceId, targetId) {
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
  findConnectionFromListWithName: function(connections, sourceName, targetName) {
    var matched = null;
    connections.every(function(conn) {
      if (conn.source.name == sourceName && conn.target.name == targetName) {
        matched = conn;
        return false;
      }
      return true;
    });
    return matched;
  },
  getConnsByTransWithName: function(connections, from, tos, isPos) {
    var resArr = [],
      that = this;
    tos.forEach(function(d) {
      var c;
      if (isPos) {
        c = that.findConnectionFromListWithName(connections, from, d);
      } else {
        c = that.findConnectionFromListWithName(connections, d, from);
      }
      if (c) resArr.push(c);
    });
    return resArr;
  },
  judgeArrIsEqualByName: function(_arr1, _arr2) {
    var res = false,
      arr1 = null,
      arr2 = null;

    if (!_arr1 || !_arr2 || _arr1.length !== _arr2.length) return res = false;

    arr1 = _arr1.map(function(d) { return d.name });
    arr2 = _arr2.map(function(d) { return d.name });

    arr1.sort(fnSort);
    arr2.sort(fnSort);

    res = arr1.join('') === arr2.join('');

    function fnSort(a, b) {
      return a.name > b.name ? 1 : (a.name < b.name ? -1 : 0);
    }

    return res;
  },
  correlateData: function(connections, transitions, autoAdd, useName) {
    var that = this;
    connections.forEach(function(c) {
      var sourceName = c.sourceLabel,
        targetName = c.targetLabel;
      if (useName) {
        c.source = that.findItemFromListWithName(transitions, sourceName);
        c.target = that.findItemFromListWithName(transitions, targetName);
      } else {
        c.source = that.findItemFromListWithId(transitions, c.source);
        c.target = that.findItemFromListWithId(transitions, c.target);
      }

      if (autoAdd) {
        if (!c.source) {
          c.source = {
            id: that.UUIDGenerator.purchase(),
            name: sourceName
          };
          transitions.push(c.source);
        }
        if (!c.target) {
          if (sourceName == targetName) {
            c.target = c.source;
          } else {
            c.target = {
              id: that.UUIDGenerator.purchase(),
              name: targetName
            };
            transitions.push(c.target);
          }
        }
      }
      c.isStart = c.source.isStart || c.target.isStart;
      c.isEnd = c.source.isEnd || c.target.isEnd;
      if (!c.source.nextNodes) {
        c.source.nextNodes = [c.target];
      } else {
        c.source.nextNodes.push(c.target);
      }
      if (!c.target.previousNodes) {
        c.target.previousNodes = [c.source];
      } else {
        c.target.previousNodes.push(c.source);
      }
    });
    transitions.forEach(function(t) {
      if (!t.previousNodes) {
        t.previousNodes = [];
      }
      if (!t.nextNodes) {
        t.nextNodes = [];
      }
    });
  },
  // duration: seconds
  convertDurationToStr: function(duration) {
    var divisorOfMinute = 60,
      divisorOfHour = 60 * 60,
      divisorOfDay = 60 * 60 * 24;
    // Seconds -> Minutes -> Hours -> Days
    if (!this.isNumber(duration)) return 'N/A';
    if (duration / divisorOfMinute < 1) {
      return duration.toFixed(1) + ' 秒';
    } else if (duration / divisorOfHour < 1) {
      return (duration / divisorOfMinute).toFixed(1) + ' 分钟';
    } else if (duration / divisorOfDay < 1) {
      return (duration / divisorOfHour).toFixed(1) + ' 小时';
    } else {
      return (duration / divisorOfDay).toFixed(1) + ' 天';
    }
  },
  convertCountToStr: function(count) {
    if (!this.isNumber(count)) return 'N/A';
    return count + '';
  },
  validateActivityNameChars: function(name) {
    // var reg = new RegExp("^[A-Za-z0-9_\/\\s\-]*$", "i");
    // return reg.test(name);
    return true;
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
  })(),
  ColorGenerator: (function() {
    function hashCode(s) {
      var hash = 0,
        i, chr;
      if (s.length === 0) return hash;
      for (i = 0; i < s.length; i++) {
        chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }

    function toColorInt(s) {
      var code = hashCode(s);
      var sCode = code + '';
      var sInt = '1';
      for (var i = 0; i < sCode.length; i++) {
        sInt += '0';
      }
      return Math.floor(255 * (code / parseInt(sInt)));
    }
    var generator = {};
    generator.purchase = function(s) {
      var r = 0,
        g = 0,
        b = 0;
      if (!s) return { r: r, g: g, b: b, value: 'rgb(0,0,0)' };
      var segments = [];
      if (s.length > 2) {
        var cellLen = Math.floor(s.length / 3);
        segments.push(s.substr(0, cellLen));
        segments.push(s.substr(cellLen, cellLen));
        segments.push(s.substr(cellLen * 2));
      } else if (s.length == 2) {
        segments.push(s.charAt(0));
        segments.push(s.charAt(1));
        segments.push("");
      } else {
        segments.push(s);
        segments.push(s);
        segments.push(s);
      }

      r = toColorInt(segments[0]);
      g = toColorInt(segments[1]);
      b = toColorInt(segments[2]);

      return {
        r: r,
        g: g,
        b: b,
        value: 'rgb(' + r + ',' + g + ',' + b + ')'
      };
    };

    return generator;
  })()
}
