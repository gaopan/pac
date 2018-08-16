import Vue from "vue"
import * as d3 from 'd3'
import SVG from 'svg.js'
import commonGenerators from '@/utils/common-generators.js'
import commonConverters from '@/utils/common-converter.js'


function SliderChart(container) {
  this._container = container;
}

SliderChart.prototype.data = function(data) {
  this._data = data;
  return this;
};

SliderChart.prototype.setFilter = function(filter) {
  this._filter = filter;
  return this;
};

SliderChart.prototype.onChange = function(fnOnChange) {
  this._onChange = fnOnChange;
  return this;
};

SliderChart.prototype.draw = function() {
  var self = this;
  self._id = commonGenerators.UUIDGenerator.shortPurchase();



  var container = this._container,
    data = this._data,
    filter = this._filter,
    width = this._container.clientWidth,
    height = this._container.clientHeight,
    broadcast = this._onChange,
    idName = container.id;

    
  var margin = data.config.margin ? data.config.margin : { top: 0, right: 10, bottom: 20, left: 0 },
    padding = { top: 0, right: 5, bottom: 0, left: 33 };

  var percentage=[0,10,20,30,40,50,60,70,80,90,100];

  var toDecimal = function(x, precision) {
    var f = parseFloat(x);
    if (isNaN(f)) {
      return;
    }
    // f = Math.round(x * 100) / 100;
    return f.toFixed(precision);
  };

  var _draw = function() {
    container.innerHTML = "";

    var pctData=data.sliderData,
        currentPct=toDecimal(pctData.currentPercentage,4),
        pctList=pctData.percentageList,
        emitInfo = data.rankInfo,
        rankInfo = data.rankInfo;



    var picWidth = width - margin.left - margin.right,
      picHeight = height - margin.top - margin.bottom,
      idSelector = "#" + idName,
      unitHeight = picHeight / 12,
      currentLength=currentPct*10*unitHeight;


    var svg = d3.select(idSelector).append("svg")
        .attr("width", width)
        .attr('height', height);

      svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .attr("class", "chart-area")
        .attr("width", picWidth)
        .attr('height', picHeight);

    var chartArea=d3.select(idSelector).select(".chart-area");

    var initialDraw = function() {
      
      chartArea.selectAll(".sliderLabel")
        .data(percentage)
        .enter()
        .append("line")
        .attr("class", "sliderLabel")
        .attr("x1", 0)
        .attr("x2", function(d, i) {
          if(i==0||i==(percentage.length-1)){
            return 0;
          } else {
            return picWidth/5
          }
        })
        .attr("y1", function(d, i) {
          return (i+1) * unitHeight;
        })
        .attr("y2", function(d, i) {
          return (i+1) * unitHeight;
        })
        .attr("stroke", "#b4b4b4")
        .attr("stroke-width", "1")
        .attr("stroke-dasharray", "5,5")
        .attr("transform", "translate(" + picWidth*2/5 + "," + margin.top + ")");

      chartArea.append("line")
        .attr("class","dragLine")
        .attr("x1",picWidth/2)
        .attr("x2",picWidth/2)
        .attr("y1",unitHeight)
        .attr("y2",11*unitHeight)
        .attr("stroke","#b4b4b4")
        
        .attr("transform", "translate(0," + margin.top + ")");

      chartArea.append("line")
        .attr("class","highlightLine")
        .attr("x1",picWidth/2)
        .attr("x2",picWidth/2)
        .attr("y1",unitHeight)
        .attr("y2",currentLength+unitHeight)
        .attr("stroke","yellow")
        
        .attr("transform", "translate(0," + margin.top + ")");

      chartArea.append("text")
        .attr("class", "originLabel")
        .attr("fill", "#b4b4b4")
        .style("font-size", "12px")
        .text("0%")
        .attr("x",picWidth/2)
        .attr("y",unitHeight-20)
        .attr("text-anchor","middle")
        .attr("transform", "translate(0," + margin.top + ")");

      chartArea.selectAll(".leftLabel")
        .data(percentage)
        .enter()
        .append("text")
        .attr("class", "leftLabel")
        .attr("fill", "#b4b4b4")
        .style("font-size", "12px")
        .text(function(d,i){
          if(i==0||i==(percentage.length-1)){
            return "";
          }else {
            return percentage[i];
          }
        })
        .attr("x",picWidth/3-15)
        .attr("y",function(d,i){
          return (i+1) * unitHeight+4;
        })
        .attr("text-anchor","middle")
        .attr("transform", "translate(0," + margin.top + ")");
      
        chartArea.append("circle")
          .attr("class", "sliderDot")
          .attr("cx", picWidth/2)
          .attr("cy", unitHeight+currentLength)
          .attr("r", 10)
          .attr("fill", "#999999")
          .attr("transform", "translate(0," + margin.top + ")");


        chartArea.append("circle")
          .attr("class", "sliderDot")
          .attr("cx", picWidth/2)
          .attr("cy", unitHeight+currentLength)
          .attr("r", 6)
          .attr("fill", "#ffffff")
          .attr("transform", "translate(0," + margin.top + ")");

         
        chartArea.append("path")
          .attr("class", "percentageDisplay")
          .attr("d",pathGenerator(picWidth/6,picWidth/6,3*picWidth/5+20,currentLength+unitHeight))
     
          .attr("fill", "#ffffff")
          .attr("transform", "translate(0," + margin.top + ")");

   
        chartArea.append("text")
          .attr("class", "percentageText")
          .attr("fill", "#000")
          .style("font-size", "10px")
          .text(function(){
            return toDecimal(currentPct*100,2)+"%"
          })
          .attr("x",picWidth/12+3*picWidth/5+20)
          .attr("y",currentLength+unitHeight+4)
          .attr("text-anchor","middle")
          .attr("transform", "translate(0," + margin.top + ")");

        chartArea.append("text")
        .attr("class", "bottomTitle")
        .attr("fill", "#b4b4b4")
        .style("font-size", "12px")
        .text("Total Case(%)")
        .attr("x",picWidth/2)
        .attr("y",11*unitHeight+30)
        .attr("text-anchor","middle")
        .attr("transform", "translate(0," + margin.top + ")");
    }

    var pathGenerator=function(height,width,startX,startY){
            var startPositionX = startX,
            endPositionX = startX+width,
            startPositionY = startY-width/2,
            endPositionY = startY+width/2;

            var A = { x: startPositionX, y: startPositionY },
                B = { x: endPositionX, y: startPositionY },
                C = { x: endPositionX, y: endPositionY },
                D = { x: startPositionX, y: endPositionY };

            var path = "M" + A.x + " " + A.y + "L" + B.x + " " + B.y + "A" + height/2 + " " + height/2 + " 0 0 1" + " " + C.x + " " + C.y + "L" + D.x + " " + D.y + "A" + height/2 + " " + height/2 + " 0 0 1" + A.x + " " + A.y + "Z";
            return path;
         }

    var dragSlider=function(){
      var sliderDot=chartArea.select(".sliderDot")._groups[0];
      var drag=d3.drag()
        .on("start",function(d){
        })
        .on("end",function(d){
          var casePercentage=(sliderDot[0].cy.baseVal.value-unitHeight-margin.top)/(unitHeight*10);
          
          var calculateVariants=function(pct){
            if(pct<=toDecimal(pctList[0],4)){
              return 1;
            }else if(pct<toDecimal(pctList[1],4)){
              return 2;
            }else if(pct<toDecimal(pctList[2],4)){
              return 3;
            }else if(pct<toDecimal(pctList[3],4)){
              return 4;
            }else if(pct<toDecimal(pctList[4],4)){
              return 5;
            }else if(pct<toDecimal(pctList[5],4)){
              return 6;
            }else if(pct<toDecimal(pctList[6],4)){
              return 7;
            }else if(pct<toDecimal(pctList[7],4)){
              return 8;
            }else if(pct<toDecimal(pctList[8],4)){
              return 9;
            }else{
              return 10;
            };
          }
          broadcast(rankInfo[calculateVariants(toDecimal(casePercentage,4)) - 1].processDefinitionId, calculateVariants(toDecimal(casePercentage,4)), emitInfo, false, false);
        })
        .on("drag",function(d){
          chartArea.selectAll("" + idSelector + " .sliderDot")
                .attr("cx", picWidth/ 2)
                .attr("cy", function() {
                  var max = 11*unitHeight,
                    min = unitHeight;
                  if (d3.event.y < min) {
                    return min;
                  } else if (d3.event.y > max) {
                    return max;
                  } else {
                    return d3.event.y;
                  }
                });
            chartArea.selectAll("" + idSelector + " .highlightLine")
                .attr("y2",sliderDot[0].cy.baseVal.value)
            chartArea.selectAll("" + idSelector + " .percentageDisplay")
                .attr("d",pathGenerator(picWidth/6,picWidth/6,3*picWidth/5+20,sliderDot[0].cy.baseVal.value))

            chartArea.selectAll("" + idSelector + " .percentageText")
                .text(function(){
                    var casePercentage=(sliderDot[0].cy.baseVal.value-unitHeight-margin.top)/(unitHeight*10);
                    return toDecimal(100*casePercentage,2)+"%"
                })
                .attr("y",sliderDot[0].cy.baseVal.value+4)

        });
      chartArea.selectAll(".sliderDot")
        .call(drag)

    }

    initialDraw();
    dragSlider();


  }

  _draw();
  return self;
}


export default SliderChart
