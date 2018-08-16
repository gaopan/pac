import DfUtils from "../../dynamic-filter-utils.js"
import leapSelect from '@/components/leap-select/LEAPSelect.vue'
import DynamicFilterApi from '@/api/process-mining.js'
import NotyOperation from '@/utils/noty-operation.js'
import CommonGenerators from '@/utils/common-generators.js'
import shared from "@/shared.js"
import commonUtils from '@/utils/common-utils.js';
// import default from "../../../../utils/type-checker";

var eventHub = shared.eventHub;
let UUIDGenerator = CommonGenerators.UUIDGenerator;

export default {
  loadingId: UUIDGenerator.purchase(),
  name: 'activity-connection',
  props: ['localSectionFilter', 'filterDetailData'],
  data() {
    return {
      stylesLeapSelect: {
        processLabel: {
          width: "100%",
          color: "#333333",
          border: "1px solid #dfdfdf"
        }
      },
      isDisable:true,
      sourceV: 'sourceV',
      followerV: 'followerV',
      pname: null,
      sortIndex: 0,
      sortIndexF: 0,
      ifIncluded: true,
      ifExcluded: false,
      newSourceEvent: null,
      newFollowerEvent: null,
      showFilterModeInfo: false,
      sourceValues: [],
      followerValus: [],
      tableData: [],
      applyData: [],
    }

  },
  created() {
    this.getData();
   
  },
  mounted() {

  },
  methods: {
    updateFilterValue(val) {

      //This is function to add the filter value to global data model
      //05-10-2017 - Azhaziq: Tansform Selected Data to fit global data model
      //Set data model
      let dtModel = DfUtils.getDataModel('Activity Connection');
      //Create mapping algorithm to fit your own data model to global data model
      //TODO: add {source: "source:string",target: "target:string"} to the exclude/include array
      //To set data simply as dtModel.value.exclude = [{source: "source:string",target: "target:string"},..] || dtModel.value.include = [{source: "source:string",target: "target:string"},..] 
      //Emit the data out global data model
      //console.log(this.tableData);
      this.tableData.forEach(d => {
        if (d.filteringMode['included']) {
          dtModel.value.include.push({
            source: this.getConnectionsData(d.sourceEventValues, 'source'),
            target: this.getConnectionsData(d.followerEventValues, 'target')

          })
        } else if (d.filteringMode['excluded']) {
          dtModel.value.exclude.push({
            source: this.getConnectionsData(d.sourceEventValues, 'source'),
            target: this.getConnectionsData(d.followerEventValues, 'target')

          })
        }
      })


      eventHub.$emit('updateFilterValue', dtModel);
    },
    getConnectionsData(compareData, searchType, isFromLocalSectionFilter) {

      //24 Nov 2017: adib.ghazali@gmail.com - used id instead of name when send data to BE
      switch(searchType) {

        case 'source':

            let sourceData= null;
            
            this.sourceValues.find(obj => {

              //Azhaziq - 08/12/2017: Sent activity name
              if(obj.name == compareData) {
                sourceData = obj.name;
              }

            });

            return sourceData;

            break;

        default:

          let targetData = null;
          
          this.followerValus.find(obj => {
            
            //Azhaziq - 08/12/2017: Sent activity name
            if(obj.name == compareData) {
              targetData = obj.name;
            }
          });

          return targetData;
            
      }

    },
    getData() {
      let processAnalyticsId = this.$store.getters.processSelection.processAnalyticsId;
      if (this.$props.filterDetailData == null) {
        eventHub.$emit("start-mini-loader", { id: this.loadingId });
        DynamicFilterApi.getActivityConnectionData(this.$store.getters.processSelection.customerId, processAnalyticsId).then(res => {
          eventHub.$emit("finish-mini-loader", { id: this.loadingId });
        
          //Azhaziq - 08/12/2017: Sent activity name
          res.data.list.forEach(d => {
            if(d.activityName){
               this.sourceValues.push({ name: d.activityName,value:d.activityName });
               this.followerValus.push({ name: d.activityName,value:d.activityName });
            }
           
          });
          commonUtils.ascendSort_ObjectsInArray(this.sourceValues,'name');
          commonUtils.ascendSort_ObjectsInArray(this.followerValus,'name');
          this.initDataBylocalSectionFilter();
          this.$emit('activityFDChange', {
            name: 'activityConnection',
            value: res.data.list
          })

        }, err => {
          NotyOperation.notifyError({text: 'Get dynamic filter error.'});
          eventHub.$emit("finish-mini-loader", { id: this.loadingId });
          return '<div>' + 'there is no data' + '</div>'

        });
      }else{
        this.$props.filterDetailData.forEach(d => {
          if( d.activityName){
             this.sourceValues.push({ name: d.activityName,value:d.activityName});
             this.followerValus.push({ name: d.activityName,value:d.activityName });
            }
           
          });
          commonUtils.ascendSort_ObjectsInArray(this.sourceValues,'name');
          commonUtils.ascendSort_ObjectsInArray(this.followerValus,'name');

          this.initDataBylocalSectionFilter();
      }
    },
    clickSort1(arg) {
      if (arg == this.sourceV) {
        commonUtils.ascendSort_ObjectsInArray(this.tableData, 'sourceEventValues');
        this.sortIndex = 1;
        this.sortIndexF = 0;
      } else {
        commonUtils.ascendSort_ObjectsInArray(this.tableData, 'followerEventValues');
        this.sortIndexF = 1;
        this.sortIndex = 0
      }

    },
    clickSort2(arg) {
      if (arg == this.sourceV) {
        commonUtils.descendSort_ObjectsInArray(this.tableData, 'sourceEventValues');
        this.sortIndex = -1;
      } else {
        commonUtils.descendSort_ObjectsInArray(this.tableData, 'followerEventValues');
        this.sortIndexF = -1;
      }

    },
    fnSelectedSource(args) {
      //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
      this.newSourceEvent = args.value;
      if(this.newSourceEvent&&this.newFollowerEvent){
        this.isDisable=false;
      }

    },
    fnSelectedFollower(args) {
      //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
      this.newFollowerEvent = args.value;
      if(this.newSourceEvent&&this.newFollowerEvent){
        this.isDisable=false;
      }
    },
    changeInclude() {
      this.ifIncluded = true;
      this.ifExcluded = false;
    },
    changeExclude() {
      this.ifExcluded = true;
      this.ifIncluded = false;
    },
    changeIncludeMode(index){
      this.tableData[index].filteringMode['included']=true;
      this.tableData[index].filteringMode['excluded']=false;
      this.updateFilterValue();


    },
    changeExcludeMode(index){
      this.tableData[index].filteringMode['excluded']=true;
      this.tableData[index].filteringMode['included']=false;
      this.updateFilterValue();

    },
    submit() {
      if (this.newSourceEvent && this.newFollowerEvent) {
        this.tableData.push({
                  sourceEventValues: this.newSourceEvent,
                  followerEventValues: this.newFollowerEvent,
                  filteringMode: {
                    included: this.ifIncluded,
                    excluded: this.ifExcluded
                  }
                })

        // if (this.newSourceEvent != this.newFollowerEvent) {
        //   // console.log("in")
        //   if (this.tableData.length != 0) {
        //     var same = false;
        //     same = this.tableData.some(d => {
        //       return d.sourceEventValues == this.newSourceEvent && d.followerEventValues == this.newFollowerEvent;
        //     })

        //     if (same) {
        //       console.log("same")
        //     } else {
        //       this.tableData.push({
        //         sourceEventValues: this.newSourceEvent,
        //         followerEventValues: this.newFollowerEvent,
        //         filteringMode: {
        //           included: this.ifIncluded,
        //           excluded: this.ifExcluded
        //         }
        //       })
        //     }            
        //   } else {
        //     this.tableData.push({
        //           sourceEventValues: this.newSourceEvent,
        //           followerEventValues: this.newFollowerEvent,
        //           filteringMode: {
        //             included: this.ifIncluded,
        //             excluded: this.ifExcluded
        //           }
        //         })
        //   }
        // }

      }
      // console.log( this.tableData.length);
      this.updateFilterValue();
    },
  
    removeTr(index) {
      this.tableData.splice(index, 1);
      this.updateFilterValue();
    },
    initDataBylocalSectionFilter() {
      var excluded = this.localSectionFilter.value.exclude;
      var included = this.localSectionFilter.value.include;
      excluded.forEach(d => {
        this.tableData.push({
          sourceEventValues: this.getConnectionsData(d.source,'source', true),
          followerEventValues: this.getConnectionsData(d.target, 'target',true),
          filteringMode: {
            included: false,
            excluded: true
          }
        })
      })
      included.forEach(d => {
        this.tableData.push({
          sourceEventValues: this.getConnectionsData(d.source,'source', true),
          followerEventValues: this.getConnectionsData(d.target, 'target',true),
          filteringMode: {
            included: true,
            excluded: false
          }
        })
      })
      commonUtils.ascendSort_ObjectsInArray(this.tableData, 'sourceEventValues')
    },

  },
  components: {
    leapSelect
  }
}
