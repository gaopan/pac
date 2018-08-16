import CommonGenerators from '@/utils/common-generators.js'
import DynamicFilterApi from '@/api/process-mining.js'
import TypeChecker from "@/utils/type-checker.js"
import DfUtils from "../../dynamic-filter-utils.js"
import * as d3 from "d3"
import * as d3BI from '@/lib/d3-bi/index.js'
import Pagging from '@/components/Paginator/Paginator.vue'
import NotyOperation from '@/utils/noty-operation.js'
import commonUtils from '@/utils/common-utils.js';
import Internationalization from '@/utils/internationalization.js'

import shared from "@/shared.js";
let eventHub = shared.eventHub;

export default {
  name: 'variants',
  props: ['localSectionFilter', 'filterDetailData'],
  components: {
    Pagging
  },  
  data() {
    return {
      DFContainerElem:null,
      chartContainerEle:null,
      chartElem:null,
      loadId: null,
      currentPage: 0,
      pageSize: 40, //the size of each table
      pageTotal: 0, //data's total

      
      totalCaseCount: 0, //case total of all variant
      searchVariantIpt: null, //the value of in search input
      searching:false,
      filteredVariants: [],
      currentPageVariants: [],
      allFilterNames: [],
      twoDimensionalTableData: [],
      oneDimensionalTableData: [],
      oneDimensionalTableData_Changed:[],
      chartData: [],
      paginatorData: [],

      tableTheadConfig: 
      [
        {
          name: "分支路径",
          class: "icon-sort",
          selected: false
        }, {
          name: "实例",
          class: "icon-sort"
        }, {
          name: "事件",
          class: "icon-sort"
        }, {
          name: "持续时间中值",
          class: "icon-sort"
        }, {
          name: "平均持续时间",
          class: "icon-sort"
        }, {
          name: "最小持续时间",
          class: "icon-sort"
        }, {
          name: "最大持续时间",
          class: "icon-sort"
        }
      ],
      theadNameConfig: {
        "分支路径": "variantIndex",
        "实例": "cases",
        "事件": "events",
        "持续时间中值": "medianDurationNum",
        "平均持续时间": "averageDurationNum",
        "最小持续时间": "minimumDurationNum",
        "最大持续时间": "maximumDurationNum"
      },
      windowResizedTimer: null
    }
  },
  computed: {
    showPaggination: function() {
      //24 Jan 2018: adib.ghazali@hpe.com - hide pagination when data list is less than the size of each table
      return (this.pageTotal > this.pageSize) ? true: false;
    }
  },
  methods: {
    onSelectBar(bar) {
      bar.selected = !bar.selected;
      //toggle the color of bar , table's row and checkbox
      for(let j =0; j<this.twoDimensionalTableData[this.currentPage].length;j++){
        if(this.twoDimensionalTableData[this.currentPage][j].variantId == bar.variantId){
          this.twoDimensionalTableData[this.currentPage][j].selected = bar.selected;
          break;
        }
      } 
      for(let i= 0;i < this.oneDimensionalTableData.length;i++){
          if(this.oneDimensionalTableData[i].variantId == bar.variantId)this.oneDimensionalTableData[i].selected = bar.selected;
          break;
      }

      this.updateFilterValue(bar.variantId, bar.selected)

      this.toggleSelectAllVariant()
      this.initChart(this.chartData,this.barChartRule);
    },

    searchVariants(inputValue) {
      this.currentPage = 0;
      this.tableTheadConfig.forEach(d => {
        d.class = "icon-sort";
      })

      if (inputValue == "") {
        this.searching = false;
        this.twoDimensionalTableData = this.makePaginatorData(this.oneDimensionalTableData, this.pageSize);
        this.pageTotal = this.oneDimensionalTableData.length;

        this.oneDimensionalTableData_Changed = [];
      } else {
        this.searching = true;
        //get a new oneDimensionalTableData after search
        this.oneDimensionalTableData_Changed = searchInput("variantId", inputValue, this.oneDimensionalTableData);
        this.pageTotal = this.oneDimensionalTableData_Changed.length;

        this.twoDimensionalTableData = this.makePaginatorData(this.oneDimensionalTableData_Changed, this.pageSize);
      }

      this.currentPageVariants = this.getVaiantsNameCurrentPage(this.twoDimensionalTableData[0], "variantId")

      //update the chart according to new filtered data
      this.chartData = this.makeChartFormatData(this.twoDimensionalTableData[0], this.totalCaseCount);
      this.initChart(this.chartData,this.barChartRule);

      //change the style of table head checkbox 
      if (TypeChecker.isArray(this.twoDimensionalTableData) && TypeChecker.isArray(this.twoDimensionalTableData[0])) {
        
        this.tableTheadConfig[0].selected = this.twoDimensionalTableData[0].every(d => {
          return d.selected;
        })

      } else {
        this.tableTheadConfig[0].selected = false;
        console.error("no data in twoDimensionalTableData")
      }

      function searchInput(searchedKey, inputValue, originalData) {
        let targetData = [];
        originalData.forEach(d => {
          if (d[searchedKey].trim().toLowerCase().indexOf(inputValue.trim().toLowerCase()) >= 0) {
            targetData.push(d);
          }
        })
        return targetData;
      }
    },

    sortVariantTableData(config) {

      let iconChangeTo={
        "icon-sort":"icon-sort-up",
        "icon-sort-up": "icon-sort-down",
        "icon-sort-down": "icon-sort-up"
      }
      let toIcon = iconChangeTo[config.class];

      toggleOtherTheadCellIcon(config.name, this.tableTheadConfig, toIcon)
      
      if(toIcon == "icon-sort-down"){
        commonUtils.ascendSort_ObjectsInArray(this.twoDimensionalTableData[this.currentPage], this.theadNameConfig[config.name])        
      }else if(toIcon == "icon-sort-up"){
        commonUtils.descendSort_ObjectsInArray(this.twoDimensionalTableData[this.currentPage], this.theadNameConfig[config.name])
      }

      this.chartData = this.makeChartFormatData(this.twoDimensionalTableData[this.currentPage], this.totalCaseCount);
      this.initChart(this.chartData,this.barChartRule);

      function toggleOtherTheadCellIcon(name, thNames, icon) {
        for (let i = 0; i < thNames.length; i++) {
          thNames[i].class = "icon-sort"
          if (thNames[i].name == name)thNames[i].class = icon;
        }
      }    
    },

    selectAllVariants(bool) {

      this.tableTheadConfig[0].selected = bool
      if(this.twoDimensionalTableData[this.currentPage].length>0){
        this.twoDimensionalTableData[this.currentPage].forEach((d, i) => {
          this.oneDimensionalTableData[d.variantIndex - 1].selected=bool;
        })
        this.updateFilterValue(this.currentPageVariants, bool)

        this.chartData.forEach(d=>{
          d.selected=bool;
        })
        this.initChart(this.chartData,this.barChartRule);
      }
    },

    selectVariant(data, index) {
      let bool = data.selected = !data.selected;
      this.updateFilterValue(data.variantId, bool)

      for(let i = 0;i<this.chartData.length;i++){
        if(this.chartData[i].variantId == data.variantId){
          this.chartData[i].selected = bool;
          break;
        }
      }
      for(let i= 0;i < this.oneDimensionalTableData.length;i++){
          if(this.oneDimensionalTableData[i].variantId == data.variantId)this.oneDimensionalTableData[i].selected = data.selected;
          break;
      }
      
      this.toggleSelectAllVariant();
      // this.chartData[index].selected= bool;
      this.initChart(this.chartData,this.barChartRule);
    },

    pageHandler(index) {
      this.currentPage = index - 1;
      this.tableTheadConfig.forEach(d => {
        d.class = "icon-sort";
      })

      this.currentPageVariants = this.getVaiantsNameCurrentPage(this.twoDimensionalTableData[this.currentPage], "variantId")

      this.chartData = this.makeChartFormatData(this.twoDimensionalTableData[this.currentPage], this.totalCaseCount);
      this.initChart(this.chartData,this.barChartRule);

      this.toggleSelectAllVariant();
    },
    updatePageSize(size){
      this.currentPage = 0;
      this.pageSize = size;

      this.tableTheadConfig.forEach(d => {
        d.class = "icon-sort";
      })
      //if searching the variants ,use the filtered data,or use complete data.  
      this.twoDimensionalTableData = this.makePaginatorData(this.searching?this.oneDimensionalTableData_Changed:this.oneDimensionalTableData, this.pageSize);      
      this.currentPageVariants = this.getVaiantsNameCurrentPage(this.twoDimensionalTableData[0], "variantId")

      this.chartData = this.makeChartFormatData(this.twoDimensionalTableData[0], this.totalCaseCount);
      this.initChart(this.chartData,this.barChartRule);
      this.toggleSelectAllVariant();
    },

    setTooltip(chartRule) {
      chartRule.tooltip.privateClass('df-variant-chart-tooltip');
      chartRule.tooltipDispatch.on('click.active', (args, ele, config)=>{
        this.onSelectBar(args.data);
      });

      chartRule.tooltip.setContent((args) => {
        let str = '',
            xValue = args.yValues[0].data.x,
            yValue = args.yValues[0].data.y,
            arrValues = args.yValues[0].config.values,
            bar = null;

        arrValues.find(value => {
          if (value.name == xValue)bar = value;
        });

        str = ` <h6 class="title">${bar.name}</h6>
                <p>
                    <span class="data">${Internationalization.translate('Percentage')}: </span>
                    <span class="value">${bar.percentage} %</span>
                </p>
                <p>
                    <span class="data">${Internationalization.translate('Number of Cases')}: </span>
                    <span class="value">${bar.cases}</span>
                </p>
              `
        return `<div class="variants-hover-box">${str}</div>`;
      });
    },
    initChart(chartData,chartRule) {
        var width = this.$refs.variantsContainer.clientWidth,
            height = parseInt((this.DFContainer.node().clientHeight-35) *0.36);

      if(this.chartContainerEle){
        if (this.chartElem) {
          this.chartContainerEle.select('svg')
            .attr("height", height +'px')
            .attr("width",  width+'px')
            .datum([{values: chartData}])
            .call(chartRule);
        } else {
          this.chartElem = this.chartContainerEle
            .append('svg')
            .attr("height", height +'px')
            .attr("width", width +'px')          
            .datum([{values: chartData}])
            .call(chartRule);
        }             
      }
    },

    getChartRule(){
      var barChartRule = d3BI.baseChart('bar')
                              .x(d => d.name)
                              .y(d => d.percentage)
                              .margin({ top: 20, right: 20, left: 25, bottom: 20 });

      barChartRule.bar.fnColorWrapper((h, d, config)=>{
        return (d.data.selected) ? '#00C9FF' : '#C7CBD5';;
      });
      barChartRule.axisLines.showAll({ x: true, y: false });
      barChartRule.axisLines.pattern({ x: true, y: true });
      barChartRule.yAxis.givenDomain(transformDomain);
      barChartRule.yAxis.title(Internationalization.translate("Case Percentage") + " %");
      barChartRule.xAxis.title(Internationalization.translate("Variants"));
      barChartRule.yAxis.axis().ticks(7);
      barChartRule.xAxis.textRotate(-15);  

      function transformDomain(domain) {
        domain[1] = 1.5 * domain[1];
        if (domain[0] > 0) domain[0] = 0;
        return domain;
      }

      return barChartRule;    
    },

    toggleSelectAllVariant() {
      let allSelected = this.twoDimensionalTableData[this.currentPage].every(d => {
        return d.selected;
      })
      this.tableTheadConfig[0].selected = allSelected;
    },

    updateFilterValue(val, bool) {
      //This is function to add the filter value to global data model
      //05-10-2017 - Azhaziq: Tansform Selected Data to fit global data model
      //15-12-2017 - Azhaziq: change the 'Variants' -> 'variant'
      //Set data model
      let dtModel = DfUtils.getDataModel('variant');
      dtModel.value = {
        exclude: [],
        include: []
      };
      //Create mapping algorithm to fit your own data model to global data model
      if (TypeChecker.isArray(val)) {
        if (bool) {
          val.forEach(d => {
            if (!this.filteredVariants.includes(d)) this.filteredVariants.push(d)
          })
        } else {
          val.forEach(d => {
            if (this.filteredVariants.includes(d))deleteArrayItem(this.filteredVariants, d)
          })
        }
      } else {
        if (bool) {
          if (!this.filteredVariants.includes(val)) this.filteredVariants.push(val);
        } else {
          if (this.filteredVariants.includes(val)) deleteArrayItem(this.filteredVariants, val);
        }
      }

      this.filteredVariants = [...new Set(this.filteredVariants)];

      this.allFilterNames.forEach(d => {
        if (this.filteredVariants.includes(d)) dtModel.value.include.push(d);
      })
      // console.log(dtModel.value.include)

      eventHub.$emit('updateFilterValue', dtModel);
      // localSectionFilter.filterType 
      function deleteArrayItem(arr, value) {
        var deletedItem = null;
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] == value) {
            deletedItem = i;
            break;
          }
        }
        arr.splice(deletedItem, 1);
      }
    },

    getVaiantsNameCurrentPage(data, key) {
      var result = [];
      data.forEach(d => {
        result.push(d[key]);
      })
      return result;
    },

    calculateContainer() {
      if(this.DFContainer){
        var containerHeight = parseInt(this.DFContainer.style("height")) - 35,
            containerwidth = parseInt(this.DFContainer.style("width"));

        // var variantsContainer = d3.select(".variants");
        // variantsContainer.style("height", containerHeight + "px")
        // variantsContainer.style("width", containerwidth + "px");
        // d3.select(".variants-table-container tbody").style("height", (this.$refs.variantsTableContainer.clientHeight - 70) + "px");
        this.$refs.variantsContainer.style.height = containerHeight + "px";
        this.$refs.variantsContainer.style.width = containerwidth + "px";
        this.$refs.variantsTbodyContainer.style.height = (this.$refs.variantsTableContainer.clientHeight - 70) + "px";
      }
    },

    makeTableFormateData(data) {
      var result = [],
          totalCaseCount = 0,
          filterNamesIncluded = this.$props.localSectionFilter.value.include;

      data.forEach((d, i) => {
        result.push({});
        result[i].selected = filterNamesIncluded.indexOf(d.attributeValue) >= 0;

        result[i].variantIndex = Number(d.attributeValue);
        result[i].variantId = d.attributeValue;
        result[i].cases = Number(d.frequency);
        totalCaseCount += Number(d.frequency);

        result[i].events = d.activities;
        result[i].medianDuration = timeFormat(d.medianDuration, 2);
        result[i].averageDuration = timeFormat(d.averageDuration, 2);
        result[i].minimumDuration = timeFormat(d.minimumDuration, 2);
        result[i].maximumDuration = timeFormat(d.maximumDuration, 2);
        result[i].medianDurationNum = d.medianDuration;
        result[i].averageDurationNum = d.averageDuration;
        result[i].minimumDurationNum = d.minimumDuration;
        result[i].maximumDurationNum = d.maximumDuration;
      })
      function timeFormat(data, count) {
        var str = null,
            num = null;
        if (data === 0) {
          num = 0;
          return num.toFixed(count) + Internationalization.translate(" Second")
        } else if (data < 60) {
          num = data;
          str = num > 1 ? num + Internationalization.translate(' Seconds') : num + Internationalization.translate(' Second');
          return str;
        } else if (data < 60 * 60) {
          num = data / 60;
          str = num > 1 ? num.toFixed(count) + Internationalization.translate(' Minutes') : num.toFixed(count) + Internationalization.translate(' Minute');
          return str;
        } else if (data < 60 * 60 * 24) {
          num = data / (60 * 60);
          str = num > 1 ? num.toFixed(count) + Internationalization.translate(' Hours') : num.toFixed(count) + Internationalization.translate(' Hour');
          return str;
        } else {
          num = data / (60 * 60 * 24);
          str = num > 1 ? num.toFixed(count) + Internationalization.translate(' Days') : num.toFixed(count) + Internationalization.translate(' Day');
          return str;
        }
      }
      return {
        tableData: result,
        totalCaseCount: totalCaseCount
      };
    },

    makeChartFormatData(data, totalCaseCount) {
      var result = [];
      if (TypeChecker.isArray(data)) {
        data.forEach((d, i) => {
          result.push({});
          result[i].name = Internationalization.translate("variant") + d.variantId;
          result[i].cases = d.cases;
          result[i].percentage = ((d.cases / totalCaseCount) * 100).toFixed(4);
          result[i].selected = d.selected;
          result[i].variantId = d.variantId;
        })
      } else {
        console.error("no table data or table's data is not a array")
      }
      return result;
    },

    makePaginatorData(data, arrCount) {
      var result = [];
      for (let i = 0; i < data.length; i++) {
        if (i === 0 || result[result.length - 1].length === arrCount) {
          result.push([]);
          (result[result.length - 1]).push(data[i])
        } else {
          result[result.length - 1].push(data[i])
        }
      }
      return result;
    },

    windowResized() {    
      if (this.windowResizedTimer) clearTimeout(this.windowResizedTimer);
      this.windowResizedTimer = setTimeout(() => {
        this.calculateContainer();
        this.initChart(this.chartData,this.barChartRule);
      }, 300)            
    },

    getDynamicFilter_Variant(processAnalyticsId) {
      if(!this.$props.filterDetailData){        
        eventHub.$emit("start-mini-loader", { id: this.loadId });
        DynamicFilterApi.getVariantsData(this.$store.getters.processSelection.customerId, processAnalyticsId).then(res => {
          
          eventHub.$emit("finish-mini-loader", { id: this.loadId });
          this.$emit('variantsFDChange',{name:'variants', value:res.data})
          dataGenerator(res.data,this);

        }, err => {
          eventHub.$emit("finish-mini-loader", { id: this.loadId });
          NotyOperation.notifyError({ text: 'Get dynamic filter error.' });
        })
      }else{
          dataGenerator(commonUtils.deepClone(this.$props.filterDetailData),this)
      }
      function dataGenerator(data,vm){
          data.list.forEach(d => {
            vm.allFilterNames.push(d.attributeValue)
          })

          var tableFormData = vm.makeTableFormateData(data.list);

          vm.oneDimensionalTableData = tableFormData.tableData; //deep copy for search function
          vm.pageTotal = tableFormData.tableData.length;
          vm.totalCaseCount = tableFormData.totalCaseCount;

          commonUtils.ascendSort_ObjectsInArray(vm.oneDimensionalTableData, "variantIndex");

          vm.twoDimensionalTableData = vm.makePaginatorData(vm.oneDimensionalTableData, vm.pageSize);
          //all variant names in current page
          vm.currentPageVariants = vm.getVaiantsNameCurrentPage(vm.twoDimensionalTableData[0], "variantId")

          //make data and dispaly the chart
          vm.chartData = vm.makeChartFormatData(vm.twoDimensionalTableData[0], vm.totalCaseCount);
          vm.initChart(vm.chartData,vm.barChartRule);        
      }      
    }
  },
  created() {
    if(window.addEventListener){
      window.addEventListener('resize', this.windowResized);
    }else{
      window.attachEvent('resize', this.windowResized);
    }

    this.loadId = CommonGenerators.UUIDGenerator.purchase();

    setTimeout(() => {
      this.filteredVariants = this.$props.localSectionFilter.value.include;
    }, 0)
  },
  mounted() {

    this.chartContainerEle = d3.select(this.$refs.variantsChartContainer);
    this.DFContainer = d3.select(".dynamic-filter-details-container");

    this.barChartRule = this.getChartRule();
    this.setTooltip(this.barChartRule);
    this.getDynamicFilter_Variant(this.$store.getters.processSelection.processAnalyticsId)
    this.calculateContainer();
  },

  beforeDestroy(){
    if(window.removeEventListener){
      window.removeEventListener('resize', this.windowResized);
    }else{
      window.detachEvent('resize', this.windowResized);
    }

    this.DFContainer = this.chartElem = this.chartContainerEle = this.barChartRule = null;
  }
}
