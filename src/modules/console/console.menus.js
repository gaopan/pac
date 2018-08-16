export default [
{
  name: '流程工作台',
  childNodes: [{
      name: '流程探索',
      route: 'Process Explorer',
      childNodes: [{
        name: '流程热力图',
        route: 'Process Flow'
      }, {
        name: '流程比较',
        route: 'Process Comparison'
      }, {
        name: '存为分析报告',
        route: 'Process Analysis'
      }]
    },
    // {
    //  name: '基准流程',
    //  route: 'Recipes',
    //  childNodes: [{
    //    name: '基准流程管理',
    //    route: 'All Recipes'
    //  }]
    // }
  ]
}, 
{
  name: '客户专享',
  childNodes: [{
    name: "客户定制",
    route: "Customization",
    childNodes: [{
      name: '报表定制',
      route: 'Customization Dashboard'
    }]
  }]
}
]
