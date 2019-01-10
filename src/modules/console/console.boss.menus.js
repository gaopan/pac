export default [{
  name: '公司列表',
  route: 'Customization Company'
}, {
  name: '公司月度报表'
}, {
  name: '重大项目列表'
}, {
  name: '统计报表',
  childNodes: [{
    name: '工时跟踪',
    route: 'Statistic Dashboard',
    params: { type: 'gs' }
  }]
}]
