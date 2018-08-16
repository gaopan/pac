import * as d3 from "d3"
var D3table = (function() {
    function D3table(ele, options) {
        this.name = ele;
        this.ele = d3.select(ele);
        this.searchTimer = null;
        this.data = null;
        this.model = {
            columnUnselected: [],
            columnSelected: null,
            currentData: null,
            rendedColumn: null,
            designated: "",
            clickedText: "",
            sort:{type:"",name:""}
        }

        this.iconTo = {
            "icon-sort": "icon-sort-up",
            "icon-sort-up": "icon-sort-down",
            "icon-sort-down": "icon-sort-up"
        }

        this.options = {
            sort: {
                able: options.sort?(options.sort.able || false) : false, //sort table's row when click table's head 
                local: options.sort?(options.sort.local || false) : false,
                rule: options.sort?(options.sort.rule || null) : null
            },
            scroll: {
                able: options.scroll ? (options.scroll.able || false) : false, //show scroll 
                height: options.scroll ? (options.scroll.height || 300) : 300 //container's height
            },
            toolbar: {
                filterColumn: options.toolbar ? (options.toolbar.filterColumn || []) : [], //filter column
                columnSearched: options.toolbar ? (options.toolbar.columnSearched || "") : "", //search target column's value
                keySearched: "", //search target column's value
                placeholderTxt: options.toolbar ? (options.toolbar.placeholderTxt || "") : ""
            },
            mark: {
                column: options.mark ? (options.mark.column || []) : [], //mark special column
                icon: options.mark ? (options.mark.icon || "") : "" //add icon
            },
            clickedColumn: options.clickedColumn || [],
        };
    }
    
    D3table.util = {};

    D3table.prototype.init = function() {
        this.initContainer();
        this.initToolbar();

        return this;
    }

    D3table.prototype.initContainer = function() {
        this.ele.html(
              `<div class="bi-table">
                  <div class="table-toolbar"></div>
                  
                  <div class="table-container">
                      <table class="table-body"></table>
                  </div>
              </div>`
        )

        return this;
    }

    D3table.prototype.initToolbar = function() {

        if(D3table.util.typeChecker.isArray(this.options.toolbar.filterColumn)&&this.options.toolbar.filterColumn.length){
            this.initFilterColumnTool(this.options.toolbar.filterColumn)
        }
        if (this.options.toolbar.columnSearched !== "") {
            this.searchTool(this.options.toolbar.columnSearched)
        }
        this.ele.select(".table-toolbar")
            .append("div")
            .attr("class", "clearfix");
    }

    D3table.prototype.initFilterColumnTool = function(t_value) {
        var _this = this,
            column = this.options.toolbar.filterColumn;
        this.model.columnSelected =  column;

        if (t_value && t_value.length > 0) {
            var filterColumnBox = this.ele.select(".table-toolbar")
                .append("div")
                .attr("class", "filter-column");

            var columnSerie = filterColumnBox.append("ul")
                .attr("class", "column-series");

            var toggleButton = filterColumnBox.append("i")
                .attr("class", "icon icon-menu");

            toggleButton.on("click", function() {
                var columnSerieDisplay = columnSerie.style("display") == "none" ? "block" : "none";
                columnSerie.style("display", columnSerieDisplay)

            });
            var optionLi = columnSerie.selectAll("li")
                .data(column)
                .enter()
                .append("li");

            var optionLabel = optionLi.append("label");

            var optionInput = optionLabel.append("input")
                .attr("type", "checkbox")
                .attr("checked", true)
                .attr("data-label", d => d);

            var model = this.model,
                inputEle = d3.selectAll(".filter-column input"),
                labelEle = d3.selectAll(".filter-column ul label");

            optionInput.on("click", function(event) {
                if (d3.select(this).style("cursor") == "not-allowed") {
                    d3.event.preventDefault();
                } else {
                    setTimeout(function() {
                        if (model.columnSelected.length === 1) {
                            for (let ele = 0, len = inputEle._groups[0].length; ele < len; ele++) {
                                if (inputEle._groups[0][ele].checked == true) {
                                    d3.select(labelEle._groups[0][ele]).style("cursor", "not-allowed");
                                    d3.select(inputEle._groups[0][ele]).style("cursor", "not-allowed");
                                }
                            }
                        } else if (model.columnSelected.length > 1) {
                            for (let ele = 0, len = inputEle._groups[0].length; ele < len; ele++) {
                                d3.select(labelEle._groups[0][ele]).style("cursor", "pointer");
                                d3.select(inputEle._groups[0][ele]).style("cursor", "pointer");
                            }
                        }
                    }, 0)

                    _this.ele.select(".search-input").property("value", "")

                    var labelName = d3.select(this).attr("data-label"),
                        oChecked = d3.select(this).node().checked;


                    _this.filterDataByColumn(labelName, oChecked)
                    _this.thead(_this.options.theadConfig);
                    _this.tbody(model.currentData,"filter");

                    columnSerie.style("display", "none")

                }
            });

            optionLabel.append("span").text(d => d);

            if (model.columnSelected.length === 1) {
                d3.select(labelEle._groups[0][0]).style("cursor", "not-allowed");
                d3.select(inputEle._groups[0][0]).style("cursor", "not-allowed");
            }
        }
    }

    D3table.prototype.searchTool = function() {
        var _this = this;

        var searchTool = this.ele.select(".table-toolbar")
                                 .append("div")
                                 .attr("class", "search-tool");
        searchTool.html(
            `<div class='search-box'>
                <input type='text' class='search-input' placeholder="${_this.options.toolbar.placeholderTxt}">
                <i class='icon icon-search'></i>
            </div>`)

        searchTool.select(".search-input").on("keyup", function() {
            if (_this.searchTimer) clearTimeout(_this.searchTimer);
            var value = this.value.trim();
            _this.searchTimer = setTimeout(function() {
                var data = D3table.util.deepClone(_this.data)
                _this.model.currentData.length = 0;
                data.forEach((d, i) => {
                    if( d[_this.options.toolbar.keySearched].indexOf(value)>=0){
                        _this.model.currentData.push(d)
                    }
                })
                _this.tbody(_this.model.currentData,"filter");

            }, 300)
        });
    }

    D3table.prototype.thead = function(theadConfig,options) {

        if(D3table.util.typeChecker.isObject(options)){

            this.options = {
                sort: {
                    able: options.sort?(options.sort.able || false) : false, //sort table's row when click table's head 
                    local: options.sort?(options.sort.local || false) : false,
                    rule: options.sort?(options.sort.rule || null) : null
                },
                scroll: {
                    able: options.scroll ? (options.scroll.able || false) : false, //show scroll 
                    height: options.scroll ? (options.scroll.height || 300) : 300 //container's height
                },
                toolbar: {
                    filterColumn: options.toolbar ? (options.toolbar.filterColumn || []) : [], //filter column
                    columnSearched: options.toolbar ? (options.toolbar.columnSearched || "") : "", //search target column's value
                    keySearched: "", //search target column's value
                    placeholderTxt: options.toolbar ? (options.toolbar.placeholderTxt || "") : ""
                },
                mark: {
                    column: options.mark ? (options.mark.column || []) : [], //mark special column
                    icon: options.mark ? (options.mark.icon || "") : "" //add icon
                },
                clickedColumn: options.clickedColumn || [],
            };            
        }
        this.options.theadConfig = theadConfig;
        this.model.rendedColumn = Object.values(theadConfig)

        this.theadConfigReversed = {};
        for (let name in theadConfig) {
            if (theadConfig.hasOwnProperty(name)) {
                this.theadConfigReversed[theadConfig[name]] = name;
            }
        } 
        this.options.toolbar.keySearched = this.theadConfigReversed[this.options.toolbar.columnSearched];
        var tabelEle = this.ele.select(".table-body"),
            theadEle = tabelEle.selectAll("thead")

        if (theadEle) theadEle.remove();

        var _this = this,
            thead = tabelEle.append("thead"),
            theadTr = thead.append("tr");

        var theadTh = theadTr.selectAll("th")
                            .data(this.model.rendedColumn)
                            .enter()
                            .append("th");

        if (D3table.util.typeChecker.isBoolean(_this.options.sort.able)&&_this.options.sort.able) {

            var theadText = theadTh.append("span")
                                    .attr("class", "thead-text")
                                    .text(d => {
                                        if (_this.model.columnUnselected.indexOf(d) >= 0) return;
                                        return d;
                                    });

            var theadIcon = theadTh.append("i").attr("class", "icon-sort");
            theadTh.on("click", function() {
                var target = d3.event.target;
                if (target.className == "icon-sort" || target.className == "icon-sort-up" || target.className == "icon-sort-down") {
                    
                    var textClicked = d3.select(target.parentNode).select(".thead-text").html(),
                        _data = D3table.util.deepClone(_this.model.currentData),
                        thValue = _this.theadConfigReversed[textClicked],
                        thisIconName = target.className,
                        timeStrand = false,
                        precision=1;

                    theadIcon.attr("class", "icon-sort");
                    target.className = _this.iconTo[thisIconName];
                    if(_this.options.sort.rule&&_this.options.sort.rule[thValue] == "time"){
                        _data.forEach(d=>{
                            var format = D3table.util.fnFormat(d[thValue],D3table.util.parseTimeString(d[thValue]));
                            var timeStampResult = D3table.util.timeStamp(format,D3table.util.parseTimeString(d[thValue]));
                            d[thValue] = timeStampResult.stamp;
                            timeStrand = timeStampResult.strand;
                            precision = timeStampResult.precision;
                        })
                    }

                    if (D3table.util.typeChecker.isBoolean(_this.options.sort.local)&&_this.options.sort.local) {
                        if (_this.iconTo[thisIconName] == "icon-sort-up") {
                            D3table.util.ascendSort(_data, thValue);
                        } else if (_this.iconTo[thisIconName] == "icon-sort-down") {
                            D3table.util.descendSort(_data, thValue);
                        }
                        if(_this.options.sort.rule&&_this.options.sort.rule[thValue] == "time"){

                            _data.forEach(d=>{
                                if(timeStrand){
                                    d[thValue] = D3table.util.timeStrandFormat(d[thValue]);
                                }else{
                                    d[thValue] = D3table.util.timeFormat(d[thValue],precision);
                                }
                            })
                        }
                        _this.tbody(_data,"filter");
                    } else {
                        _this.ele.select(".search-input").property("value", "")
                        if (_this.iconTo[thisIconName] == "icon-sort-up") {
                            _this.model.sort = { type: "ASC", name: thValue }
                        } else if (_this.iconTo[thisIconName] == "icon-sort-down") {
                            _this.model.sort = { type: "DESC", name: thValue }
                        } 
                    }
                }
            })
        }

        return this;
    }

    D3table.prototype.tbody = function(data,type) { //type:input/filter
        var options = this.options,  
            _this = this;

        if(D3table.util.typeChecker.isString(type)){
            if(type=="input"){
                this.data = data ;
                this.model.currentData = D3table.util.deepClone(data)
            }
        }else{
            console.warn("only string is accepted for the type")
        }


        if (data && data.length === 0) {
            this.noData(".table-body");
        } else {
            var outerTbody ,innerTbody,trsUpdate,tdsUpdate,trsEle,tdsEle,
                textedTbodySel = this.ele.select(".table-body .outer-tbody"),
                textedTbody = textedTbodySel.node();

            if(textedTbody){
                outerTbody = textedTbodySel
                innerTbody = this.ele.select(".table-body .inner-tbody")
            }else{
                outerTbody = this.ele.select(".table-body").append("tbody").classed("outer-tbody",true);
                innerTbody = outerTbody.append("tbody").classed("inner-tbody",true);
            }

            this.fixedThead(innerTbody,outerTbody);
            trsUpdate = innerTbody.selectAll("tr").data(data);
            trsEle = trsUpdate.enter().append("tr").merge(trsUpdate)

            trsUpdate.exit().remove();

            tdsUpdate = trsEle.selectAll("td")
                            .data(row => {
                                return Object.keys(options.theadConfig).map(col => {
                                    return { value: row[col], key: col };
                                });
                            })
 

            tdsEle = tdsUpdate.enter().append("td")
                        .merge(tdsUpdate)
                        .attr("class", (d, i) => {
                            var name = "",oMark, oClick,

                            oMark = options.mark.column.length > 0 && options.mark.column.includes(options.theadConfig[d.key]);
                            oClick = options.clickedColumn.length > 0 && options.clickedColumn.includes(options.theadConfig[d.key]);

                            if (oMark && oClick) name = options.mark.icon + " td-clickable";
                            if (!oMark && oClick) name = "td-clickable";
                            if (oMark && !oClick) name = options.mark.icon;
                            return name;
                        }) 
                        .attr("colspan",1)  
                        .text(d=> d.value);
            tdsUpdate.exit().remove();
        }
        if (options.clickedColumn.length) {
            this.getClickedTdText()
        }
        
        return this;
    }

    D3table.prototype.fixedThead = function(innerTbody,outerTbody) {

        var options = this.options;
        if (D3table.util.typeChecker.isBoolean(options.scroll.able)&&options.scroll.able) {
            var theadHeight = this.ele.select(".table-container thead").node().clientHeight,
                toolbarELem = this.ele.select(".table-toolbar").node();

            if (Object.prototype.toString.call(toolbarELem) == "[object HTMLDivElement]") {
                
                var toolbarHeight = toolbarELem.clientHeight;

                outerTbody.style("height", () => {
                    var tbodyHeight = options.scroll.height||300 - theadHeight - toolbarHeight;
                    return tbodyHeight + 1 + "px";
                })
                // setTimeout(function() {
                //     // debugger;
                //     var tbodyHeight_tool = options.scroll.height||300 - theadHeight - toolbarHeight,
                //         trsHeight = innerTbody.node().scrollHeight
                //     if(trsHeight < tbodyHeight_tool){
                //         outerTbody.style("height", "auto")
                //     }
                // },0)                
            } else {
                outerTbody.style("height", options.scroll.height||300 - theadHeight + "px");
            }
        }        
    }

    D3table.prototype.getClickedTdText = function() {
        var _this = this;
        this.ele.select("tbody.inner-tbody").on("click", function(event) {
            var target = d3.event.target;
            if (target.className == "td-clickable") {
                _this.model.clickedText = target.__data__.value;
            }
        })
    }

    D3table.prototype.filterDataByColumn = function(value, bool) {
        var columns = this.options.toolbar.filterColumn,
            rendedColumnName = [],
            model = this.model;

        model.rendedColumn.length = 0;
        model.columnSelected.length = 0;

        var index = model.columnUnselected.indexOf(value);
        //push the column value if columnUnselected not contain it.

        if (index < 0) {
            model.columnUnselected.push(value);
        } else {
            model.columnUnselected.splice(index, 1);
        }

        columns.forEach((d, i) => {
            if (model.columnUnselected.indexOf(d) < 0) {
                model.columnSelected.push(d);
            }
        })
        this.data.forEach((d, i) => {
            model.currentData[i] = {};
            for (let k in d) {
                if (model.columnSelected.indexOf(this.options.theadConfig[k]) >= 0) {
                    model.currentData[i][k] = d[k];
                }
            }
        })

        for (let key in model.currentData[0]) {
            if (model.currentData[0].hasOwnProperty(key)) {
                model.rendedColumn.push(key);
                rendedColumnName.push(this.options.theadConfig[key]);
            }
        }

        this.disabledSearch(rendedColumnName, this.options.toolbar.columnSearched);
    }

    D3table.prototype.disabledSearch = function(column, search) {
        var iptEle = this.ele.select(".search-input");

        if (D3table.util.typeChecker.isString(search)) {

            column.indexOf(search) < 0 ? iptEle.property("disabled", true) : iptEle.property("disabled", false);

        } else if (D3table.util.typeChecker.isArray(search)) {

            var disabled = search.every(d => column.indexOf(d) < 0)
            disabled ? iptEle.property("disabled", true) : iptEle.property("disabled", false);

        } else {
            console.warn("the value of you want to search should be string or array");
        }
    }

    D3table.prototype.noData = function(element) {
        var _this = this,
            trsUpdate = this.ele.select(element + " .inner-tbody").selectAll("tr").data([{tip :"No data to display"}]),
            trsEle = trsUpdate.enter().append("td").merge(trsUpdate);
        trsUpdate.exit().remove();

        var tdsUpdate = trsEle.selectAll("td")
                        .data(["No data to display"])
                         
        tdsUpdate.enter().append("td")
            .merge(tdsUpdate)
            .attr("class", "no-data")
            .attr("colspan",()=>_this.model.rendedColumn.length) 
            .text(d=> d);
        tdsUpdate.exit().remove();
    }

    D3table.util.ascendSort = function (data, key) {
        data.sort((a, b) => {

            if (typeof a[key] != "undefined" && typeof a[key] != "undefined") {
                if (/^((\d+\.?\d*)|(\d*\.\d+))\%$/.test(a[key])) {
                    var A = a[key].substr(0, a[key].length - 1),
                        B = b[key].substr(0, b[key].length - 1);
                    return Number(A) - Number(B);
                } else if ((typeof a[key]) != "number") {
                    return a[key].localeCompare(b[key]);
                } else {
                    return a[key] - b[key];
                }
            }

        });
    }

    D3table.util.descendSort = function (data, key) {
        data.sort((a, b) => {
            if (typeof a[key] != "undefined" && typeof a[key] != "undefined") {
                if (/^((\d+\.?\d*)|(\d*\.\d+))\%$/.test(a[key])) {
                    var A = a[key].substr(0, a[key].length - 1),
                        B = b[key].substr(0, b[key].length - 1);
                    return Number(B) - Number(A);
                } else if ((typeof a[key]) != "number") {
                    return b[key].localeCompare(a[key]);
                } else {
                    return b[key] - a[key];
                }
            }
        });
    }

    D3table.util.deepClone = function (obj) {
      var copy;

      // Handle the 3 simple types, and null or undefined
      if (null == obj || "object" != typeof obj) return obj;

      // Handle Date
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] =  D3table.util.deepClone(obj[i]);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] =  D3table.util.deepClone(obj[attr]);
        }
        return copy;
      }

      throw new Error("Unable to copy obj! Its type isn't supported.");
    }    

    D3table.util.typeChecker = {
        isArray:function(val){
            return Object.prototype.toString.call(val) == "[object Array]"
        },
        isObject:function(val){
            return Object.prototype.toString.call(val) == "[object Object]"
        },
        isString:function(val){
            return Object.prototype.toString.call(val) == "[object String]"
        },
        isNumber:function(val){
            return Object.prototype.toString.call(val) == "[object Number]"
        },
        isDate:function(val){
            return Object.prototype.toString.call(val) == "[object Date]"
        },
        isBoolean:function(val){
            return Object.prototype.toString.call(val) == "[object Boolean]"
        },
        isRegExp:function(val){
            return Object.prototype.toString.call(val) == "[object RegExp]"
        }
    }

    D3table.util.timeFormat = function (data, count) {
        var str = null,
          num = null;
        if (data === 0) {
          num = 0;
          return num.toFixed(count) + " Second"
        } else if (data < 60) {
          num = data;
          str = num > 1 ? num + ' Seconds' : num + ' Second';
          return str;
        } else if (data < 60 * 60) {
          num = data / 60;
          str = num > 1 ? num.toFixed(count) + ' Minutes' : num.toFixed(count) + ' Minute';
          return str;
        } else if (data < 60 * 60 * 24) {
          num = data / (60 * 60);
          str = num > 1 ? num.toFixed(count) + ' Hours' : num.toFixed(count) + ' Hour';
          return str;
        } else {
          num = data / (60 * 60 * 24);
          str = num > 1 ? num.toFixed(count) + ' Days' : num.toFixed(count) + ' Day';
          return str;
        }
    }  

    D3table.util.timeStrandFormat = function (data) {
        if (data !== 0) {
            var result = [],
                yRemainder = data % (12*30*24*60*60),
                monRemainder = data % (30*24*60*60),
                dRemainder = data % (24*60*60),
                hRemainder = data % (60*60),
                mRemainder = data % (60),
                sRemainder = data,

                yearCount = data / (12*30*24*60*60),
                monthCount = data / (30*24*60*60),
                dayCount = data / (24*60*60),
                hourCount = dRemainder / (60*60),
                minuteCount = hRemainder / 60,
                secondCount = mRemainder,

                yearStr = null,
                monthStr = null,
                dayStr = null,
                hourStr = null,
                minuteStr = null,
                secondStr = null;

            yearStr =singular_complex(yearCount, "year");
            monthStr =singular_complex(monthCount, "month");
            dayStr =singular_complex(dayCount, "day");
            hourStr =singular_complex(hourCount, "hour");
            minuteStr =singular_complex(minuteCount, "minute");
            secondStr =singular_complex(secondCount, "second");

            function singular_complex(count, format) {
              var str = null;
              if (count < 1) {
                str = ""
              } else if (count === 1) {
                str = "1 " + format
              } else if (count > 1) {
                str = parseInt(count) + " " + format + "s"
              }
              return str;
            }   

            [yearStr,monthStr,dayStr, hourStr, minuteStr,secondStr].forEach(d => {
              if (d != "") {
                result.push(d);
              }
            })
            return result.join(",");
        } else {
        return "0 minute"
        }
    }

    D3table.util.parseTimeString = function (string){
      if(D3table.util.typeChecker.isString(string)){
          var arr = [],index = 0,curr,pre;
          for(let i = 0,len = string.length;i<len;i++){
              if(i==0){
                curr = Number(string[i]);
                if(curr = curr)arr[index] = ""+curr;
              }else{
                curr = Number(string[i]);
                pre = Number(string[i-1]);
                if(curr == curr&&string[i]!=" "){
                  arr[index] = arr[index]?arr[index]+curr:""+curr;
                }
                if(curr != curr&&pre == pre){
                  index++;
                }
              }     
          }
          return arr;
      }
    }

    D3table.util.fnFormat = function (timeStr,data){
      var result = [],
          formatKey = ["year","month","day","hour","minute","second"],
          bool = false,
          timeForatRegExp = {
            year:/year|years/ig,
            month:/month|months/ig,
            day:/day|days/ig,
            hour:/hour|hours/ig,
            minute:/minute|minutes/ig,
            second:/second|seconds/ig
          },index = 0;
      formatKey.forEach(d=>{
        bool = timeForatRegExp[d].test(timeStr)
        result.push({format:d,bool:bool})
      })
      for(let i =0 ;i<result.length;i++){
        if(!result[i].bool)continue;
        result[i].value = data[index];
        index++;
      }
      return result;
    }

    D3table.util.timeStamp = function (format,arr){
      var countTrue = 0,one_format = "",result = 0,
          o ={
            year:365*24*60*60,
            month:30*24*60*60,
            day:24*60*60,
            hour:60*60,
            minute:60,
            second:1,
          }
      format.forEach(d=>{
        if(d.bool){
          countTrue++;
          one_format = d.format;
        }
      })

      if(countTrue == 1&&arr.length == 2){
        let num = Number(arr[0]+"."+arr[1])
        result = num * o[one_format];

        return {stamp:parseInt(result),strand:false,precision:arr[1].length};
      }else{
        for(let i = 0,len = format.length; i < len ;i++){
          if(!format[i].bool)continue;
          result +=Number(format[i].value)*o[format[i].format]
        }
        return {stamp:result,strand:true};
      }

    }
    return function(ele, options) {
        return new D3table(ele, options).init();
        // return new D3table(ele, options, data).init();
    }
})();

export default D3table
