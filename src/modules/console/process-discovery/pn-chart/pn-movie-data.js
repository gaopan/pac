import common from './pn-movie-lib/common.js'

var _base = {
  connections: [{
    id: "1",
    source: "start",
    target: "created"
  }, {
    id: "2",
    source: "created",
    target: "indexed"
  }, {
    id: "3",
    source: "indexed",
    target: "posted"
  }, {
    id: "4",
    source: "indexed",
    target: "approval-complete"
  }, {
    id: "5",
    source: "posted",
    target: "end"
  }, {
    id: "6",
    source: "approval-complete",
    target: "end"
  }],
  transitions: [{
    id: "start",
    name: "Start Progress",
    nodeType: "START"
  }, {
    id: "end",
    name: "End Progress",
    nodeType: "END"
  }, {
    id: "created",
    name: "Created",
    nodeType: "MIDDLE"
  }, {
    id: "indexed",
    name: "Indexed",
    nodeType: "MIDDLE"
  }, {
    id: "posted",
    name: "Posted",
    nodeType: "MIDDLE"
  }, {
    id: "approval-complete",
    name: "Approval Complete",
    nodeType: "MIDDLE"
  }]
};

var invoiceInfo = [{
  newCases: [{
    connection: "1",
    invoices: [{
    	name: "",
    	date: null
    }, {
    	name: "",
    	date: null
    }]
  }],
  date: null
}, {
  newCases: [{
    connection: "2",
    invoices: [{
    	name: "",
    	date: null
    }, {
    	name: "",
    	date: null
    }]
  }]
}, {
  newCases: [{
    connection: "3",
    invoices: [{
    	name: "",
    	date: null
    }]
  }, {
    connection: "4",
    invoices: [{
    	name: "",
    	date: null
    }]
  }]
}, {
  newCases: [{
    connection: "5",
    invoices: [{
    	name: "",
    	date: null
    }]
  }, {
    connection: "6",
    invoices: [{
    	name: "",
    	date: null
    }]
  }]
}];

function generator() {
  var data = [];
  var cellCount = 30,
    initSize = 2,
    startTime = new Date(2012, 11, 1).getTime(),
    endTime = new Date(2017, 8, 1).getTime(),
    maxTimeDiff = endTime - startTime,
    cellTime = Math.floor(maxTimeDiff / invoiceInfo.length);

  invoiceInfo.forEach(function(item, index) {
  	var time = startTime + cellTime * index;
  	var _cellTime = Math.floor(cellTime / cellCount);
  	var cellDist = 1 / cellCount;
    for (var i = 0; i < cellCount; i++) {
    	var _time = time + _cellTime * i, dist = cellDist * i, newCases = [], base = common.deepClone(_base);
      item.newCases.forEach(function(newCase) {
      	var _invoices = newCase.invoices;
      	var _cellDist = cellDist / _invoices.length;
      	for(var j = 0; j < _invoices.length; j++) {
      		newCases.push({
      			connection: newCase.connection,
      			date: _time,
      			dist: dist + _cellDist * j
      		});
      	}
      });
      base.newCases = newCases;
      base.date = _time;
      data.push(base);
    }
  });

  return data;
}

export default generator()
