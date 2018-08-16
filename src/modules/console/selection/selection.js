import router from '@/router'
import shared from '@/shared.js'
import Account from '@/api/account.js'
import NotyOpeartion from '@/utils/noty-operation.js'
import ProcessApi from '@/api/admin/process.js'
import CustomerApi from '@/api/admin/company.js'
import CommonGenerators from '@/utils/common-generators.js'
import commonUtils from '@/utils/common-utils.js'
import TypeChecker from '@/utils/type-checker.js'
import CommonConverter from '@/utils/common-converter.js'
import ProcessSelectionService from '@/services/process-selection-services.js'
import CustomerSelectionService from '@/services/customer-selection-services.js'

let UUIDGenerator = CommonGenerators.UUIDGenerator
let images = require.context('@/assets/', false, /\.(png|jpg)$/)
let eventHub = shared.eventHub;

export default {
  name: 'selection',
  data() {
    return {
      loadId: null,
      searchText: '',
      customers: null,
      allCustomers: null,
      customer: {},
      processes: []
    }
  },
  created() {
    this.loadId = CommonGenerators.UUIDGenerator.purchase();
    this.getData();
  },
  filters: {
    publishTime: function(val) {
      var timeDiff = (new Date().getTime() - val) / 1000,
        timeStr = null;
      if (timeDiff < 60) {
        timeStr = '刚刚发布';
      } else {
        var intervalTime = CommonConverter.convertSecondToStr(timeDiff < 0 ? 0 : timeDiff, 0);
        timeStr = '发布在' + intervalTime + '之前';
      }
      return timeStr;
    }
  },
  methods: {
    getData: function() {
      var vm = this,
        customers = null,
        processes = null,
        processPromise = null,
        customerPromise = null;

      eventHub.$emit("start-mini-loader", { id: this.loadId });
      var correlateCustomersAndProcesses = function() {
        if (!customers) {
          return;
        } else {
          if (!processes) {
            customers.forEach(function(c) {
              c.processes = [];
            });
            vm.customers = customers;
            vm.allCustomers = customers;
          } else {
            var theCustomers = [];
            processes.forEach(function(p) {
              let theCustomerId = p.customerId;
              customers.every((ele) => {
                if (ele.id == theCustomerId) {
                  ele.processes.push(p);
                  return false;
                };
                return true;
              });
            });
            customers.forEach(function(c) {
              c.selected = c.processes[0];
              theCustomers.push(c);
            });
            vm.customers = theCustomers;
            vm.allCustomers = theCustomers;
            eventHub.$emit("finish-mini-loader", { id: vm.loadId });
          }
        }
      };
      var processCallBack = function(res) {
        let data = res.data;
        processes = [];
        if (TypeChecker.isArray(data)) {
          processes = data.map(function(d) {
            return {
              name: d.processName,
              fileName: d.fileName || d.processName,
              customerId: d.customerId,
              uploadTime: d.uploadTime || new Date(2017, 10, 8).getTime(),
              id: d.processId,
              processAnalyticsId: d.processAnalyticsId || ""
            };
          });
        };
      };
      var customerCallBack = function(res) {
        if (res.data.length == 0) {
          eventHub.$emit("finish-mini-loader", { id: vm.loadId });
        } else {
          var data = [res.data];
          customers = [];
          for (var i = 0; i < data.length; i++) {
            var customer = {
              name: '',
              processes: '',
              isActive: false,
              selected: null,
              processes: []
            };
            customer.name = data[i].name;
            customer.logoUrl = data[i].logoBase64Data;
            customer.id = data[i].id;
            customer.serverName = data[i].serverName;
            customer.serviceTypes = data[i].serviceTypes;
            customers.push(customer)
          }
        }
      };

      var wrongInf = function(err) {
        eventHub.$emit("finish-mini-loader", { id: vm.loadId });
      };

      processPromise = new Promise((resolve, reject) => {
        ProcessApi.getProcesses().then(res => {
          processCallBack.call(this, res);
          resolve(res);
        }, err => {
          reject(err);
        });
      });
      customerPromise = new Promise((resolve, reject) => {
        CustomerApi.manageCustomer().then(res => {
          customerCallBack.call(this, res);
          resolve(res);
        }, err => {
          reject(err);
        })
      });
      Promise.all([processPromise, customerPromise]).then(() => {
        correlateCustomersAndProcesses();
        this.customer = this.customers[0];
        this.processes = this.customer.processes;
        eventHub.$emit("finish-mini-loader", { id: vm.loadId });
      }, err => {
        wrongInf.call(this, err);
      });
    },
    go(p) {
      let vm = this,
        customer = vm.customer;
      var selectedCusUrl = {
        id: customer.id
      };
      p.customer = {
        name: customer.name
      };
      CustomerSelectionService.setCustomerSelection(selectedCusUrl);
      ProcessSelectionService.setProcessSelection(p, function() {
        router.push('/console/pd');
      });
    },
    goToCust(){
      this.$router.push({name: 'Customization'});
    }
  },
  components: {}
}
