export default {
  getScrollBarWidth: function() {
    var inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);

    document.body.appendChild(outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;

    document.body.removeChild(outer);

    return (w1 - w2);
  },
  getTextWidth: function(text, fontSize, fontFamily) {
    var a = document.createElement('canvas');
    var b = a.getContext('2d');
    b.font = fontSize + 'px ' + fontFamily;
    return b.measureText(text).width;
  },
  getTextSize: function(text, styles) {
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
}
