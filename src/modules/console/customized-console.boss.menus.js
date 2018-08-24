export default [{
  name: '公司总览',
  childNodes: [{
    name: '公司列表',
    route: 'Customization Company'
  }]
}, {
  name: '月度报表',
  childNodes: [{
    name: '中海庭',
    route: 'Customization Dashboard',
    params: { company: 'zht' },
    childNodes: [{
      name: '总览',
      route: 'Customization Dashboard Overview',
      params: { company: 'zht' }
    }, {
      name: '报告',
      route: 'Customization Dashboard Report',
      params: { company: 'zht' }
    }]
  }]
}, {
  name: '统计报表',
  childNodes: [{
    name: '工时跟踪',
    route: 'Statistic Dashboard',
    params: { type: 'gs' }
  }]
}]
