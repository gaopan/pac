import commonGenerators from '../../utils/common-generators.js'

function configurerFactory(){
	var configurer = {};

	function Configurer(){
		this._customActions = [];
	}

	Configurer.prototype.config = function(id, type, title, widthConf, heightConf, transformConf, chartConf,iconPlus){
		this._id = id || commonGenerators.UUIDGenerator.purchase();
		this._type = type;
		this._title = title;
		this._widthConf = widthConf;
		this._heightConf = heightConf;
		this._transformConf = transformConf;
		this._chartConf = chartConf;
		this._iconPlus = iconPlus;
		return this;
	};

	Configurer.prototype.id = function(id){
		this._id = id;
		return this;
	};
	
	Configurer.prototype.type = function(type){
		this._type = type;
		return this;
	};

	Configurer.prototype.title = function(title){
		this._title = title;
		return this;
	};

	Configurer.prototype.width = function(widthConf){
		this._widthConf = widthConf;
		return this;
	};

	Configurer.prototype.height = function(heightConf){
		this._heightConf = heightConf;
		return this;
	};

	Configurer.prototype.transform = function(transformConf){
		this._transformConf = transformConf;
		return this;
	};

	Configurer.prototype.chart = function(chartConf){
		this._chartConf = chartConf;
		return this;
	};

	Configurer.prototype.hideHeader = function(data) {
		this._hideHeader = data;
		return this;
	}

	Configurer.prototype.allowScroll = function(data) {
		this._allowScroll = data;
		return this;
	}
	Configurer.prototype.iconPlus = function(data) {
		this._iconPlus = data;
		return this;
	}

	Configurer.prototype.customActions = function(customActions){
		this._customActions = customActions;
		return this;
	};

	Configurer.prototype.disableRefresh = function(disableRefresh){
		this._disableRefresh = disableRefresh;
		return this;
	};

	Configurer.prototype.disableFullScreen = function(disableFullScreen){
		this._disableFullScreen = disableFullScreen;
		return this;
	};

	Configurer.prototype.react = function(){
		return {
			id: this._id || commonGenerators.UUIDGenerator.purchase(),
			type: this._type,
			title: this._title,
			widthConfig: this._widthConf,
			heightConfig: this._heightConf,
			transformConfig: this._transformConf,
			chartConfig: this._chartConf,
			hideHeader: this._hideHeader,
			allowScroll: this._allowScroll,
			customActions: this._customActions,
			disableRefresh: this._disableRefresh,
			disableFullScreen: this._disableFullScreen
		};
	};

	configurer.defaultConfigurer = function(){
		return new Configurer();
	};

	return configurer;
}

export default configurerFactory()