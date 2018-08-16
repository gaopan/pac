import Utils from '../utils.js';

 
function Style(node, mixNames, val, conf) {
  conf = conf || {};
  return val !== undefined
    ? val !== null
      ? setStyle(node, mixNames, val, conf.priority || '')
      : removeStyle(node, mixNames)
    : getStyle(node, mixNames);
}


function setStyle(node, mixNames, val, priority) {
  return Utils.isObject(mixNames)
    ? setStyles(node, mixNames)
    : node.style.setProperty(mixNames, val, priority);
}

function setStyles(node, mixNames, priority) {
  Object.keys(mixNames).forEach(function(n){
    node.style.setProperty(n, mixNames[n], priority);
  });
}


function getStyle(node, mixNames) {
  var styles = document.defaultView.getComputedStyle(node, null);
  return Utils.isArray(mixNames)
    ? getStyles(styles, mixNames)
    : styles.getPropertyValue(mixNames);
}

function getStyles(styles, mixNames) {
  var res = {};
  mixNames.forEach(function(n){
    res[n] = styles.getPropertyValue(n);
  });
  return res;
}


function removeStyle(node, mixNames) {
  return Utils.isArray(mixNames)
    ? removeStyles(node, mixNames)
    : node.style.removeProperty(mixNames);
}

function removeStyles(node, mixNames) {
  mixNames.forEach(function(n){
    node.style.removeProperty(n);
  });
}


export default Style;