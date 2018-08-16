var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var DBHelper = {};

var sqlServerConfig = {
  userName: 'root',
  password: '',
  server: 'localhost',
  // When you connect to Azure SQL Database, you need these next options.  
  // options: { encrypt: true, database: 'leap' }
  options: {database: 'leap'}
};

function getConnection(){
	return new Connection(sqlServerConfig);
};

DBHelper.query = function(sql, params, cb){
  var conn = getConnection();
  conn.on('connect', function(err){
  	console.log(err);
  	console.log("Connected!");
  	executeStatement(cb);
  });

  function executeStatement(cb){
  	var request = new Request(sql, function(err){
  		if(err) {
  			console.log(err);
  		}
  	});
  	var result = [];
  	request.on('row', function(columns){
  		var row = [];
  		columns.forEach(function(column){
  			console.log(column);
  			row.push(column.value);
  		});
  		result.push(row);
  	});
  	request.on('done', function(rowCount, more, rows){
  		console.log(rows);
  		cb(result);
  	});
  	conn.execSql(request);
  }
};

module.exports = DBHelper;