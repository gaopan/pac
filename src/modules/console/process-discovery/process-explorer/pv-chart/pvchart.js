import Vue from "vue"
import * as d3 from 'd3'
import SVG from 'svg.js'
import commonGenerators from '@/utils/common-generators.js'
import commonConverters from '@/utils/common-converter.js'

function PVChart(container) {
  this._container = container;
}

PVChart.prototype.data = function(data) {
  this._data = data;
  return this;
};

PVChart.prototype.setFilter = function(filter) {
  this._filter = filter;
  return this;
};
PVChart.prototype.iconOnClick = function(clickFn) {
  this.iconOnClick = clickFn;
  return this;
};

PVChart.prototype.barOnClick = function(clickFn) {
  this.barOnClick = clickFn;
  return this;
};

PVChart.prototype.onChange = function(fnOnChange) {
  this._onChange = fnOnChange;
  return this;
};


PVChart.prototype.updateStyle = function() {
  var container = this._container,
    data = this._data,
    width = this._container.clientWidth,
    height = this._container.clientHeight,
    mode = data.mode,
    clickable = data.clickable;

  if (data.mode == "small") {
    width = this._container.clientWidth > 180 ? parseInt(this._container.clientWidth) : 180;
    height = this._container.clientHeight > 196 ? parseInt(this._container.clientHeight - 15) : 196;
  } else if (data.mode == "normal") {
    width = this._container.clientWidth > 230 ? parseInt(this._container.clientWidth) : 230;
    height = this._container.clientHeight > 334 ? parseInt(this._container.clientHeight - 15) : 334;
  }

  var margin = data.config.margin ? data.config.margin : { top: 2, right: 20, bottom: 0, left: 50 };
  if (mode == "small") {
    if (clickable) {
      var margin = data.config.margin ? data.config.margin : { top: 2, right: 30, bottom: 0, left: 35 };
    } else {
      var margin = data.config.margin ? data.config.margin : { top: 2, right: 15, bottom: 0, left: 35 };
    }
  }

  var barArea = d3.selectAll(".bar-area");
  barArea.selectAll(".bar")
    .attr("width", width - margin.left - margin.right)
    .attr("fill", "#eee")
    .attr("stroke", "#eee")
  barArea.selectAll(".stepNo")
    .attr("fill", "#333")
    .style("font-weight", "bold")
  barArea.selectAll("icon")
    .style("color", "#eee");
  return this;
};

//Azhaziq - 27/11/2017: Defect 2544
PVChart.prototype.enableHover = function() {
  var data = this._data;
  data.hoverable = true;
}

PVChart.prototype.draw = function(opts) {
  opts = Object.assign({
    disabledEmit: false,
    clickInitial: false
  }, opts);

  var self = this;
  self._id = commonGenerators.UUIDGenerator.shortPurchase();

  var container = this._container,
    data = this._data,
    filter = this._filter,
    clickFn = this.iconOnClick,
    barOnClick = this.barOnClick,
    width = this._container.clientWidth,
    height = this._container.clientHeight,
    broadcast = this._onChange,
    disabledEmit = opts.disabledEmit,
    clickInitial = opts.clickInitial,
    idName = self._id;

  // var ct = d3.select("" + "." + container.className + "").attr("id", idName)._groups[0];
  // if(ct){
  //   ct.style.display="block";
  //   width = ct.clientWidth;
  //   height = ct.clientHeight;
  // }


  if (data.mode == "small") {
    width = this._container.clientWidth > 177 ? parseInt(this._container.clientWidth) : 177;
    height = this._container.clientHeight > 196 ? parseInt(this._container.clientHeight - 15) : 196;
  } else if (data.mode == "normal") {
    width = this._container.clientWidth > 230 ? parseInt(this._container.clientWidth) : 230;
    height = this._container.clientHeight > 334 ? parseInt(this._container.clientHeight - 15) : 334;
  }

  var dealData = function(array) {
    var temp = [];
    for (var i = 0; i < array.length; i++) {
      temp.push(array[i].percentage)
    };
    return temp;
  }

  var toDecimal = function(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
      return;
    }
    f = Math.round(x * 100) / 100;
    return f;
  }

  var getLimitLength = function(x) {
    var temp = 10,
      pct = 0;
    for (var i = 0; i < x.length; i++) {
      if (i < 9 && x[i].percentage === 0) {
        temp = i > 0 ? i : 1;
        break;
      } else if (i == 9 && pct == 1) {
        temp = 9;
      }
      pct = pct + x[i].percentage;
    };
    return temp;
  }

  var barCount = data.config.top ? data.config.top : 10,
    maxPercent = data.config.maxPercent ? data.config.maxPercent : 1,
    emitInfo = data.rankInfo,
    rankInfo = data.rankInfo,
    mode = data.mode,
    clickable = data.clickable,
    clickingBar = data.clickingBar,
    currentSelectedBar = data.selectedBar;

  // console.log(clickingBar);

  if (rankInfo.length < 10) {
    for (var i = rankInfo.length; i < 10; i++) {
      rankInfo.push({
        percentage: 0,
        duration: 0
      })
    }
  };

  // set the 10th percentage 100%
  rankInfo[9].percentage = 1;

  var limitLength = getLimitLength(emitInfo);
  // console.log(limitLength);



  var margin = data.config.margin ? data.config.margin : { top: 2, right: 20, bottom: 0, left: 50 },
    progressMargin = data.config.progressMargin ? data.config.progressMargin : { top: 20, right: 90, bottom: 20, left: 50 },
    padding = { top: 0, right: 5, bottom: 0, left: 33 };
  if (mode == "small") {
    if (clickable) {
      var margin = data.config.margin ? data.config.margin : { top: 2, right: 30, bottom: 0, left: 35 };
    } else {
      var margin = data.config.margin ? data.config.margin : { top: 2, right: 15, bottom: 0, left: 35 };
    }
  }

  var maxBarRange = [],
    percentage = dealData(rankInfo, percentage),
    title = [],
    percentageDisplay = [],
    durationDisplay = [];
  for (var i = 0; i < barCount; i++) {
    maxBarRange[i] = maxPercent;
    percentageDisplay.push(toDecimal(percentage[i] * 100) + '%');
    durationDisplay.push(commonConverters.convertSecondToStr1(rankInfo[i].averageCycleTime, 1));
    title.push(data.config.title[i]);
  };

  var _draw = function(mode) {
    container.innerHTML = "";
    var paddingH = 10, 
      barContainerHeght = (height - paddingH * 2) / 10,
      barHeight = barContainerHeght * 0.8,
      maxbarWidth = width - margin.right - margin.left,
      maxPercentageWidth = maxbarWidth - progressMargin.left - progressMargin.right,
      insideBarWidth = maxbarWidth - padding.left - padding.right,
      selectedBarCount = (currentSelectedBar && currentSelectedBar <= limitLength) ? currentSelectedBar : (limitLength > 5 ? 5 : limitLength),
      resetBarCount = null,
      processHeight = 10,
      idSelector = "#" + idName,
      dragAreaX = width - (mode == 'small' ? margin.left/2 : margin.right/2);
    //13th June 2017: muhammad-azhaziq.bin-mohd-azlan-goh@hpe.com
    //Temp solution to sent more data to component that listen to this change
    //This broadcast is meant to sent the inital data when the view is first loaded 
    if (!disabledEmit) {
      broadcast(rankInfo[selectedBarCount - 1].processDefinitionId, selectedBarCount, emitInfo, false, false);
    }

    var svg = d3.select("" + "." + container.className + "").attr("id", idName).append("svg")
      .attr("width", width)
      .attr('height', height);
    var xScale1 = d3.scaleLinear()
      .domain([0, maxPercent])
      .range([margin.left, width - margin.right - margin.left]);

    var xScale2 = d3.scaleLinear()
      .domain([0, maxPercent])
      .range([margin.left + progressMargin.left, maxPercentageWidth + margin.left + progressMargin.left]);

    // var xAxis = d3.axisTop(xScale2)
    //   .tickArguments([5, "%"]);

    svg.append("g")
      .attr("transform", "translate(" + (mode == "small" ? margin.right : margin.left) + ",0)")
      .attr("class", "bar-area");
    svg.append("g")
      .attr("transform", "translate(0,0)")
      .attr("class", "drag-area");
    var barArea = d3.select(idSelector).select(".bar-area"),
      dragArea = d3.select(idSelector).select(".drag-area");

    var filtered = function(i, total) {
      for (var j = 0; j < i; j++) {
        dragArea.selectAll("circle:nth-of-type(" + j + ")")
          .attr("fill", "#2BA229");
        barArea.selectAll("path:nth-of-type(" + (j + barCount + 1) + ")")
          .attr("fill", "#2BA229");
        if (mode == "small") {
          barArea.selectAll("text:nth-of-type(" + (j + barCount + 1) + ")")
            .attr("fill", "#333");
          barArea.selectAll("text:nth-of-type(" + (j + barCount + 11) + ")")
            .attr("fill", "#333");
        }
      };
      for (var k = i; k < total; k++) {
        dragArea.selectAll("circle:nth-of-type(" + k + ")")
          .attr("fill", "#999");
        barArea.selectAll("path:nth-of-type(" + (k + barCount + 1) + ")")
          .attr("fill", "#666666");
        if (mode == "small") {
          barArea.selectAll("text:nth-of-type(" + (k + barCount + 1) + ")")
            .attr("fill", "#666666");
          barArea.selectAll("text:nth-of-type(" + (k + barCount + 11) + ")")
            .attr("fill", "#666666");
        }

      };

      dragArea.selectAll(".dragToStep")
        .attr("cy", "" + ((selectedBarCount - 1) * barContainerHeght + paddingH + margin.top + barHeight / 2) + "")
        .attr("cx", dragAreaX);
      dragArea.selectAll(".selectedLine")
        .attr("y2", "" + ((selectedBarCount - 1) * barContainerHeght + paddingH + margin.top + barHeight / 2) + "")
        .attr("stroke", "#2BA229");

    }
    var resetVariantBarStyle = function() {
      var barArea = d3.selectAll(".bar-area");
      barArea.selectAll(".bar")
        .attr("width", width - margin.left - margin.right)
        .attr("fill", "#eee")
        .attr("stroke", "#eee")
      barArea.selectAll(".stepNo")
        .attr("fill", "#333")
        .style("font-weight", "bold")
      barArea.selectAll("icon")
        .style("color", "#eee");
    }
    var totalPercentageGenerator = function(i) {
      var startPositionX = processHeight / 2,
        endPositionX = maxPercentageWidth - processHeight / 2,
        startPositionY = i * barContainerHeght + paddingH + barHeight / 2 - processHeight / 2,
        endPositionY = i * barContainerHeght + paddingH + barHeight / 2 + processHeight / 2;
      var A = { x: startPositionX, y: startPositionY },
        B = { x: endPositionX, y: startPositionY },
        C = { x: endPositionX, y: endPositionY },
        D = { x: startPositionX, y: endPositionY };

      var path = "M" + A.x + " " + A.y + "L" + B.x + " " + B.y + "A" + processHeight / 2 + " " + processHeight / 2 + " 0 0 1" + " " + C.x + " " + C.y + "L" + D.x + " " + D.y + "A" + processHeight / 2 + " " + processHeight / 2 + " 0 0 1" + A.x + " " + A.y + "Z";
      return path;
    }

    var percentageGenerator = function(i, pct) {
      var length = pct * maxPercentageWidth;
      var startPositionX = null,
        endPositionX = null,
        startPositionY = null,
        endPositionY = null,
        path = null;
      if (length < processHeight / 2) {
        var temp = processHeight * processHeight / 4 - ((processHeight / 2 - length) * (processHeight / 2 - length));
        var midPositionY1 = i * barContainerHeght + paddingH - Math.sqrt(temp) + barHeight / 2;
        var midPositionY2 = i * barContainerHeght + paddingH + Math.sqrt(temp) + barHeight / 2;
        var G = { x: length, y: midPositionY1 },
          H = { x: length, y: midPositionY2 };
        path = "M" + G.x + " " + G.y + "L" + H.x + " " + H.y + "A" + processHeight / 2 + " " + processHeight / 2 + " 0 0 1" + " " + G.x + " " + G.y + "Z";
        return path;
      } else if (length > maxPercentageWidth - processHeight / 2) {
        var tempX = length - (maxPercentageWidth - processHeight / 2),
          tempY = processHeight * processHeight / 4 - tempX * tempX;
        var midPositionY1 = i * barContainerHeght + paddingH - Math.sqrt(tempY) + barHeight / 2,
          midPositionY2 = i * barContainerHeght + paddingH + Math.sqrt(tempY) + barHeight / 2;
        startPositionX = processHeight / 2;
        endPositionX = maxPercentageWidth - processHeight / 2;
        startPositionY = i * barContainerHeght + paddingH + barHeight / 2 - processHeight / 2;
        endPositionY = i * barContainerHeght + paddingH + barHeight / 2 + processHeight / 2;
        var A = { x: startPositionX, y: startPositionY },
          B = { x: endPositionX, y: startPositionY },
          C = { x: endPositionX, y: endPositionY },
          D = { x: startPositionX, y: endPositionY };
        var E = { x: length, y: midPositionY1 },
          F = { x: length, y: midPositionY2 };
        path = "M" + A.x + " " + A.y + "L" + B.x + " " + B.y + "A" + processHeight / 2 + " " + processHeight / 2 + " 0 0 1" + " " + E.x + " " + E.y + "L" + F.x + " " + F.y + "A" + processHeight / 2 + " " + processHeight / 2 + " 0 0 1" + " " + C.x + " " + C.y + "L" + D.x + " " + D.y + "A" + processHeight / 2 + " " + processHeight / 2 + " 0 0 1" + A.x + " " + A.y + "Z";
        return path;
      } else {
        startPositionX = processHeight / 2;
        endPositionX = pct * maxPercentageWidth;
        startPositionY = i * barContainerHeght + paddingH + barHeight / 2 - processHeight / 2;
        endPositionY = i * barContainerHeght + paddingH + barHeight / 2 + processHeight / 2;
        var A = { x: startPositionX, y: startPositionY },
          B = { x: endPositionX, y: startPositionY },
          C = { x: endPositionX, y: endPositionY },
          D = { x: startPositionX, y: endPositionY };
        path = "M" + A.x + " " + A.y + "L" + B.x + " " + B.y + "L" + C.x + " " + C.y + "L" + D.x + " " + D.y + "A" + processHeight / 2 + " " + processHeight / 2 + " 0 0 1" + A.x + " " + A.y + "Z";
        return path;
      }
    }

    var initialClick = function() {
      barArea.selectAll(".bar")
        .attr("width", width - margin.left - margin.right)
        .attr("fill", "#eee")
        // .attr("stroke-width", "4px")
        .attr("stroke", "#eee")
      barArea.selectAll(".stepNo")
        .attr("fill", "#333")
        .style("font-weight", "bold")
      barArea.selectAll("icon")
        .style("color", "#eee");
    }


    var initialDraw = function(mode) {
      
      dragArea.selectAll(".drag")
        .data(percentage)
        .enter()
        .append("line")
        .attr("class", "dragLine")
        .attr("x1", dragAreaX)
        .attr("x2", dragAreaX)
        .attr("y1", barHeight / 2 + paddingH)
        .attr("y2", (barCount - 1) * barContainerHeght + paddingH + barHeight / 2)
        .attr("stroke", "#999")
        .attr("stroke-width", "2")
        .attr("transform", "translate(0," + margin.top + ")");

      dragArea.append("line")
        .attr("class", "selectedLine")
        .attr("x1", dragAreaX)
        .attr("x2", dragAreaX)
        .attr("y1", barHeight / 2 + paddingH)
        .attr("y2", barHeight / 2 + paddingH)
        .attr("stroke", "#2BA229")
        .attr("stroke-width", "2")
        .attr("transform", "translate(0," + margin.top + ")");

      dragArea.selectAll(".dragDot")
        .data(percentage)
        .enter()
        .append("circle")
        .attr("class", "dragDot")
        .attr("cx", dragAreaX)
        .attr("cy", function(d, i) {
          return i * barContainerHeght + paddingH;
        })
        .attr("r", 6)
        .attr("fill", "#999")
        .attr("transform", "translate(0," + (margin.top + barHeight / 2) + ")")
        .on("click", function(d, i) {
          if (i < limitLength) {
            resetVariantBarStyle();
            selectedBarCount = i + 1;
            resetBarCount = selectedBarCount + 1;

            //13th June 2017: muhammad-azhaziq.bin-mohd-azlan-goh@hpe.com
            //Temp solution to sent more data to component that listen to this change
            broadcast(rankInfo[i].processDefinitionId, i + 1, emitInfo, false, false);

            // self.setFilter(i + 1);
            filtered(i + 1, barCount);
            dragArea.selectAll("" + idSelector + " .selectedLine")
              .attr("stroke", "#2BA229")
              .attr("y2", function() {
                return i * barContainerHeght + paddingH + barHeight / 2;
              });

            dragArea.selectAll("" + idSelector + " .dragToStep")
              .attr("cx", dragAreaX)
              .attr("cy", function() {
                return i * barContainerHeght + paddingH + barHeight / 2;
              });
          }

        });


      dragArea.append("circle")
        .attr("class", "dragToStep")
        .attr("cx", dragAreaX)
        .attr("cy", margin.top + barHeight / 2)
        .attr("r", 10)
        .attr("fill", "#2BA229")
        .attr("transform", "translate(0,0)");


      dragArea.append("circle")
        .attr("class", "dragToStep")
        .attr("cx", dragAreaX)
        .attr("cy", margin.top + barHeight / 2)
        .attr("r", 6)
        .attr("fill", "#ffffff")
        .attr("transform", "translate(0,0)");

      // console.log(clickingBar);
      barArea.selectAll(".bar")
        .data(maxBarRange)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", function(d, i) {
          return i * barContainerHeght + paddingH;
        })
        .attr("width", xScale1)
        .attr("height", barHeight)
        .attr("fill", "#eee")
        .attr("transform", "translate(0," + margin.top + ")")
        .on("click", function(d, i) {
          // console.log(data.hoverable)
          if (i < selectedBarCount && data.hoverable) {

            if (i == clickingBar.barCount - 1) {
              // console.log(i + 1);
              barArea.selectAll(".bar:nth-of-type(" + (i + 1) + ")")
                .attr("stroke", "#eee");
              var emitObj = {
                barCount: i + 1,
                clicked: true
              }
              self.barOnClick(emitObj.barCount, emitObj.clicked, emitInfo);
              clickingBar.barCount = null;
              clickingBar.clicked = false;

            } else {
              if (clickingBar.barCount != null) {
                barArea.selectAll(".bar:nth-of-type(" + clickingBar.barCount + ")")
                  .attr("stroke", "#eee")
              }

              barArea.selectAll(".bar:nth-of-type(" + (i + 1) + ")")
                .attr("stroke", "#2BA229")
              var emitObj = {
                barCount: i + 1,
                clicked: false
              }
              self.barOnClick(emitObj.barCount, emitObj.clicked, emitInfo);
              clickingBar.barCount = i + 1;
              clickingBar.clicked = true;
            }
          }
        });

      if (clickingBar.clicked) {
        barArea.selectAll(".bar:nth-of-type(" + clickingBar.barCount + ")")
          .attr("stroke", "#2BA229")
      }


      if (mode == 'normal') {
        barArea.selectAll(".path")
          .data(percentage)
          .enter()
          .append("path")
          .attr("class", "path")
          .attr("fill", "#eee")
          .attr("d", function(d, i) {
            var path = totalPercentageGenerator(i);
            return path;
          })
          .attr("transform", "translate(" + progressMargin.left + ",0)");

        barArea.selectAll(".percentage")
          .data(percentage)
          .enter()
          .append("path")
          .attr("class", "percentage")
          .attr("fill", "#666666")
          .attr("d", function(d, i) {
            var path = percentageGenerator(i, percentage[i]);
            return path;
          })
          .attr("transform", "translate(" + progressMargin.left + ",0)");


        barArea.selectAll(".rankInfo text")
          .data(title)
          .enter()
          .append("text")
          .attr("class", "stepNo")
          .attr("fill", "#333")
          .style("font-size", "14px")
          .text(function(d, i) {
            return title[i];
          })
          .attr("x", 0)
          .attr("y", function(d, i) {
            return i * barContainerHeght + paddingH;
          })
          .attr("transform", "translate(10," + (margin.top + barHeight / 2 + 4) + ")");

        barArea.selectAll(".stepInfo rect")
          .data(percentage)
          .enter()
          .append("text")
          .attr("class", "stepPercentage")
          .attr("fill", "#333")
          .style("font-size", "12px")
          .style("line-height", "12px")
          .text(function(d, i) {
            return percentageDisplay[i];
          })
          .attr("x", 0)
          .attr("y", function(d, i) {
            return i * barContainerHeght + paddingH;
          })
          .attr("transform", "translate(" + (20 + progressMargin.left + maxPercentageWidth) + "," + (margin.top + barHeight / 2 - 3) + ")");

        barArea.selectAll(".stepInfo rect")
          .data(rankInfo)
          .enter()
          .append("text")
          .attr("class", "stepDuration")
          .attr("fill", "#333")
          .style("font-size", "12px")
          .style("line-height", "12px")
          .text(function(d, i) {
            return durationDisplay[i];
          })
          .attr("x", 0)
          .attr("y", function(d, i) {
            return i * barContainerHeght + paddingH;
          })
          .attr("transform", "translate(" + (20 + progressMargin.left + maxPercentageWidth) + "," + (12 + margin.top + barHeight / 2) + ")");
      } else if (mode == "small") {
        barArea.selectAll(".insideBar")
          .data(maxBarRange)
          .enter()
          .append("rect")
          .attr("class", "insideBar")
          .attr("x", 0)
          .attr("y", function(d, i) {
            return i * barContainerHeght + paddingH + barHeight * 0.2;
          })
          .attr("width", function() {
            return insideBarWidth;
          })
          .attr("height", barHeight * 0.6)
          .attr("fill", "#eee")
          .attr("transform", "translate(" + padding.left + ",0)");

        barArea.selectAll(".rankInfo text")
          .data(title)
          .enter()
          .append("text")
          .attr("class", "stepNo")
          .attr("fill", "#333")
          .style("font-size", "12px")
          .text(function(d, i) {
            return title[i];
          })
          .attr("x", 0)
          .attr("y", function(d, i) {
            return i * barContainerHeght + paddingH;
          })
          .attr("transform", "translate(10," + (margin.top + barHeight / 2 + 4) + ")");

        barArea.selectAll(".stepInfo rect")
          .data(percentage)
          .enter()
          .append("text")
          .attr("class", "stepPercentage")
          .attr("fill", "#666666")
          .style("font-size", "10px")
          .style("line-height", "10px")
          .text(function(d, i) {
            return percentageDisplay[i];
          })
          .attr("x", 0)
          .attr("y", function(d, i) {
            return i * barContainerHeght + paddingH;
          })
          .style("text-anchor", "middle")
          .attr("transform", "translate(" + (padding.left + insideBarWidth / 4) + "," + (margin.top + barHeight / 2 + 3) + ")");

        barArea.selectAll(".stepInfo rect")
          .data(rankInfo)
          .enter()
          .append("text")
          .attr("class", "stepDuration")
          .attr("fill", "#666666")
          .style("font-size", "10px")
          .style("line-height", "10px")
          .text(function(d, i) {
            return durationDisplay[i];
          })
          .attr("x", 0)
          .attr("y", function(d, i) {
            return i * barContainerHeght + paddingH;
          })
          .style("text-anchor", "middle")
          .attr("transform", "translate(" + (padding.left + insideBarWidth * 3 / 4) + "," + (margin.top + barHeight / 2 + 3) + ")");

        if (clickable) {
          barArea.selectAll("icon")
            .data(title)
            .enter()
            .append('text')
            .attr('dominant-baseline', 'central')
            .attr('font-family', 'pac-icon')
            .attr('font-size', '16px')
            .attr("class", "icon")
            .text(function(d) { return '\ue902' })
            .attr("x", 0)
            .attr("y", function(d, i) {
              return i * barContainerHeght + paddingH;
            })
            .attr("transform", "translate(" + (-margin.left/2 -10) + "," + (margin.top + barHeight / 2 - 1) + ")")
            .on("click", function(d, i) {
              if (clickable && (rankInfo[i].variant || i == 9)) {

                //Azhaziq - 27/11/2017: Defect 2544
                data.hoverable = false;
                setTimeout(() => {
                  barArea.selectAll(".bar")
                    .attr("width", width - margin.left - margin.right)
                    .attr("fill", "#eee")
                    .attr("stroke", "#eee")
                  barArea.selectAll(".stepNo")
                    .attr("fill", "#333")
                    .style("font-weight", "bold")


                  barArea.selectAll(".bar:nth-of-type(" + (i + 1) + ")")
                    .attr("width", width - margin.right)
                    .attr("x", -margin.left)
                    .attr("fill", "#2BA229")
                    .attr("stroke", "#2BA229")
                  barArea.selectAll(".stepNo:nth-of-type(" + (i + 1) + ")")
                    .attr("fill", "black")
                    .style("font-weight", "bold");

                }, 0)

                self.iconOnClick(i + 1);

                // exit bar click mode
                if (clickingBar.clicked) {
                  barArea.selectAll(".bar:nth-of-type(" + clickingBar.barCount + ")")
                    .attr("stroke", "#eee")
                    .attr("x", 0);
                  var emitObj = {
                    barCount: i + 1,
                    clicked: true
                  }
                  self.barOnClick(emitObj.barCount, emitObj.clicked, emitInfo);
                  clickingBar.barCount = null;
                  clickingBar.clicked = false;
                }

              }
            })
        }

      }

    }

    var dragSelect = function() {
      var drag = d3.drag()
        .on("start", function(d) {

        })
        .on("end", function(d) {

          filtered(selectedBarCount, barCount);

          //13th June 2017: muhammad-azhaziq.bin-mohd-azlan-goh@hpe.com
          //Temp solution to sent more data to component that listen to this change
          broadcast(rankInfo[selectedBarCount - 1].processDefinitionId, selectedBarCount, emitInfo, false, false);

          self.setFilter(selectedBarCount);
          initialClick();

        })
        .on("drag", function(d) {
          if (limitLength !== 1) {
            dragArea.selectAll("" + idSelector + " .selectedLine")
              .attr("stroke", "#2BA229")
              .attr("y2", function() {
                var max = (limitLength - 1) * barContainerHeght + paddingH + barHeight / 2,
                  min = barHeight / 2;
                if (d3.event.y < min) {
                  return min;
                } else if (d3.event.y > max) {
                  return max;
                } else {
                  return d3.event.y;
                }
              });

            dragArea.selectAll("" + idSelector + " .dragToStep")
              .attr("cx", dragAreaX)
              .attr("cy", function() {
                var max = (limitLength - 1) * barContainerHeght + paddingH + barHeight / 2,
                  min = barHeight / 2;
                if (d3.event.y < min) {
                  return min;
                } else if (d3.event.y > max) {
                  return max;
                } else {
                  return d3.event.y;
                }
              });


            var selected = function(yPosition) {
              var temp = limitSelectedCount(Math.round((yPosition + barHeight / 2 + paddingH) / barContainerHeght));
              selectedBarCount = temp > limitLength ? limitLength : temp;
              resetBarCount = selectedBarCount + 1;

              for (var i = resetBarCount; i < barCount + 1; i++) {
                dragArea.selectAll("" + idSelector + " circle:nth-of-type(" + i + ") ")
                  .attr("fill", "#999");
                barArea.selectAll("path:nth-of-type(" + (i + barCount) + ")")
                  .attr("fill", "#999");
                if (mode == "small") {
                  barArea.selectAll("text:nth-of-type(" + (i + barCount) + ")")
                    .attr("fill", "#2BA229");
                  barArea.selectAll("text:nth-of-type(" + (i + barCount + 10) + ")")
                    .attr("fill", "#2BA229");
                }
              }

              for (var i = 0; i < selectedBarCount; i++) {
                dragArea.selectAll("" + idSelector + " circle:nth-of-type(" + (i + 1) + ") ")
                  .attr("fill", "#2BA229");
                barArea.selectAll("path:nth-of-type(" + (i + barCount + 1) + ")")
                  .attr("fill", "#2BA229");
                if (mode == "small") {
                  barArea.select(".bar-area").selectAll("text:nth-of-type(" + (i + barCount + 1) + ")")
                    .attr("fill", "#2BA229");
                  barArea.select(".bar-area").selectAll("text:nth-of-type(" + (i + barCount + 11) + ")")
                    .attr("fill", "#2BA229");
                }
              }
            }


            var limitSelectedCount = function(cnt) {
              var max = 10,
                min = 1;
              if (cnt < min) {
                return min;
              } else if (cnt > max) {
                return max;
              } else {
                return cnt;
              }
            }

            selected(d3.event.y);
          }


        });

      dragArea.selectAll("" + idSelector + " .dragToStep")
        .call(drag);
    }

    initialDraw(mode);
    filtered(selectedBarCount, barCount);
    dragSelect();

  }

  if (!clickInitial) {
    _draw(mode);

  } else {
    // reset to the initial style before clicking
    resetVariantBarStyle();
  }
  return self;

}


export default PVChart
