import * as d3 from "d3"
import CommonUtils from '@/utils/common-utils.js'

function Timeline(container) {
  this._container = container;
}

function init() {
  let self = this,
    $container = this._$container = d3.select(self._container);

  let $lineWrapper = $container.append('div');
  $lineWrapper.classed('line-wrapper', true);

  let $middleLineWrapper = $lineWrapper.append('div');
  $middleLineWrapper.classed('middle-line-wrapper', true);
  $middleLineWrapper.append('div').classed('middle-line', true);

  let $lineContainer = self._$lineContainer = $lineWrapper.append('div')
  $lineContainer.classed('line-container', true);
}

function render() {
  let self = this,
    data = this._data;

  if (data && data.length > 0) {
    if (!self._$lineContainer) {
      init.call(self);
    }
    let lineWrapperWidth = self._$lineContainer.node().parentNode.clientWidth,
      lineContainerHeight = self._$lineContainer.node().clientHeight,
      nodeContainerWidth = lineWrapperWidth / 3 - 15 * 2,
      nodeContentShortcutHeight = (lineContainerHeight - 50) / 2,
      nodeContentHeight = lineContainerHeight - 50;
    self._$lineContainer.html("");
    self._$lineContainer.selectAll('div.node-container')
      .data(data).enter().append('div').classed('node-container', true)
      .style("width", nodeContainerWidth + 'px')
      .classed('current', function(d) { return d.month == self._curMonth; })
      .html(function(d) {
        return `<div class="node-month">${d.month}</div><div class="node-icon ${d.nodeType=='Key'?'key':'general'}"></div>
        <div class="node-content-shortcut" style="display:block;height:${nodeContentShortcutHeight+'px'}">${d.value}</div>
        <div class="node-content" style="display:none;height:${nodeContentHeight + 'px'}">${d.value}</div>`;
      });
    self._$lineContainer.style("width", nodeContainerWidth * data.length + 15 * (data.length - 1) + 'px');
    let selections = self._$lineContainer.selectAll('div.node-container > .node-content-shortcut')
    selections.on('mouseenter', function() {
      let $shortcutContent = d3.select(this),
        $content = d3.select($shortcutContent.node().parentNode).select('.node-content');
      $shortcutContent.style('display', 'none');
      $content.style('display', 'block');
    });
    self._$lineContainer.selectAll('div.node-container > .node-content')
      .on("mouseleave", function() {
        let $content = d3.select(this),
          $shortcutContent = d3.select($content.node().parentNode).select('.node-content-shortcut');
        $shortcutContent.style('display', 'block');
        $content.style('display', 'none');
      })
    if(self._$lineContainer.node().clientWidth > lineWrapperWidth) {
      self._$lineContainer.on("mouseup", function(){});
      self._$lineContainer.on("mousedown", function(){});
      self._$lineContainer.on("mousemove", function(){});
    }
  } else {
    self._$container.html("暂时没有数据显示");
    self._$lineContainer = null;
  }
}

function destroy() {}


Timeline.prototype.data = function(data) {
  this._data = CommonUtils.deepClone(data);
  return this;
};

Timeline.prototype.currentMonth = function(curMonth) {
  this._curMonth = curMonth;
  return this;
};

Timeline.prototype.render = function() {
  render.call(this);
};

export default Timeline
