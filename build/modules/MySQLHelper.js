var mysql = require('mysql');
var DBConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'leap'
};
var DBHelper = {};

DBHelper.getConnection = function() {
  return mysql.createConnection(DBConfig);
};

DBHelper.query = function(sql, keyMap, cb) {
  var conn = this.getConnection();
  conn.query(sql, function(error, results, fields) {
    if (error) {
      console.log(error);
    } else {
      if (keyMap) {
        var res = [];
        results.map(function(r) {
          var o = {};
          for (key in keyMap) {
            if (keyMap.hasOwnProperty(key)) {
              o[key] = r[keyMap[key]];
            }
          }
          res.push(o);
        });
        cb(res);
      } else {
      	cb(results);
      }
    }
  });
};

module.exports = DBHelper;
