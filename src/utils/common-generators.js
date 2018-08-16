export default {
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

    generator.shortPurchase = function() {
      return "generator"+s4();
    };

    return generator;
  })()
}
