import TypeChecker from '@/utils/type-checker.js'
import commonUtils from '@/utils/common-utils.js'

let Config = {};

Config.templates = [{
  order: 1,
  title: 'Case Distribution Trend',
  formTitle: 'Case distribution trend by : ',
  groups: [],
  config: {}
}, {
  order: 2,
  title: 'Case Value Comparison',
  formTitle: 'Value comparison by : ',
  groups: [],
  config: {}
}, {
  order: 3,
  title: 'Case Value Ranking',
  formTitle: 'Value ranking by : ',
  groups: [],
  config: {}
}, {
  order: 4,
  title: 'Case Group By',
  groups: [],
  config: {},
  currentGroup: {}
}];

Config.settings = {
  // key indicates for order
  1: {
    type: 1, // 1: only choose field 2: need to choose type, field and groupBy
    key: 'caseDistributionTrendBy'
  },
  2: {
    type: 1,
    key: 'valueComparisonBy'
  },
  3: {
    type: 1,
    key: 'valueRankingBy'
  },
  4: {
    type: 2,
    key: 'valueGroupBy'
  }
};

let convertField = function(d){
	return {
		name: d.label,
		value: d.key
	};
};

Config.parseForTypeOne = function(template, config){
	let _config = config;
	if(!TypeChecker.isArray(config)) {
		_config = [];
	}

	template.config.allFields = _config.map(convertField);

	//TODO massage the groups
	//fix defect #4959 hong-yu.chen@hpe.com
	template.config.availableFields = commonUtils.ascendSort_ObjectsInArray(_config.map(convertField),"name");
	// template.config.availableFields = template.config.allFields;
};

Config.parseForTypeTwo = function(template, config){
	let _config = config;
	if(!TypeChecker.isObject(config)) {
		_config = { type: [], field: [], groupBy: []};
	}
	let groupType = _config.type.map(d => {
		return {
			name: d,
			value: d
		};
	});
	template.config.type = commonUtils.ascendSort_ObjectsInArray(groupType,"name");
	template.config.allFields = commonUtils.ascendSort_ObjectsInArray(_config.field.map(convertField),"name");
	template.config.allGroupByFields = commonUtils.ascendSort_ObjectsInArray(_config.groupBy.map(convertField),"name");

	//TODO massage the groups

	template.config.availableFields = commonUtils.ascendSort_ObjectsInArray(template.config.allFields,"name");
	template.config.availableGroupByFields = commonUtils.ascendSort_ObjectsInArray(template.config.allGroupByFields,"name");
};

Config.parseDashboardConfigFields = function(/*templates, */conf){
	let _conf = conf;
	if(!TypeChecker.isObject(conf)) {
		_conf = {};
	}

	Config.templates.forEach(t => {
		let setting = Config.settings[t.order];

		if(setting.type == 1) {
			Config.parseForTypeOne(t, _conf[setting.key]);
		} else if(setting.type == 2) {
			Config.parseForTypeTwo(t, _conf[setting.key]);
		}
	});
};

export default Config
