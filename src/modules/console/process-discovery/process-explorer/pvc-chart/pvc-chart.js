import Vue from "vue"
import * as d3 from 'd3'
import SVG from 'svg.js'
import commonGenerators from '@/utils/common-generators.js'
import commonConvertor from '@/utils/common-converter.js'

function PVCChart(container) {
  this._container = container;
}

PVCChart.prototype.data = function(data) {
  this._data = data;
  return this;
};

PVCChart.prototype.setFilter = function(filter) {
  this._filter = filter;
  return this;
};

PVCChart.prototype.onChange = function(fnOnChange) {
  this._onChange = fnOnChange;
  return this;
};

PVCChart.prototype.draw = function() {
  var self = this;
  self._id = commonGenerators.UUIDGenerator.shortPurchase();

  var container = this._container;
  var data = this._data,
    filter = this._filter,
    width = this._container.clientWidth,
    height = this._container.clientHeight,
    broadcast = this._onChange,
    idName = self._id;
  // console.log(width);
  if (width <= 0) {
    return self;
  }


  var mode = data.mode;
  if (mode == 'normal') {
    width = this._container.clientWidth > 165 ? parseInt(this._container.clientWidth) * 0.98 : 165;
    height = this._container.clientHeight > 60 ? parseInt(this._container.clientHeight) * 0.95 : 60;
  }
  if (mode == 'small') {
    width = this._container.clientWidth > 117 ? parseInt(this._container.clientWidth) : 117;
    height = this._container.clientHeight > 100 ? parseInt(this._container.clientHeight) : 100;
  }
  var percentage = commonConvertor.convertNumberToStr(data.statsData.percentage, 2) + "%";
  var totalVariant = data.statsData.totalVariant;
  var selectedBarCount = data.statsData.variant;
  
  var _draw = function(mode) {

    var svg = d3.select(".pvc-chart").append("svg")
      .attr("width", width)
      .attr('height', height);

    if (mode == 'normal') {
      var outerRadius = width * 0.15,
        innerRadius = outerRadius * 0.92,

        gcirclex = width * 0.25,
        gcircley = height * 0.6,
        g2x = 2 * gcirclex + 1.5 * outerRadius;
      var fontResize = 12 + "px";
      var rePositionX = g2x - 45;
      var lfPositionX = width * 0.25 - 40;
      if (parseInt(width) > 500) {
        fontResize = width * 0.025 + "px";
        rePositionX = g2x * 0.88;
        lfPositionX = gcirclex - outerRadius * 0.5;
      }
      var hudu;
      if (totalVariant != 0) {
        hudu = 90 * (selectedBarCount - (totalVariant / 2)) / (totalVariant / 2) * Math.PI / 180;
      } else {
        hudu = -90 * Math.PI / 180;
      }

      var huduper;
      if (parseInt(percentage) < 50) {
        huduper = (-18) * (50 - parseInt(percentage)) / 10 * Math.PI / 180;
      } else if (50 <= parseInt(percentage) && parseInt(percentage) <= 100) {
        huduper = 90 * (parseInt(percentage) - 50) / 50 * Math.PI / 180;
      } else {
        huduper = 90 * Math.PI / 180;
      }
      var g = svg.append("g")
        .attr("transform", "translate(" + gcirclex + "," + gcircley + ")");
      var g2 = svg.append("g")
        .attr("transform", "translate(" + g2x + "," + gcircley + ")");
      var arc = d3.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius)
        .startAngle(-90 * Math.PI / 180)
        .endAngle(90 * Math.PI / 180);
      var arcselectedBarCount = d3.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius)
        .startAngle(-90 * Math.PI / 180)
        .endAngle(hudu);
      var arcpercent = d3.arc()
        .outerRadius(outerRadius)
        .innerRadius(innerRadius)
        .startAngle(-90 * Math.PI / 180)
        .endAngle(huduper);
      g.append('path')
        .attr("d", arc)
        .attr("fill", "#B4B4B4")
        .on("mouseover", function() {
          d3.select(this)


        })
        .on("mouseout", function() {

        });
      g.append('path')
        .attr("d", arcselectedBarCount)
        .attr("fill", "#2ba229");
      g2.append('path')
        .attr("d", arc)
        .attr("fill", "#B4B4B4");
      g2.append('path')
        .attr("d", arcpercent)
        .attr("fill", "#2ba229");


      var texts = svg.append('text')
        .text(percentage)
        .attr("fill", "#2ba229")
        .style("font-size", fontResize)
        .style("line-height", fontResize)
        .attr("y", height * 0.5 + 8);

      if(parseInt(percentage).toString().length > 2) {
        texts.attr("x", g2x + 0 * outerRadius - 12);
      } else {
        texts.attr("x", g2x + 0 * outerRadius - 10);
      }

      var texts = svg.append('text')
        .text("实例覆盖率")
        // .attr("fill", "#B4B4B4")
        .attr("fill", "#333")
        .style("font-size", fontResize)
        .style("line-height", fontResize)
        .attr("x", rePositionX)
        .attr("y", height * 0.7 + 8);

      var texts = svg.append('text')
        .text("前" + selectedBarCount + "个分支路径")
        .attr("fill", "#2ba229")
        .style("font-size", fontResize)
        .style("line-height", fontResize)
        .attr("x", width * 0.23)
        .attr("y", height * 0.5 + 8);

      var texts = svg.append('text')
        .text("一共" + totalVariant + "个分支路径")
        // .attr("fill", "#B4B4B4")
        .attr("fill", "#333")
        .style("font-size", fontResize)
        .style("line-height", fontResize)
        .attr("x", lfPositionX)
        .attr("y", height * 0.7 + 8);
    } else if (mode == 'small') {

      var reFontsizeT = "14px",
          reFontsizeB = "12px";
      if (width > 400) {


        reFontsizeT = width * 0.020 + "px";
        reFontsizeB = width * 0.015 + "px";
      }
      var paddingX = 8,
        paddingY = 8;
      if (width > 500) {
        paddingX = 10,
          paddingY = 10;
      }
      var rectWidth = width - paddingX * 2,
        rectHeight = (height - paddingY * 3) / 2,
        firstRectPos = {
          x: paddingX,
          y: paddingY
        },
        secondRectPos = {
          x: paddingX,
          y: rectHeight + 2 * paddingY
        };

      var rect = svg.append('rect')
        .attr("x", firstRectPos.x)
        .attr('y', firstRectPos.y)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("fill", "#eee");
      var rect1 = svg.append('rect')
        .attr("x", secondRectPos.x)
        .attr('y', secondRectPos.y)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("fill", "#eee");
      var texts = svg.append('text')
        .text(percentage)
        .attr("fill", "#2ba229")
        .style("font-size", reFontsizeT)
        .style("line-height", reFontsizeT)
        .attr("x", firstRectPos.x + paddingX)
        .attr("y", firstRectPos.y+rectHeight/2-parseInt(reFontsizeT)/2+2);
      var texts = svg.append('text')
        .text("实例覆盖率")
        .attr("fill", "#333")
        .style("font-size", reFontsizeB)
        .style("line-height", reFontsizeB)
        .attr("x", firstRectPos.x + paddingX)
        .attr("y", firstRectPos.y + rectHeight / 2 + paddingY*2-2);

      var texts = svg.append('text')
        .text("前" + selectedBarCount + "个分支路径")
        .attr("fill", "#2ba229")
        .style("font-size", reFontsizeT)
        .style("line-height", reFontsizeT)
        .attr("x", secondRectPos.x + paddingX)
        .attr("y", secondRectPos.y+rectHeight/2-parseInt(reFontsizeT)/2+2);
      var texts = svg.append('text')
        .text("一共" + totalVariant + "个分支路径")
        .attr("fill", "#333")
        .style("font-size", reFontsizeB)
        .style("line-height", reFontsizeB)
        .attr("x", secondRectPos.x + paddingX)
        .attr("y", secondRectPos.y +rectHeight / 2 + paddingY*2-2);
    }
  }
  var clear = function() {
    // var childs = container.childNodes;
    // for (var i = 0; i < childs.length; i++) {
    //   container.removeChild(childs[i]);
    // }
    container.innerHTML = "";
  }
  clear();
  _draw(mode);
  return self;
}


export default PVCChart
