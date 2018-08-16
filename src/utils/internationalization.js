
let map = {};

map['case'] = map['cases'] = '实例';
map['variant'] = map['variants'] = '分支路径';
map['date range'] = '日期范围';
map['duration'] = '持续时间';
map['touch points'] = '接触点';
map['activity'] = '活动';
map['activity connection'] = '活动连接';
map['attribute'] = '属性';
map['transaction'] = '实例';
map['filter'] = '过滤';
map['apply filter'] = '过滤';
map['close'] = '关闭';
map['log filters'] = '过滤条件';
map['you can configure a set of filters in this filter setting page and apply as your global filter.\bfilters will help you to have a better focus on the data for analysis.\bplease add your list of filters.'] = '您可以选择一个或者一组过滤条件对原始数据进行过滤.';
map['add filters'] = map['add filter'] = '添加';
map['case count'] = '实例数量';
map['number of cases'] = '实例数量';
map['date'] = '日期';
map['out of date range'] = '超出日期范围';
map['total case'] = '实例总数';
map['total days'] = '总天数';
map['from'] = '从';
map['to'] = '到';
map['second'] = map['seconds'] = '秒';
map['minute'] = map['minutes'] = '分';
map['hour'] = map['hours'] = '小时';
map['day'] = map['days'] = '天';
map['week'] = map['weeks'] = '星期';
map['year'] = map['year'] = '年';
map['median duration'] = '持续时间中值';
map['average duration'] = '持续时间平均值';
map['minimum duration'] = '持续时间最小值';
map['maximum duration'] = '持续时间最大值';
map['please select'] = '请选择';
map['no options to select'] = '没有可选项';
map['all'] = '所有';
map['search'] = '搜索';
map['no selection'] = '没有选择';
map['save as'] = '另存为';
map['saved'] = '已有';
map['history'] = '历史';
map['set as favourite filter'] = '收藏过滤条件';
map['create and filter'] = '创建并过滤';
map['created on'] = '创建于';
map['filter activity by mode'] = '过滤活动';
map['filter connection by mode'] = '过滤连接';
map['linked activity'] = '连接的活动';
map['no linked activities.'] = '没有连接到任何活动.';
map['absolute frequency'] = '绝对频率';
map['case frequency'] = '实例频率';
map['relative frequency'] = '相对频率';
map['maximum repetition'] = '最大重复度';
map['average'] = '平均值';
map['median'] = '中值';
map['maximum'] = '最大值';
map['minimum'] = '最小值';
map['included'] = '包含';
map['excluded'] = '排除';
map['percentage'] = '百分比';
map['case percentage'] = '实例百分比';
map['division'] = '分界';
map['of'] = '的';
map['top ranked variants'] = '分支路径排行';
map['create personalized view'] = '创建个人视图';
map['personalized view'] = '个人视图';
map['system view'] = '系统视图';
map['system analysis dashboard'] = '系统分析报表';
map['personalized analysis dashboard'] = '个人分析报表';
map['cycle time'] = '周期时间';
map['average cycle time'] = '平均周期时间';
map['out of'] = '自';
map['time period'] = '时期';
map['total cases'] = '实例总数';
map['no data to display'] = '没有数据显示';

export default {
	translate: function(word){
		let key = word.trim().toLowerCase();

		if(!map[key]) {
			return word;
		} 
		return map[key];
	}
}