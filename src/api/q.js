var q = {};

function Promise() {
  this._successHandler = null;
  this._errorHandler = null;
};

Promise.prototype.then = function(successHandler, errorHandler) {
  this._successHandler = successHandler;
  this._errorHandler = errorHandler;
};

Promise.prototype.shouldSucceed = function(successRes) {
  if (typeof this._successHandler === "function") {
    this._successHandler.call(this, successRes);
  }
};

Promise.prototype.shouldError = function(errorRes) {
  if (typeof this._errorHandler === "function") {
    this._errorHandler.call(this, errorRes);
  }
};

function Delay() {
  this.promise = new Promise();
}

Delay.prototype.resolve = function(resolveRes) {
  this.promise.shouldSucceed(resolveRes);
};

Delay.prototype.reject = function(rejectRes) {
  this.promise.shouldError(rejectRes);
};

q.defer = function() {
  return new Delay();
};

export default q;
