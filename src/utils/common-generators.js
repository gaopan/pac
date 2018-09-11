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
      return "generator" + s4();
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
