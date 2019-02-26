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
    let rowCount = 7,
      marginHor = 5,
      curMonth = new Date().getFullYear() + '-' + (new Date().getMonth() + 1),
      lineWrapperWidth = self._$lineContainer.node().parentNode.clientWidth,
      lineContainerHeight = self._$lineContainer.node().clientHeight,
      nodeContainerWidth = (lineWrapperWidth - marginHor * (rowCount - 1)) / rowCount,
      elasticRangeX = nodeContainerWidth / 2,
      nodeContentShortcutHeight = (lineContainerHeight - 100) / 2,
      nodeContentHeight = lineContainerHeight - 100,
      activeMonthDataIndex = -1;

    data.every((d, index) => {
      if (d.month == curMonth) {
        activeMonthDataIndex = index;
        return false;
      }
      return true;
    });

    let lineContainerWidth = nodeContainerWidth * data.length + marginHor * (data.length - 1),
      lineContainerInitTransX = -(activeMonthDataIndex - (rowCount - 1) / 2) * (nodeContainerWidth + marginHor);
    if (activeMonthDataIndex == -1) {
      lineContainerInitTransX = 0;
      activeMonthDataIndex = (rowCount - 1) / 2;
    }

    self._$lineContainer.html("");
    self._$lineContainer.selectAll('div.node-container')
      .data(data).enter().append('div').classed('node-container', true)
      .style("width", nodeContainerWidth + 'px')
      .classed('current', function(d) { return d.month == self._curMonth; })
      .html(function(d) {
        return `<div class="node-month">${d.month}</div><div class="node-icon ${d.status} ${d.nodeType=='Key'?'key':'general'}"></div>
        <div class="node-content-shortcut" style="display:block;height:${nodeContentShortcutHeight+'px'}">${d.value}</div>
        <div class="node-content" style="display:none;width:${nodeContainerWidth * 6/5 + 'px'};height:${nodeContentHeight + 'px'}">${d.value}</div>`;
      });
    self._$lineContainer.style("width", lineContainerWidth + 'px');
    self._$lineContainer.style("transform", `translate(${lineContainerInitTransX}px, 0)`);
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
    // if(self._$lineContainer.node().clientWidth > lineWrapperWidth) {
    self._$lineContainer.style("cursor", "move");
    let startPos = { x: -1, y: -1 },
      dist = { x: 0, y: 0 },
      lastTrans = { x: 0, y: 0 },
      lastMouseDownTrans = { x: lineContainerInitTransX, y: 0 };
    self._$lineContainer.on("mousedown", function() {
      let evt = d3.event, $doc = d3.select(document.body);
      self._$lineContainer.style("transition-duration", '0s');
      startPos.x = evt.screenX;
      lastTrans.x = lastMouseDownTrans.x;

      let onMouseMove = function() {
        let _evt = d3.event,
          $this = d3.select(this);
        dist.x = _evt.screenX - startPos.x;

        lastTrans.x = lastMouseDownTrans.x + dist.x;

        if (lastTrans.x > nodeContainerWidth + marginHor + elasticRangeX) {
          lastTrans.x = nodeContainerWidth + marginHor;
          self._$lineContainer.style("transition-duration", '.5s');
        } else if (lastTrans.x < -(lineContainerWidth - nodeContainerWidth - marginHor + elasticRangeX)) {
          lastTrans.x = -(lineContainerWidth - nodeContainerWidth - marginHor);
          self._$lineContainer.style("transition-duration", '.5s');
        } else {
          self._$lineContainer.style("transition-duration", '0s');
          self._$lineContainer.style("transform", `translate(${lastTrans.x}px, 0)`);
        }
      };

      let onMouseUp = function() {
        if (lastTrans.x >= nodeContainerWidth + marginHor) {
          lastTrans.x = nodeContainerWidth + marginHor;
          self._$lineContainer.style("transition-duration", '.5s');
        } else if (lastTrans.x <= -(lineContainerWidth - nodeContainerWidth - marginHor)) {
          lastTrans.x = -(lineContainerWidth - nodeContainerWidth - marginHor);
          self._$lineContainer.style("transition-duration", '.5s');
        } else {
          activeMonthDataIndex = -Math.round(lastTrans.x / (nodeContainerWidth + marginHor)) + (rowCount - 1) / 2;
          lastTrans.x = -(activeMonthDataIndex - (rowCount - 1) / 2) * (nodeContainerWidth + marginHor);
        }
        // self._$lineContainer.selectAll('div.node-container').each(function(d, i){
        //   d3.select(this).classed("current", activeMonthDataIndex == i);
        // });
        self._$lineContainer.style("transform", `translate(${lastTrans.x}px, 0)`);
        lastMouseDownTrans.x = lastTrans.x;
        $doc.on("mousemove", null);
        $doc.on("mouseup", null);
      };

      $doc.on("mousemove", onMouseMove);
      $doc.on("mouseup", onMouseUp);
    });

    // }
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
