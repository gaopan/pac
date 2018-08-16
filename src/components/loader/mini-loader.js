import shared from "../../shared.js"
import Loader from "./Loader.vue"

let eventHub = shared.eventHub

export default {
  name: 'mini-loader',
  data() {
    return {
      isLoading: false,
      showMaskTip: false,
      percent: 0,
      width: "0%",
      totalTime: 5000,
      cellProcess: 20,
      interval: 1000,
      toDoList: [],
      queue: [],
      lock: false,
      timer: null
    }
  },
  created: function() {
    eventHub.$on("start-mini-loader", this.start);
    eventHub.$on("finish-mini-loader", this.finished);
    eventHub.$on("clear-mini-loader", this.clear);
  },
  components: {
    'loader': Loader
  },
  mounted: function() {

  },
  watch: {
    'queue.length': {
      handler: function(val) {
        if (val > 0) {
          this.processQueuedTask();
        }
      }
    }
  },
  methods: {
    processQueuedTask: function() {
      if (this.queue.length < 1) return;
      var vm = this,
        fnProcessTask = function() {
          var task = vm.queue[0];
          if (task.type == 'start') {
            vm.start(task.args);
          } else if (task.type == 'finish') {
            vm.finished(args);
          }
          vm.queue.shift();
        };

      if (vm.lock) {
        setTimeout(function() {
          vm.processQueuedTask();
        }, 50);
      } else {
        fnProcessTask();
      }

    },
    start: function(args) {
      var vm = this;
      if (vm.lock) {
        vm.queue.push({
          type: 'start',
          args: args
        });
        return;
      }
      vm.lock = true;
      var roughTime = args.roughTime || 5000;
      this.toDoList.push(args);

      if (roughTime > this.totalTime) {
        this.totalTime = roughTime;
      }
      this.cellProcess = 100 / (this.totalTime / this.interval);
      if (!vm.timer) {
        this.isLoading = true;
        this.percent = 0;
        this.width = "0%";
        vm.timer = setInterval(function() {
          if (vm.percent < (100 - vm.cellProcess)) {
            vm.percent += vm.cellProcess;
            vm.changedPercent();
          } else {
            clearInterval(vm.timer);
            vm.timer = null;
          }
        }, vm.interval);
      }
      vm.lock = false;
    },
    changedPercent: function() {
      this.width = this.percent + '%';
    },
    clear: function() {
      var vm = this;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      vm.queue = [];
      vm.lock = false;
      vm.toDoList = [];

      setTimeout(function() {
        if (vm.toDoList.length == 0 && vm.queue.length == 0) {
          vm.totalTime = 5000;
          vm.cellProcess = 20;
          vm.isLoading = false;
          vm.showMaskTip = false;
          vm.percent = 0;
          vm.width = "0%";
        }
      }, 1000);
    },
    finished: function(args) {
      var vm = this;
      if (vm.lock) {
        vm.queue.push({
          type: 'finish',
          args: args
        });
        return;
      }
      vm.lock = true;
      if (this.toDoList.length > 0) {
        var index = null;
        this.toDoList.every(function(item, i) {
          if (item.id == args.id) {
            index = i;
            return false;
          }
          return true;
        });
        this.toDoList.splice(index, 1);
      }

      if (this.toDoList.length < 1) {
        clearInterval(this.timer);
        this.timer = null;
        this.percent = 100;
        this.changedPercent();
        setTimeout(function() {
          vm.isLoading = false;
          vm.showMaskTip = false;
          vm.percent = 0;
          vm.width = "0%";

          //Azhaziq - 09/08/2017: Inform other component all the loader have finish
          eventHub.$emit("end-mini-loader");
        }, this.interval);
      }
      vm.lock = false;
    },
    cancel: function() {
      var vm = this;
      vm.clear();

      //Azhaziq - 15/08/2017: Inform global filter cancel has been executed
      eventHub.$emit("cancel-mini-loader");

      vm.toDoList.forEach(function(item) {
        eventHub.$emit("cancel-loaing-from-mini-loader", item);
      });
    },
    onClickLoaderBar: function() {
      this.showMaskTip = !this.showMaskTip;
    }
  },
  beforeDestroy: function() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    eventHub.$off("start-mini-loader", this.start);
    eventHub.$off("finish-mini-loader", this.finished);
    eventHub.$off("clear-mini-loader", this.clear);
  }
}
