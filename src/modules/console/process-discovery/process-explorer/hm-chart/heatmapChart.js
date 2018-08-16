import Vue from "vue"
import * as d3 from 'd3'
import SVG from 'svg.js'
import commonGenerators from '@/utils/common-generators.js'
import commonConverters from '@/utils/common-converter.js'


function HMChart(container) {
  this._container = container;
}

HMChart.prototype.data = function(data) {
  this._data = data;
  return this;
};

HMChart.prototype.setFilter = function(filter) {
  this._filter = filter;
  return this;
};

HMChart.prototype.onChange = function(fnOnChange) {
  this._onChange = fnOnChange;
  return this;
};

HMChart.prototype.draw = function(opts) {
  var self = this;
  self._id = commonGenerators.UUIDGenerator.shortPurchase();



  var container = this._container,
    data = this._data,
    filter = this._filter,
    width = this._container.clientWidth,
    height = this._container.clientHeight,
    broadcast = this._onChange,
    idName = data.id;


  // if (data.mode == "small") {
  //   width = this._container.clientWidth > 113 ? parseInt(this._container.clientWidth) : 113;
  //   height = this._container.clientHeight > 196 ? parseInt(this._container.clientHeight - 15) : 196;
  // } else if (data.mode == "normal") {
  //   width = this._container.clientWidth > 230 ? parseInt(this._container.clientWidth) : 230;
  //   height = this._container.clientHeight > 334 ? parseInt(this._container.clientHeight - 15) : 334;
  // }

  var dealData = function(array) {
    var temp = [];
    for (var i = 0; i < array.length; i++) {
      temp.push(array[i].percentage)
    };
    return temp;
  }

  var toDecimal = function(x, precision) {
    var f = parseFloat(x);
    if (isNaN(f)) {
      return;
    }
    // f = Math.round(x * 100) / 100;
    return f.toFixed(precision);
  }



  var displayData = data.displayData,
    mode = data.mode,
    id = data.id,
    lineCnt = data.config.level + 1,
    barColor = data.config.barColor,
    arrowColor = data.config.arrowColor,
    line = [];
  for (var i = 0; i < lineCnt; i++) {
    line.push("");
  }






  var margin = data.config.margin ? data.config.margin : { top: 20, right: 10, bottom: 20, left: 10 },
    padding = { top: 0, right: 5, bottom: 0, left: 33 };


  var _draw = function(mode) {
    container.innerHTML = "";
    var picWidth = width - margin.left - margin.right,
      picHeight = height - margin.top - margin.bottom,
      idSelector = "#" + idName,
      barContainerHeght = picHeight / 5,
      barContainerwidth = picWidth;



    var initialDraw = function(mode) {

      var svg = d3.select(idSelector).append("svg")
        .attr("width", width)
        .attr('height', height);

      svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .attr("class", "left-area")
        .attr("width", picWidth / 4)
        .attr('height', picHeight);
      svg.append("g")
        .attr("transform", "translate(" + (margin.left + picWidth / 4) + ",0)")
        .attr("class", "mid-area")
        .attr("width", 2 * picWidth / 4)
        .attr('height', picHeight);
      svg.append("g")
        .attr("transform", "translate(" + (margin.left + picWidth * 3 / 4) + ",0)")
        .attr("class", "right-area")
        .attr("width", picWidth / 4)
        .attr('height', picHeight);
      var leftArea = d3.select(idSelector).select(".left-area"),
        midArea = d3.select(idSelector).select(".mid-area"),
        rightArea = d3.select(idSelector).select(".right-area");



      midArea.selectAll(".line")
        .data(line)
        .enter()
        .append("line")
        .attr("class", "line")
        .attr("x1", 0)
        .attr("x2", 2 * picWidth / 4)
        .attr("y1", function(d, i) {
          return i * barContainerHeght - 10;
        })
        .attr("y2", function(d, i) {
          return i * barContainerHeght - 10;
        })
        .attr("stroke", "#b4b4b4")
        .attr("stroke-width", "1")
        .attr("stroke-dasharray", "5,5")
        .attr("transform", "translate(0," + margin.top + ")");

      var leftMax = displayData.left.max, leftMin = displayData.left.min;
      if(displayData.left.unit) {
        leftMax = commonConverters.convertValueFromSecond(displayData.left.max, 1);
        leftMin = leftMax - commonConverters.convertValueFromSecond(displayData.left.max - displayData.left.min, 1);
      }

      leftArea.selectAll(".leftlegend")
        .data(line)
        .enter()
        .append("text")
        .attr("class", "leftlegend")
        .attr("fill", "#b4b4b4")
        .style("font-size", "8px")
        .text(function(d, i) {
          if (displayData.left.unit) {
            if (i == 0 || i == line.length - 1) {
              return "";
            } else {
              return toDecimal((line.length - 1 - i) / (line.length - 1) * (leftMax - leftMin) + leftMin, 1) + " " + displayData.left.unit;
            }
          } else {
            if (i == 0 || i == line.length - 1) {
              return "";
            } else {
              return toDecimal((line.length - 1 - i) / (line.length - 1) * (leftMax - leftMin) + leftMin, 0);
            }
          }
        })
        .attr("x", 0)
        .attr("y", function(d, i) {
          return i * barContainerHeght - 8;
        })
        .attr("transform", function() {
          if (displayData.left.unit) {
            return "translate(5," + margin.top + ")"
          } else {
            return "translate(10," + margin.top + ")"
          }
        });

      var rightMax = displayData.right.max, rightMin = displayData.right.min;
      if(displayData.right.unit) {
        rightMax = commonConverters.convertValueFromSecond(displayData.right.max, 1);
        rightMin = rightMax - commonConverters.convertValueFromSecond(displayData.right.max - displayData.right.min, 1);
      }

      rightArea.selectAll(".rightlegend")
        .data(line)
        .enter()
        .append("text")
        .attr("class", "rightlegend")
        .attr("fill", "#b4b4b4")
        .style("font-size", "8px")
        .text(function(d, i) {
          if (displayData.right.unit) {
            if (i == 0 || i == line.length - 1) {
              return "";
            } else {
              return toDecimal(((line.length) - 1 - i) / (line.length - 1) * (rightMax - rightMin) + rightMin, 1) + " " + displayData.right.unit;
            }
          } else {
            if (i == 0 || i == line.length - 1) {
              return "";
            } else {
              return toDecimal(((line.length) - 1 - i) / (line.length - 1) * (rightMax - rightMin) + rightMin, 0);
            }
          }

        })
        .attr("x", 0)
        .attr("y", function(d, i) {
          return i * barContainerHeght - 8;
        })
        .attr("transform", function() {
          if (displayData.right.unit) {
            return "translate(10," + margin.top + ")"
          } else {
            return "translate(10," + margin.top + ")"
          }
        });



      midArea.selectAll(".bar")
        .data(barColor)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", function(d, i) {
          return i * barContainerHeght - 6;
        })
        .attr("width", 0.3 * picWidth)
        .attr("height", 0.75 * barContainerHeght)
        .attr("fill", function(d, i) {
          return barColor[i];
        })
        .attr("stroke", function(d, i) {
          return barColor[i];
        })
        .attr("stroke-width", "1")
        .attr("transform", "translate(2," + margin.top + ")");

      midArea.append("line")
        .attr("class", "arrowwrapper")
        .attr("x1", 0.3 * picWidth + 20)
        .attr("x2", 0.3 * picWidth + 20)
        .attr("y1", 0)
        .attr("y2", picHeight)
        .attr("stroke", "#595858")
        .attr("stroke-width", barContainerHeght * 2 / 3)
        .attr("stroke-linecap", "round")
        .style("opacity", "0.7")
        .attr("transform", "translate(0," + (margin.top - 10) + ")");

      midArea.selectAll(".arrowline")
        .data(arrowColor)
        .enter()
        .append("line")
        .attr("class", "arrowline")
        .attr("x1", 0.3 * picWidth + 20)
        .attr("x2", 0.3 * picWidth + 20)
        .attr("y1", function(d, i) {
          if (i == 0) {
            return i * barContainerHeght + 10;
          } else {
            return i * barContainerHeght;
          }
        })
        .attr("y2", function(d, i) {
          if (i == arrowColor.length - 1) {
            return (i + 1) * barContainerHeght - 5;
          } else {
            return (i + 1) * barContainerHeght;
          }
        })
        .attr("stroke", function(d, i) {
          return arrowColor[i];
        })
        .attr("stroke-width", "6")
        .attr("transform", "translate(0," + (margin.top - 10) + ")");

      var pathGenerator = function(x, y, barContainerHeght) {
        var A = { x: x, y: y },
          B = { x: x - barContainerHeght / 3, y: y + barContainerHeght / 3 },
          C = { x: x, y: y + barContainerHeght / 6 },
          D = { x: x + barContainerHeght / 3, y: y + barContainerHeght / 3 };
        var path = "M" + A.x + " " + A.y + "L" + B.x + " " + B.y + "L" + C.x + " " + C.y + "L" + D.x + " " + D.y + "L" + A.x + " " + A.y + "Z";
        return path;
      }

      midArea.append("path")
        .attr("class", "arrowwrapper")
        .attr("class", "path")
        .attr("fill", function() {
          return arrowColor[0];
        })
        .attr("d", function() {
          var path = pathGenerator(0.3 * picWidth + 20, 5, barContainerHeght);
          return path;
        })
        .attr("transform", "translate(0," + (margin.top - 10) + ")");




    }


    initialDraw(mode);


  }

  _draw(mode);
  return self;
}


export default HMChart
