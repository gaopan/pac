import * as d3 from 'd3'
import * as d3BI from '@/lib/d3-bi/index.js'
import shared from '@/shared.js'
import TempDurationData from './duration.json'
import DfUtils from "../../dynamic-filter-utils.js"
import NotyOperation from '@/utils/noty-operation.js'
import TypeChecker from '@/utils/type-checker.js'
import DynamicFilterApi from '@/api/process-mining.js'
import CommonUtils from '@/utils/common-utils.js'
import CommonGenerators from '@/utils/common-generators.js'
import leapSelect from '@/components/leap-select/LEAPSelect.vue'
import Internationalization from '@/utils/internationalization.js'

let eventHub = shared.eventHub;
let UUIDGenerator = CommonGenerators.UUIDGenerator;

export default {
  name: 'df-duration',
  props: ['localSectionFilter', 'filterDetailData'],
  data() {
    return {
      loadingId: UUIDGenerator.purchase(),

      durationData: [],
      selectList: [],
      minDurationConf: {},
      maxDurationConf: {}
    };
  },
  computed: {
    casePercent() {
      let resCases = 0;
      let curMinDur = this.transformTimeToSeconds(this.minDurationConf);
      let curMaxDur = this.transformTimeToSeconds(this.maxDurationConf);

      if (!this.durationData.length) return '0%';
      if (this.extentLineX[1] === this.extentLineX[0]) return '100%';

      let minIndex = 0, maxIndex = 0;
      for (let i=0; i< this.durationData.length; i++) {
        if (curMinDur <= this.durationData[i].durationUpperRange) {
          minIndex = i;
          for (; i< this.durationData.length; i++) {
            if (curMaxDur <= this.durationData[i].durationUpperRange) {
              maxIndex = i;
              break;
            }
            if (i === this.durationData.length-1) {
              maxIndex = i;
              break;
            }
          }
          break;
        }
      }

      if (minIndex === maxIndex) {
        if (curMinDur === curMaxDur) {
          resCases = 0;
        } else {
          resCases = (curMaxDur - curMinDur) / (this.durationData[minIndex].durationUpperRange - this.durationData[minIndex].durationLowerRange) * this.durationData[minIndex].cases;
        }
      } else {
        for (let i=minIndex; i<= maxIndex; i++) {
          if (i === minIndex) {
            resCases +=  (this.durationData[i].durationUpperRange - curMinDur) / (this.durationData[i].durationUpperRange - this.durationData[i].durationLowerRange) * this.durationData[i].cases;
          } else if (i === maxIndex) {
            resCases +=  (curMaxDur - this.durationData[i].durationLowerRange) / (this.durationData[i].durationUpperRange - this.durationData[i].durationLowerRange) * this.durationData[i].cases;
          } else {
            resCases += this.durationData[i].cases;
          }
        }
      }

      if (resCases < 0) {
        resCases = 0;
      } else if (resCases > this.totalDurCases) {
        resCases = this.totalDurCases;
      }

      return (Math.floor(resCases/this.totalDurCases*10000)/100).toFixed(2) + '%';
    }
  },
  created() {
    let vm = this;

    this.selectList = getSelectList();
    this.minDurationConf = getDurationConf();
    this.maxDurationConf = getDurationConf();

    this.totalDurCases = 0;

    this.lineData = null;
    this.extentLineX = null;
    this.extentLineY = null;

    this.lineChart = null;
    this.hLineChart = null;

    this.draggedRuler = null;
    this.hDraggedRuler = null;

    window.addEventListener('resize', this.windowResize);

    function getSelectList() {
      return [{
        name: Internationalization.translate('Seconds'),
        value: 'Seconds'
      }, {
        name: Internationalization.translate('Minutes'),
        value: 'Minutes'
      }, {
        name: Internationalization.translate('Hours'),
        value: 'Hours'
      }, {
        name: Internationalization.translate('Days'),
        value: 'Days'
      }, {
        name: Internationalization.translate('Weeks'),
        value: 'Weeks'
      }, {
        name: Internationalization.translate('Years'),
        value: 'Years'
      }];
    }
    function getDurationConf() {
      return {
        num: 0,
        unit: 'Seconds',
        model: {
          num: 0,
          unit: 'Seconds',
        }
      };
    }
  },
  mounted() {
    this.initChart();
    this.hLineChart = d3.select(this.$refs['df-duration']).select('.line-chart').select('.chart');
    this.hDraggedRuler = d3.select(this.$refs['df-duration']).select('.dragged-ruler').select('.chart');

    this.drawChart();
    this.requestData();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.windowResize);
  },
  methods: {
    requestData() {
      if (TypeChecker.isArray(this.$props.filterDetailData) && this.$props.filterDetailData.length) {
        dealWithData.call(this, this.$props.filterDetailData);
      } else {
        eventHub.$emit("start-mini-loader", { id: this.loadingId });
        DynamicFilterApi.getDurationData(this.$store.getters.processSelection.customerId, this.$store.getters.processSelection.processAnalyticsId)
        .then((res)=>{
          // res.data.list = TempDurationData;
          this.$emit('durationFDChange', {
            name: 'duration',
            value: TypeChecker.isArray(res.data.list) ? CommonUtils.deepClone(res.data.list) : []
          });
          dealWithData.call(this, res.data.list);
          eventHub.$emit("finish-mini-loader", { id: this.loadingId });
        }, ()=>{
          eventHub.$emit("finish-mini-loader", { id: this.loadingId });
          NotyOperation.notifyError({text: 'Get dynamic filter error.'});
        });
      }

      function dealWithData(dataList) {
        this.totalDurCases = 0;
        this.durationData = TypeChecker.isArray(dataList) ? dataList : [];

        this.durationData.forEach((d)=>{
          d.cases = +d.cases;
          d.durationLowerRange = +d.durationLowerRange;
          d.durationUpperRange = +d.durationUpperRange;

          this.totalDurCases += d.cases;
        });

        let minDurC = null,
          maxDurC = null,
          curMinValue = undefined,
          curMaxValue = undefined;
          
        if (TypeChecker.isObject(this.localSectionFilter.value)) {
          curMinValue = this.localSectionFilter.value.hasOwnProperty('min') ? this.localSectionFilter.value.min : undefined;
          curMaxValue = this.localSectionFilter.value.hasOwnProperty('max') ? this.localSectionFilter.value.max : undefined;
        }

        if (curMinValue === undefined) {
          minDurC = this.findSuitUnit({num: this.durationData[0].durationLowerRange, unit: 'Seconds'});
        } else {
          if (curMinValue < this.durationData[0].durationLowerRange) {
            minDurC = this.findSuitUnit({num: this.durationData[0].durationLowerRange, unit: 'Seconds'});
          } else {
            minDurC = this.findSuitUnit({num: curMinValue, unit: 'Seconds'});
          }
        }
        if (curMaxValue === undefined) {
          maxDurC = this.findSuitUnit({num: this.durationData[this.durationData.length-1].durationUpperRange, unit: 'Seconds'});
        } else {
          if (curMaxValue > this.durationData[this.durationData.length-1].durationUpperRange) {
            maxDurC = this.findSuitUnit({num: this.durationData[this.durationData.length-1].durationUpperRange, unit: 'Seconds'});
          } else {
            maxDurC = this.findSuitUnit({num: curMaxValue, unit: 'Seconds'});
          }
        }

        this.minDurationConf = {
          num: this.formatNum(minDurC, true),
          unit: minDurC.unit,
          model: {
            num: this.formatNum(minDurC, true),
            unit: minDurC.unit,
          }
        };
        this.maxDurationConf = {
          num: this.formatNum(maxDurC, false),
          unit: maxDurC.unit,
          model: {
            num: this.formatNum(maxDurC, false),
            unit: maxDurC.unit,
          }
        };

        this.updateFilterValue();
        this.drawChart();
      }
    },
    initChart() {
      let vm = this;

      this.lineChart = d3BI.baseChart();
      this.draggedRuler = d3BI.draggedRuler();

      this.lineChart.duration(0).margin({top: 10, right: 45, bottom: 0, left: 0});
      this.lineChart.legend.visibility(false);
      this.lineChart.yAxis.axis().ticks(5);
      this.lineChart.yAxis.title('Number of cases').domainToZero(true).packetAxis((hC)=>{
        if (this.lineChart.hasOwnProperty('yAxisPosition')) {
          let axisPosition = this.lineChart.yAxisPosition;
          hC.attr('transform', 'translate('+ axisPosition.x +','+ (axisPosition.y-5) +')');
        }
      });
      this.lineChart.xAxis.scale(d3.scaleLinear()).axisVisibility(false);
      this.lineChart.line.curve(d3.curveStepAfter);
      this.lineChart.lineTooltip.visibility(false);

      this.draggedRuler.mainLine.leftText(['Short', 'cases']).rightText(['Long', 'cases']);
      this.draggedRuler.dispatch.on('dragging', function(per, type){
        if (type == 'pre') {
          vm.lineData[1].values[0].label = (vm.extentLineX[1] - vm.extentLineX[0]) * per + vm.extentLineX[0];

          vm.minDurationConf.num = vm.transformSecondsToTime({
            num: vm.lineData[1].values[0].label,
            unit: vm.minDurationConf.unit
          });
          vm.minDurationConf.num = vm.formatNum(vm.minDurationConf, true);
          vm.minDurationConf.model.num = vm.minDurationConf.num
          vm.minDurationConf.model.unit = vm.minDurationConf.unit;
        } else {
          vm.lineData[1].values[1].label = (vm.extentLineX[1] - vm.extentLineX[0]) * per + vm.extentLineX[0];
          vm.maxDurationConf.num = vm.transformSecondsToTime({
            num: vm.lineData[1].values[1].label,
            unit: vm.maxDurationConf.unit
          });
          vm.maxDurationConf.num = vm.formatNum(vm.maxDurationConf, false);
          vm.maxDurationConf.model.num = vm.maxDurationConf.num
          vm.maxDurationConf.model.unit = vm.maxDurationConf.unit;
        }

        vm.hLineChart.iappend('svg.chart').datum(vm.lineData).call(vm.lineChart);
        
        vm.updateFilterValue();
      });
    },
    drawChart() {
      if (!this.durationData.length) {
        this.hLineChart.iappend('svg.chart').datum([]).call(this.lineChart);
        return ;
      }

      let durationData = this.durationData;
      let draggedConf = {
        min: this.transformTimeToSeconds(this.minDurationConf),
        max: this.transformTimeToSeconds(this.maxDurationConf)
      };

      this.lineData = getLineData();
      this.extentLineX = d3.extent(this.lineData[0].values.map(function(d){return d.label}));
      this.extentLineY = d3.extent(this.lineData[0].values.map(function(d){return d.value}));

      this.lineData[1].values = [
        {
          label: draggedConf.min,
          value: this.extentLineY[1]
        },
        {
          label: draggedConf.max,
          value: this.extentLineY[1]
        }
      ];

      this.hLineChart.iappend('svg.chart').datum(this.lineData).call(this.lineChart);

      let middleNum = this.extentLineX[1] === this.extentLineX[0] ? 0.5 : undefined;
      this.draggedRuler
        .disabledDrag(middleNum ? true : false)
        .distance({
          left: this.lineChart.xAxisPosition.x,
          right: this.lineChart.width - (this.lineChart.xAxisPosition.x + this.lineChart.xAxisWidth)
        })
        .sitePercentage({
          pre: middleNum || (draggedConf.min - this.extentLineX[0]) / (this.extentLineX[1] - this.extentLineX[0]),
          lat: middleNum || (draggedConf.max - this.extentLineX[0]) / (this.extentLineX[1] - this.extentLineX[0])
        });

      this.hDraggedRuler.iappend('svg.chart').call(this.draggedRuler);

      function getLineData() {
        let bgValues = [], selectedValues = [];

        if (durationData.length === 1) {
          bgValues.push({
            label: durationData[0].durationLowerRange,
            value: durationData[0].cases
          });
          bgValues.push({
            label: durationData[0].durationUpperRange,
            value: durationData[0].cases
          });
        } else {
          for (let i=0; i<= durationData.length; i++) {
            bgValues.push({
              label: i === durationData.length ? durationData[i-1].durationUpperRange : durationData[i].durationLowerRange,
              value: durationData[i] ? durationData[i].cases : 0
            });
          }
        }
        return [{
          type: 'line',
          name: 'bg area',
          area: true,
          color: '#5F6B6D',
          values: bgValues
        }, {
          type: 'line',
          name: 'selected area',
          area: true,
          color: '#01B8AA',
          values: []
        }];
      }
    },
    changedUnit(type, args) {
      let vm = this;

      if (type == 'min') {
        this.minDurationConf.model.unit = args.value;
        changedUnit(this.minDurationConf, true);
      } else {
        this.maxDurationConf.model.unit = args.value;
        changedUnit(this.maxDurationConf, false);
      }

      function changedUnit(data, isUp) {
        data.model.num = vm.transformSecondsToTime({
          num: vm.transformTimeToSeconds({num: data.num, unit: data.unit}),
          unit: data.model.unit
        });
        data.model.num = vm.formatNum(data.model, isUp);
      }
    },
    setDurationValue(type) {
      let minDurData = this.extentLineX[0];
      let maxDurData = this.extentLineX[1];

      if (type == 'min') {
        this.minDurationConf.model.num = +this.minDurationConf.model.num;

        let newSeconds = this.transformTimeToSeconds(this.minDurationConf.model);
        let rightSeconds = this.transformTimeToSeconds(this.maxDurationConf.model);
        
        if (newSeconds < minDurData) {
          this.minDurationConf.model.num = this.transformSecondsToTime({
            num: minDurData,
            unit: this.minDurationConf.model.unit
          });
        } else if (newSeconds > rightSeconds) {
          this.minDurationConf.model.num = this.transformSecondsToTime({
            num: rightSeconds,
            unit: this.minDurationConf.model.unit
          });
        }

        this.minDurationConf.model.num = this.formatNum(this.minDurationConf.model, true);
        this.minDurationConf.num = this.minDurationConf.model.num;
        this.minDurationConf.unit = this.minDurationConf.model.unit;
      } else {
        this.maxDurationConf.model.num = +this.maxDurationConf.model.num;

        let newSeconds = this.transformTimeToSeconds(this.maxDurationConf.model);
        let leftSeconds = this.transformTimeToSeconds(this.minDurationConf.model);

        if (newSeconds > maxDurData) {
          this.maxDurationConf.model.num = this.transformSecondsToTime({
            num: maxDurData,
            unit: this.maxDurationConf.model.unit
          });
        } else if (newSeconds < leftSeconds) {
          this.maxDurationConf.model.num = this.transformSecondsToTime({
            num: leftSeconds,
            unit: this.maxDurationConf.model.unit
          });
        }

        this.maxDurationConf.model.num = this.formatNum(this.maxDurationConf.model, false);
        this.maxDurationConf.num = this.maxDurationConf.model.num;
        this.maxDurationConf.unit = this.maxDurationConf.model.unit;
      }

      this.updateFilterValue();
      
      if (this.extentLineX[1] === this.extentLineX[0]) return ;

      let draggedConf = {
        min: this.transformTimeToSeconds(this.minDurationConf),
        max: this.transformTimeToSeconds(this.maxDurationConf)
      };

      this.lineData[1].values = [
        {
          label: draggedConf.min,
          value: this.extentLineY[1]
        },
        {
          label: draggedConf.max,
          value: this.extentLineY[1]
        }
      ];
      this.hLineChart.iappend('svg.chart').datum(this.lineData).call(this.lineChart);

      let middleNum = this.extentLineX[1] === this.extentLineX[0] ? 0.5 : undefined;
      this.draggedRuler
        .disabledDrag(middleNum ? true : false)
        .sitePercentage({
          pre: middleNum || (draggedConf.min - this.extentLineX[0]) / (this.extentLineX[1] - this.extentLineX[0]),
          lat: middleNum || (draggedConf.max - this.extentLineX[0]) / (this.extentLineX[1] - this.extentLineX[0])
        });
      this.hDraggedRuler.iappend('svg.chart').call(this.draggedRuler);
    },
    transformTimeToSeconds(config) {
      let res = 0,
        num = config.num,
        unit = config.unit;

      switch(unit) {
        case 'Millis':
          res = num / 1000;
        break;

        case 'Seconds':
          res = num;
        break;

        case 'Minutes':
          res = num * 60;
        break;

        case 'Hours':
          res = num * 60 * 60;
        break;

        case 'Days':
          res = num * 60 * 60 * 24;
        break;

        case 'Weeks':
          res = num * 60 * 60 * 24 * 7;
        break;

        case 'Years':
          res = num * 60 * 60 * 24 * 365;
        break;
      }

      return res;
    },
    transformSecondsToTime(config) {
      let res = 0,
        num = config.num,
        unit = config.unit;

      switch(unit) {
        case 'Millis':
          res = num * 1000;
        break;

        case 'Seconds':
          res = num;
        break;

        case 'Minutes':
          res = num / 60;
        break;

        case 'Hours':
          res = num / 60 / 60;
        break;

        case 'Days':
          res = num / 60 / 60 / 24;
        break;

        case 'Weeks':
          res = num / 60 / 60 / 24 / 7;
        break;

        case 'Years':
          res = num / 60 / 60 / 24 / 365;
        break;
      }

      return res;
    },
    formatNum(conf, isUp) {
      let res = 0;
      if (isUp) {
        res = Math.floor(conf.num * 100) / 100;
      } else {
        res = Math.ceil(conf.num * 100) / 100;
      }
      if (conf.unit == 'Seconds') res = parseInt(res);
      return res;
    },
    findSuitUnit(config) {
      let res = 0, resUnit = '';
      let seconds = this.transformTimeToSeconds(config);
      ['Seconds', 'Minutes', 'Hours', 'Days', 'Weeks', 'Years'].some((d)=>{
        res = this.transformSecondsToTime({num: seconds, unit: resUnit = d});
        if (res === 0 || (res >= 0.1 && res <= 60)) return true;
      });
      return {num: res, unit: resUnit};
    },
    updateFilterValue() {
      let durFilterModel = DfUtils.getDataModel('Duration');
      durFilterModel.value = {
        min: parseInt(this.transformTimeToSeconds(this.minDurationConf)),
        max: parseInt(this.transformTimeToSeconds(this.maxDurationConf))
      };
      eventHub.$emit('updateFilterValue', durFilterModel);
    },
    windowResize() {
      this.drawChart();
    }
  },
  components: {
    leapSelect
  }
}