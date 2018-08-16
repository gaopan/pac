/*
 * PN Chart
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

import SVG from 'svg.js'
import Chart from '@/components/chart/Chart.vue'
import { PNFuzzyChartAdapter, PNFuzzyChart } from './pn-chart-lib'
import TypeChecker from '@/utils/type-checker.js'
import UICommonMethods from '@/utils/ui-common-methods.js'
import shared from "@/shared.js"
import Store from '@/store'
import CommonUtils from '@/utils/common-utils.js'
import Noty from '@/utils/noty-operation.js'
import CommonGenerator from '@/utils/common-generators.js'

var eventHub = shared.eventHub;
var UUIDGenerator = CommonGenerator.UUIDGenerator;

export default {
  name: 'pn-chart',
  props: {
    data: {
      type: Object
    },
    opts: {
      validator: function(_opts){
        if(!_opts) return false;
        if(_opts.type && !TypeChecker.isObject(_opts.type)) return false;
        if(_opts.tooltip && !TypeChecker.isObject(_opts.tooltip)) return false;
        if(_opts.highlight && !TypeChecker.isObject(_opts.highlight)) return false;
        if(_opts.editable && !TypeChecker.isObject(_opts.editable)) return false;
        return true;
      }
    }
  },
  data() {
    return {
      rawData: null,
      data: null,
      chartOpts: {
        viewType: 0
      },
      container: null,
      chart: null,
      isClicked: false
    }
  },
  created: function() {
    eventHub.$on("hover-process-variant", this.hoverProcessVariant);
    eventHub.$on("unhover-process-variant", this.unHoverProcessVariant);
  },
  watch: {
    conf: function(){},
    conf: {
      handler(val) {
        this.parseConf();
        this.draw();
      },
      deep: true
    }
  },
  mounted: function() {
    this.container = this.$refs.container;
    this.parseConf();
    this.draw();
  },
  methods: {
    parseConf: function() {
      var vm = this;
      var adaptedData = PNFuzzyChartAdapter.adaptData(this.$props.conf.data);
      if (adaptedData) {
        this.rawData = this.$props.conf.data;
        this.data = adaptedData.data;
      }
      if (this.data) {
        var textWidths = [];
        this.data.transitions.forEach(function(t) {
          var theName = t.name;
          if (t.isStart) {
            theName = "Start Process";
          } else if (t.isEnd) {
            theName = "End Process";
          }
          var textSize = UICommonMethods.getTextSize(theName, {
            fontSize: '9px',
            fontFamily: 'GT-Walsheim-Bold'
          });
          t.textSize = textSize;
          textWidths.push(textSize.width);
        });
        textWidths.sort(function(a, b) { return a - b; });
        this.chartOpts.nodeWidth = textWidths[Math.ceil(textWidths.length * 0.5)] + 20;
      }

      this.chartOpts.transition = {};

      if (this.$props.conf.opts) {
        this.chartOpts.viewType = this.$props.conf.opts.viewType || 0;
        this.chartOpts.viewOpts = Object.assign({ kpi: 'abs', weightedBy: null }, this.$props.conf.opts.viewOpts);
        this.chartOpts.id = this.$props.conf.opts.id;
        this.chartOpts.disabledTooltip = this.$props.conf.opts.disabledTooltip;
        this.chartOpts.disabledTooltipKpi = this.$props.conf.opts.disabledTooltipKpi;
        this.chartOpts.disabledAddon = this.$props.conf.opts.disabledAddon;
        this.chartOpts.enabledTooltipLinkage = this.$props.conf.opts.enabledTooltipLinkage;
        this.chartOpts.showTitle = this.$props.conf.opts.showTitle;
        this.chartOpts.enabledHighlightPath = this.$props.conf.opts.enabledHighlightPath;
        this.chartOpts.highlightedPath = this.$props.conf.opts.highlightedPath;
        this.chartOpts.highlightTimeout = this.$props.conf.opts.highlightTimeout;
        this.chartOpts.highlightedTransitions = this.$props.conf.opts.highlightedTransitions;
        this.chartOpts.highlightedConnections = this.$props.conf.opts.highlightedConnections;
        this.chartOpts.enabledHighlightLevel = this.$props.conf.opts.enabledHighlightLevel;
        this.chartOpts.enabledWhiteboardMark = this.$props.conf.opts.enabledWhiteboardMark;
        this.chartOpts.editable = this.$props.conf.opts.editable;
        this.chartOpts.onToggleComment = this.$props.conf.opts.onToggleComment;
        this.chartOpts.newWhiteboard = this.$props.conf.opts.newWhiteboard;
        this.chartOpts.enabledHeatmap = this.$props.conf.opts.enabledHeatmap;
        this.chartOpts.enabledClickPop = this.$props.conf.opts.enabledClickPop;
        this.chartOpts.isMapping = this.$props.conf.opts.isMapping;

        // testing code ,will be delete later  pan 
        var currentFilter
        eventHub.$on('activityStatus', function(d) {
          currentFilter = d;
        })
        if (this.chartOpts.enabledClickPop == true) {
          if (this.data) {
            if (!this.chartOpts.isMapping) {
              this.data.connections.forEach(function(d, i) {
                vm.data.connections[i].enabledClickPop = function(t) {
                  var container = vm.container;
                  var processDetailPanl = self.node = document.createElement("div");
                  processDetailPanl.className = 'process-detail-panel';
                  container.appendChild(processDetailPanl);
                  processDetailPanl.style.display = "block";

                  var processDetail = document.createElement("div");
                  processDetail.className = "process-detail-wrapper";
                  processDetailPanl.appendChild(processDetail);

                  var processDetailHeader = document.createElement("div");
                  processDetailHeader.className = "process-detail-header";
                  processDetail.appendChild(processDetailHeader);

                  var processDetailTitle = document.createElement("span");
                  processDetailTitle.innerHTML = t.model.sourceName + ' -> ' + t.model.targetName;
                  processDetailHeader.appendChild(processDetailTitle);

                  var processDetailClose = document.createElement("i");
                  processDetailClose.className = "icon-close pull-right";
                  processDetailClose.onclick = function() {
                    processDetailPanl.style.display = "none";
                  };
                  processDetailClose.style.cursor = "pointer";
                  processDetailHeader.appendChild(processDetailClose);


                  var processDetailBody = document.createElement("div");
                  processDetailBody.className = "process-detail-body";
                  processDetail.appendChild(processDetailBody);

                  var processDetailTransaction = document.createElement("div");
                  processDetailTransaction.className = "process-detail-transaction";
                  processDetailBody.appendChild(processDetailTransaction);

                  var processDetailIconTra = document.createElement("i");
                  processDetailIconTra.className = "icon-retweet";
                  var processDetailTitleTra = document.createElement("span");
                  processDetailTitleTra.innerHTML = " Transaction";
                  processDetailTransaction.appendChild(processDetailIconTra);
                  processDetailTransaction.appendChild(processDetailTitleTra);
                  var processDetailContTra = document.createElement("div");
                  var dact = (t._addon.count.act == null) ? "N/A" : t._addon.count.act;
                  var dcase = (t._addon.count.case == null) ? "N/A" : t._addon.count.case;
                  var dmax = (t._addon.count.max == null) ? "N/A" : t._addon.count.max;
                  var StrTra = '<table>' +
                    '<tr >' + '<td class = "content">' + 'Absolute Frequency:' + '</td>' + '<td >' + dact + '</td>' + '</tr>' +
                    '<tr >' + '<td class = "content">' + 'Case Frequency:' + '</td>' + '<td >' + dcase + '</td>' + '</tr>' +
                    '<tr >' + '<td class = "content">' + 'Maximum Repetition:' + '</td>' + '<td >' + dmax + '</td>' + '</tr>' +
                    '</table>';
                  processDetailContTra.innerHTML = StrTra;
                  processDetailTransaction.appendChild(processDetailContTra);

                  var processDetailDuration = document.createElement("div");
                  processDetailDuration.className = "process-detail-duration";
                  processDetailBody.appendChild(processDetailDuration);


                  var processDetailIconDu = document.createElement("i");
                  processDetailIconDu.className = "icon-clock-o";
                  var processDetailTitleDu = document.createElement("span");
                  processDetailTitleDu.innerHTML = " Duration";
                  processDetailDuration.appendChild(processDetailIconDu);
                  processDetailDuration.appendChild(processDetailTitleDu);
                  var processDetailContDu = document.createElement("div");
                  var StrDu = '<table>' +
                    '<tr >' + '<td class = "content">' + 'Average:' + '</td>' + '<td >' + t._addon.duration.avgStr + '</td>' + '</tr>' +
                    '<tr >' + '<td class = "content">' + 'Median:' + '</td>' + '<td >' + t._addon.duration.medStr + '</td>' + '</tr>' +
                    '<tr >' + '<td class = "content">' + 'Maximum:' + '</td>' + '<td >' + t._addon.duration.maxStr + '</td>' + '</tr>' +
                    '<tr >' + '<td class = "content">' + 'Minimum:' + '</td>' + '<td >' + t._addon.duration.minStr + '</td>' + '</tr>' +
                    '</table>';
                  processDetailContDu.innerHTML = StrDu;
                  processDetailDuration.appendChild(processDetailContDu);

                  var processDetailFilter = document.createElement("div");
                  var processDetailFilterS = document.createElement("span");
                  processDetailFilterS.innerHTML = "Filter Connection By Mode";
                  processDetail.appendChild(processDetailFilter);
                  processDetailFilter.appendChild(processDetailFilterS);


                  var processDetailFilterBtnEx = document.createElement("button");
                  processDetailFilterBtnEx.innerHTML = "Excluded";
                  processDetailFilterBtnEx.className = "process-button";
                  processDetailFilterBtnEx.onclick = function() {
                    var dtModel = {
                      filterType: 'activity_connection',
                      value: {
                        include: [],
                        exclude: [{
                          source: t.model.sourceName,
                          target: t.model.targetName
                        }]
                      }
                    }
                    eventHub.$emit('apply-global-filters', {
                      src: 'processGraph',
                      dataFilters: dtModel
                    });
                    processDetailPanl.style.display = "none";
                  };

                  var processDetailFilterBtnIn = document.createElement("button");
                  processDetailFilterBtnIn.innerHTML = "Included";

                  processDetailFilter.appendChild(processDetailFilterBtnEx);

                  if (currentFilter && currentFilter.value.length) {
                    currentFilter.value.forEach((dFilter) => {
                      if (dFilter.filterType == 'activity') {
                        dFilter.value.include.forEach((r) => {
                          if (r.source == t.model.sourceName && r.target == t.model.targetName) {
                            processDetailFilterBtnIn.className = "active "
                          }
                        })
                      }
                    })
                  }
                  processDetailFilterBtnIn.onclick = function() {
                    var dtModel = {
                      filterType: 'activity_connection',
                      value: {
                        include: [{
                          source: t.model.sourceName,
                          target: t.model.targetName
                        }],
                        exclude: []
                      }
                    }
                    eventHub.$emit('apply-global-filters', {
                      src: 'processGraph',
                      dataFilters: dtModel
                    });
                    processDetailPanl.style.display = "none";
                  };
                  processDetailFilter.appendChild(processDetailFilterBtnIn)

                }
              })
            }
          }
        }

        if (this.$props.conf.opts.hpConf) {
          this.chartOpts.hpConf = Object.assign({
            cur: '',
            new: '',
            isAdd: false,
            isView: false,
            isEdit: false,
            fnChangedMarkingInfo: null
          }, this.$props.conf.opts.hpConf);
        } else {
          this.chartOpts.hpConf = this.$props.conf.opts.hpConf;
        }

        if (this.chartOpts.editable) {
          this.chartOpts.onChange = this.$props.conf.opts.onChange;
        }

        if (this.chartOpts.enabledWhiteboardMark) {
          this.chartOpts.whiteboardMarkCallback = function() {
            var dataForWB = CommonUtils.deepClone(vm.rawData);
            dataForWB.processMap.connections.forEach(function(c) {
              c.aggregation = {};
            });
            dataForWB.processMap.transitions.forEach(function(t) {
              var newId = UUIDGenerator.purchase();
              t.aggregation = {};
              if (t.nodeType == 'START') {
                t.name = 'Start Process';
              } else if (t.nodeType == 'END') {
                t.name = 'End Process';
              }
              dataForWB.processMap.connections.forEach(function(c) {
                if (c.sourceId == t.id) {
                  c.sourceId = newId;
                  c.sourceLabel = t.name;
                }
                if (c.targetId == t.id) {
                  c.targetId = newId;
                  c.targetLabel = t.name;
                }
              });
              t.id = newId;
            });
            // set current process flow data to vuex store
            Store.dispatch("setWhiteboardWorkbenchConfig", {
              isNew: true,
              items: [{
                chartData: dataForWB
              }]
            });
            vm.$router.push('/pd/whiteboard/workbench');
          };
        }

        if (this.chartOpts.enabledClickPop) {
          this.chartOpts.transition.onClick = function(t) {

            var container = vm.container;
            var processDetailPanl = self.node = document.createElement("div");
            processDetailPanl.className = 'process-detail-panel';
            container.appendChild(processDetailPanl);
            processDetailPanl.style.display = "block";

            var processDetail = document.createElement("div");
            processDetail.className = "process-detail-wrapper";
            processDetailPanl.appendChild(processDetail);

            var processDetailHeader = document.createElement("div");
            processDetailHeader.className = "process-detail-header";
            processDetail.appendChild(processDetailHeader);

            var processDetailTitle = document.createElement("span");
            processDetailTitle.innerHTML = t.model.name;
            processDetailHeader.appendChild(processDetailTitle);

            var processDetailClose = document.createElement("i");
            processDetailClose.className = "icon-close pull-right";
            processDetailClose.onclick = function() {
              processDetailPanl.style.display = "none";
            };
            processDetailClose.style.cursor = "pointer";
            processDetailHeader.appendChild(processDetailClose);
            if (vm.chartOpts.isMapping) {
              var mappingButton = document.createElement("button");
              mappingButton.className = "mapping-button";
              mappingButton.innerHTML = "Map This Activity";
              mappingButton.onclick = function() {

                if (TypeChecker.isFunction(vm.$props.conf.opts.onClickTransition)) {
                  vm.$props.conf.opts.onClickTransition.call(t, t);
                }
                processDetailPanl.style.display = "none";
              }
              processDetailHeader.appendChild(mappingButton);
            } else {


              var processDetailBody = document.createElement("div");
              processDetailBody.className = "process-detail-body";
              processDetail.appendChild(processDetailBody);

              var processDetailTransaction = document.createElement("div");
              processDetailTransaction.className = "process-detail-transaction";
              processDetailBody.appendChild(processDetailTransaction);

              var processDetailIconTra = document.createElement("i");
              processDetailIconTra.className = "icon-retweet";
              var processDetailTitleTra = document.createElement("span");
              processDetailTitleTra.innerHTML = " Transaction";
              processDetailTransaction.appendChild(processDetailIconTra);
              processDetailTransaction.appendChild(processDetailTitleTra);
              var processDetailContTra = document.createElement("div");
              var dact = (t._addon.count.act == null) ? "N/A" : t._addon.count.act;
              var dcase = (t._addon.count.case == null) ? "N/A" : t._addon.count.case;
              var dmax = (t._addon.count.max == null) ? "N/A" : t._addon.count.max;
              var StrTra = '<table>' +
                '<tr >' + '<td class = "content">' + 'Absolute Frequency:' + '</td>' + '<td >' + dact + '</td>' + '</tr>' +
                '<tr >' + '<td class = "content">' + 'Case Frequency:' + '</td>' + '<td >' + dcase + '</td>' + '</tr>' +
                '<tr >' + '<td class = "content">' + 'Maximum Repetition:' + '</td>' + '<td >' + dmax + '</td>' + '</tr>' +
                '</table>';
              processDetailContTra.innerHTML = StrTra;
              processDetailTransaction.appendChild(processDetailContTra);

              var processDetailDuration = document.createElement("div");
              processDetailDuration.className = "process-detail-duration";
              processDetailBody.appendChild(processDetailDuration);


              var processDetailIconDu = document.createElement("i");
              processDetailIconDu.className = "icon-clock-o";
              var processDetailTitleDu = document.createElement("span");
              processDetailTitleDu.innerHTML = " Duration";
              processDetailDuration.appendChild(processDetailIconDu);
              processDetailDuration.appendChild(processDetailTitleDu);
              var processDetailContDu = document.createElement("div");
              var StrDu = '<table>' +
                '<tr >' + '<td class = "content">' + 'Average:' + '</td>' + '<td >' + t._addon.duration.avgStr + '</td>' + '</tr>' +
                '<tr >' + '<td class = "content">' + 'Median:' + '</td>' + '<td >' + t._addon.duration.medStr + '</td>' + '</tr>' +
                '<tr >' + '<td class = "content">' + 'Maximum:' + '</td>' + '<td >' + t._addon.duration.maxStr + '</td>' + '</tr>' +
                '<tr >' + '<td class = "content">' + 'Minimum:' + '</td>' + '<td >' + t._addon.duration.minStr + '</td>' + '</tr>' +
                '</table>';
              processDetailContDu.innerHTML = StrDu;
              processDetailDuration.appendChild(processDetailContDu);

              var processDetailFilter = document.createElement("div");
              var processDetailFilterS = document.createElement("span");
              processDetailFilterS.innerHTML = "Filter Activity By Mode";
              processDetail.appendChild(processDetailFilter);
              processDetailFilter.appendChild(processDetailFilterS);


              var processDetailFilterBtnEx = document.createElement("button");
              processDetailFilterBtnEx.innerHTML = "Excluded";
              processDetailFilterBtnEx.className = "process-button";
              processDetailFilterBtnEx.onclick = function() {
                var dtModel = {
                  filterType: 'activity',
                  value: {
                    include: [],
                    //30 Nov 2017: Azhaziq - Change data model per Jarod request - use id and name
                    //05 Dec 2017: Azhaziq - Change to using name back
                    exclude: [t.model.name]
                  }
                }
                eventHub.$emit('apply-global-filters', {
                  src: 'processGraph',
                  dataFilters: dtModel
                });
                processDetailPanl.style.display = "none";
              };
              processDetailFilter.appendChild(processDetailFilterBtnEx);

              var processDetailFilterBtnIn = document.createElement("button");
              processDetailFilterBtnIn.innerHTML = "Included";
              if (currentFilter && currentFilter.value.length) {
                currentFilter.value.forEach((dFilter) => {
                  if (dFilter.filterType == 'activity') {
                    dFilter.value.include.forEach((r) => {
                      if (r == t.model.name) {
                        processDetailFilterBtnIn.className = "active "
                      }
                    })
                  }
                })
              }
              processDetailFilterBtnIn.onclick = function() {
                var dtModel = {
                  filterType: 'activity',
                  value: {
                    //30 Nov 2017: Azhaziq - Change data model per Jarod request - use id and name
                    //05 Dec 2017: Azhaziq - Change to using name back
                    include: [t.model.name],
                    exclude: []
                  }
                }
                eventHub.$emit('apply-global-filters', {
                  src: 'processGraph',
                  dataFilters: dtModel
                });
                processDetailPanl.style.display = "none";
              };
              processDetailFilter.appendChild(processDetailFilterBtnIn)

            }
          }
        } else {
          if (TypeChecker.isFunction(this.$props.conf.opts.onClickTransition)) {
            this.chartOpts.transition.onClick = this.$props.conf.opts.onClickTransition;
          }
        }
      }

      if (!this.chartOpts.disabledTooltip) {
        var container = this.container;
        var tooltipTitle = ' Transaction',
          durationKpis = [{ key: "duration.avg", label: "Average" }, { key: "duration.med", label: "Median" }, { key: "duration.min", label: "Minimum" }, { key: "duration.max", label: "Maximum" }, { key: "duration.dev", label: "Deviation" }],
          countKpis = [{ key: "count.act", label: "Activity Frequency" }, { key: "count.case", label: "Case Frequency" }, { key: "count.max", label: "Maximum Repetitions" }],
          kpis = countKpis;
        if (this.chartOpts.viewType == 2) {
          tooltipTitle = ' Duration';
          kpis = durationKpis;
        }
        var tooltipW = 170,
          tooltipH = 24 * (kpis.length + 1);
        if (this.chartOpts.disabledTooltipKpi) {
          tooltipH = 24 * 2;
        }
        this.chartOpts.transition.tooltip = {
          width: tooltipW + 24,
          height: tooltipH,
          ignoreStartAndEnd: true
        };
        this.chartOpts.transition.onHover = function(t) {
          if (t.tooltip) return;
          if (vm.chartOpts.transition.tooltip.ignoreStartAndEnd) {
            if (t._isEnd || t._isStart) return;
          }
          var wrapper = t.tooltip = document.createElement('div');
          wrapper.className = 'pn-tooltip';
          wrapper.style.left = t._pos.x + t._size.w + 24 + 'px';
          wrapper.style.top = t._pos.y - 24 + 'px';
          // wrapper.style.width = t._textSize.width > tooltipW ? t._textSize.width : tooltipW + 16 + 'px';
          // wrapper.style.height = tooltipH + 'px';
          t._container.appendChild(wrapper);

          // header
          var header = document.createElement('div');
          // header.innerHTML = header.title = 'Process' + tooltipTitle + ' Statistics';
          header.innerHTML = header.title = t._title;
          header.className = 'tooltip-title';
          wrapper.appendChild(header);

          if (!vm.chartOpts.disabledTooltipKpi) {
            // body
            var body = document.createElement('div');
            body.className = 'tooltip-body';
            wrapper.appendChild(body);

            //body content
            kpis.forEach(function(kpi, index) {
              var row = document.createElement('div');
              row.className = 'tooltip-item';
              if (index == 0) row.className += ' active';
              body.appendChild(row);

              // label
              var label = document.createElement('div');
              label.className = 'item-label';
              label.innerHTML = label.title = kpi.label;
              row.appendChild(label);
              // value
              var value = document.createElement('div');
              var valueKeys = kpi.key.split('.');
              value.className = 'item-value';
              value.innerHTML = value.title = t._addon[valueKeys[0]][valueKeys[1] + 'Str'];
              row.appendChild(value);
            });
          }

          if (vm.chartOpts.enabledTooltipLinkage) {
            var footer = document.createElement('div');
            footer.className = 'tooltip-footer';
            if (t.mapping) {
              var actNames = [];
              if (t.mapping.leftActs.indexOf(t) > -1) {
                actNames = t.mapping.rightActs.map(function(d) {
                  return d._title;
                });
              } else if (t.mapping.rightActs.indexOf(t) > -1) {
                actNames = t.mapping.leftActs.map(function(d) {
                  return d._title;
                });
              }
              var footerHeader = document.createElement('div');
              footerHeader.className = 'title';
              footerHeader.innerHTML = 'Linked Activity';
              footer.appendChild(footerHeader);

              var footerContent = document.createElement('ul');
              footer.appendChild(footerContent);

              actNames.forEach(function(actName) {
                var li = document.createElement('li');
                li.innerHTML = "<i class='icon-circle'></i><span>" + actName + "</span>";
                footerContent.appendChild(li);
              });
            } else {
              footer.innerHTML = 'No linked Activities.';
            }
            wrapper.appendChild(footer);
          }

          var wrapperW = wrapper.clientWidth,
            wrapperH = wrapper.clientHeight,
            containerW = t._container.clientWidth,
            containerH = t._container.clientHeight,
            margin = 20;
          // put the tooptip on different direction based on the transition's position and wrapper's size
          // put on right, if wrapperWidth + t._pos.x + t._size.w <= t._container.clientWidth 
          // put on left, if wrapperWidth + t._pos.x + t._size.w > t._container.clientWidth
          if (wrapperW + t._pos.x + t._size.w <= containerW) {
            wrapper.classList.add('right');
            wrapper.style.left = t._pos.x + t._size.w + margin + 'px';
          } else {
            wrapper.classList.add('left');
            wrapper.style.left = t._pos.x - wrapperW - margin + 'px';
          }
          if (wrapperH + t._pos.y <= containerH) {
            wrapper.classList.add('top');
            wrapper.style.top = t._pos.y + "px";
          } else {
            wrapper.classList.add('bottom');
            wrapper.style.top = t._pos.y + t._size.h - wrapperH + 'px';
          }
        };
        this.chartOpts.transition.onUnHover = function(t) {
          if (t.tooltip) {
            t.tooltip.parentNode.removeChild(t.tooltip);
            t.tooltip = null;
          }
        };
      }

    },
    // draw in the container
    draw: function() {
      var container = this.container;
      if (this.data) {
        this.chart = new PNFuzzyChart(container).noty(Noty).data(this.data).draw(this.chartOpts);
        if (TypeChecker.isFunction(this.$props.conf.awareChartInstance)) {
          this.$props.conf.awareChartInstance.call(this, this.chart);
        }
        if (TypeChecker.isFunction(this.$props.conf.awareProcessStaticData)) {
          this.$props.conf.awareProcessStaticData.call(this, this.chart.static.getData());
        }
      } else {
        this.chart = new PNFuzzyChart(container).noty(Noty).data(null).draw(this.chartOpts);
        if (TypeChecker.isFunction(this.$props.conf.awareChartInstance)) {
          this.$props.conf.awareChartInstance.call(this, this.chart);
        }
        if (TypeChecker.isFunction(this.$props.conf.awareProcessStaticData)) {
          this.$props.conf.awareProcessStaticData.call(this, null);
        }
      }
    },
    hoverProcessVariant: function(args) {
      if (this.chart && args.variant) {
        this.chart.highlightPath(args.variant.connections);
      }
    },
    unHoverProcessVariant: function(args) {
      if (this.chart && args.variant) {
        this.chart.unHighlightPath(args.variant.connections);
      }
    }
  },
  components: {
    Chart
  },
  beforeDestroy: function() {
    eventHub.$off("hover-process-variant", this.hoverProcessVariant);
    eventHub.$off("unhover-process-variant", this.unHoverProcessVariant);
  }
}
