import Utils from '../utils.js';


function Dispatch() {
  this.events = {};

  var i, e;
  for(i=0; i< arguments.length; i++) {
    e = arguments[i];
    if (Utils.isString(e)) {
      this.events[e] = [];
    } else if (Utils.isObject(e)) {
      this.events[e.event] = e.queue;
    }
  }
}

Dispatch.prototype.on = function(event, callback, conf) {
  if (!this.events.hasOwnProperty(event)) throw new Error("Unknown event: " + event);

  var res;

  if (callback === null) {
    this.events[event] = [];
  } else if (conf === null) {
    this.events[event].splice(this.callbackPosition(event, callback), 1);
  } else if (Utils.isFunction(callback)) {
    conf = conf || {};
    res = Utils.uniqueId();
    this.events[event].push({
      id: res,
      callback: callback,
      host: conf.host
    });
  }

  return res;
};

Dispatch.prototype.callbackPosition = function(event, callback) {
  var pos = -1,
    key = Utils.isFunction(callback) ? 'callback' : 'id';

  this.events[event].some(function(item, i) {
    if (item[key] === callback) {
      pos = i;
      return ;
    }
  });

  return pos;
}

Dispatch.prototype.call = function(event, that) {
  if (!this.events.hasOwnProperty(event)) throw new Error("Unknown event: " + event);

  var i, args = [];

  for(i=2; i< arguments.length; i++) args.push(arguments[i]);
  
  this.events[event].forEach(function(item) {
    item.callback.apply(item.host || that, args);
  });
};

Dispatch.prototype.apply = function(event, that, args) {
  if (!this.events.hasOwnProperty(event)) throw new Error("Unknown event: " + event);

  this.events[event].forEach(function(item) {
    item.callback.apply(item.host || that, args);
  });
};


export default Dispatch;