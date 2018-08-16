import shared from "@/shared.js"
import processMiningApi from '@/api/process-mining.js'
import PNChart from "../../../pn-chart/PNChart.vue"
import LEAPSelect from "@/components/leap-select/LEAPSelect.vue"
import recipesAPI from '@/api/recipes.js'
import recipeUtils from '@/utils/recipe-utils.js'
import Loader from "@/components/loader/Loader.vue"
import LeapSearch from '@/components/leap-search/LEAPSearch.vue'

var eventHub = shared.eventHub;

export default {
  name: 'recipe-selection',
  props: {
    tileId: {
      type: String,
      required: true
    },
    conf: {
      type: Object,
      required: true
    }
  },
  components: {
    'pn-chart': PNChart,
    'leap-select': LEAPSelect,
    Loader,
    LeapSearch
  },
  data() {
    return {
      isLoading: false,
      data: null,
      allRecipes: null,
      searchData: null,
      selectedProcess: "Show All",
      selectedRecipe: null,
      selectedRecipeConf: {
        data: null,
        disabledFilter: true,
        opts: {
          viewType: 1,
          disabledTooltipKpi: true,
          disabledAddon: true,
          showTitle: true
        }
      },
      viewAsCard: true,
      processSelection: [{
        name: "Show All"
      }],
      processSelection2: null,
      showComparison: false,
      showComparisonChart: false,
      stylesLeapSelect: null,
      stylesLoader: {
        height: 100,
        color: '#000'
      },
      filterRunning: false
    }
  },
  created() {

    this.isLoading = true;

    //Azhaziq - 28/3/2018 - Remove icon margin
    this.stylesLeapSelect = {
      processLabel: {
        color: "#fff",
        backgroundColor: "#000",
        boxShadow: "0 0 0 2px #000"
      }
    }

    let vm = this;
    let proId = this.$store.getters.processSelection.id;
    recipesAPI.getAllRecipes(this.$store.getters.customerSelection.id, proId)
      .then(function(res) {

        if (res.data.length > 0) {
          vm.$data.data = recipeUtils.getExtraData(res.data);
          vm.$data.allRecipes = vm.$data.data;
        }
        vm.isLoading = false;
      })
      .catch(function(error) {
        vm.isLoading = false;
        console.log("Failed to retrieve all recipes");
        console.log(error);
      });

    recipesAPI.getAllProcessTypes(this.$store.getters.customerSelection.id)
      .then(function(res) {

        for (var obj of res.data) {
          vm.$data.processSelection.push({
            name: obj.processType
          });
        }

      })
      .catch(function(error) {
        console.log(error);
        console.log("Failed to retrieve processType list");
      })

    eventHub.$on('need-to-change-comparison-process', this.onChangeComparisonProcess);
    eventHub.$on('global-filter-running', (args) => {
      this.filterRunning = args.filterRunning;
    })
  },
  methods: {
    doSearch(searchText) {
   
      this.searchData = searchText;

      if (this.searchData && this.searchData.trim() != '') {
        let val = '^(?=.*' + this.searchData.trim().split(/\s+/).join('\\b)(?=.*\\b') + ').*$',
          reg = RegExp(val, 'i');

        let filtered = [];
        this.getCurrentRecipes();

        this.data.forEach(function(c) {
          if (reg.test(c.name)) {
            filtered.push(c);
          }
        });
        this.data = filtered;
      } else {
        this.getCurrentRecipes();
      }

    },
    getCurrentRecipes() {
      this.data = [];
      (this.selectedProcess === 'Show All') ?
      this.data = this.allRecipes: this.allRecipes.find(this.findRecipe);
    },
    findRecipe(recipe) {
      if (recipe.processType === this.selectedProcess) {
        this.data.push(recipe);
      }
    },
    chooseRecipe(recipe) {
      var vm = this;
      this.showComparison = true;
      this.selectedRecipe = recipe;
      this.selectedRecipeConf.data = recipe;
      // processMiningApi.getProcessPromise(this.selectedRecipe.processDefinitionId = '5949e71d4056d680f1ad3232').then(function(res) {
      //   vm.selectedRecipeConf.data = res.data
      // });
    },
    cancelChooseRecipe() {
      this.selectedRecipeConf.data = null;
      this.showComparison = false;
      this.selectedRecipe = null;
    },
    selectedProcessToCompare() {
      eventHub.$emit('changed-process-to-compare', {
        data: this.selectedRecipe
      });
    },
    onChangeComparisonProcess(args) {
      this.selectedRecipeConf.data = null;
      this.showComparison = false;
      this.selectedRecipe = null;
    },
    toggleIcon() {
      this.viewAsCard ?
        this.viewAsCard = false : this.viewAsCard = true;
    },
    onChangeSelected(args) {
      //14 Feb 2018: adib.ghazali@hpe.com - refactor LEAP Select for emit data
      let selectedProcess = args.value;

      this.$data.selectedProcess = selectedProcess;
      this.searchData = null;
      this.data = [];

      (selectedProcess === 'Show All') ?
      this.data = this.allRecipes: this.allRecipes.find(this.findRecipe);
    }
  },
  beforeDestroy: function() {
    eventHub.$off('need-to-change-comparison-process', this.onChangeComparisonProcess);
  }
}
