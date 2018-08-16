var express = require('express')
var bodyParser = require('body-parser');

// default port where dev server listens for incoming traffic
var port = process.env.PORT || 8090

var app = express()

app.use(bodyParser.urlencoded({extended: false}));

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

var uri = 'http://localhost:' + port

module.exports = app.listen(port, function(err) {
  if (err) {
    console.log(err)
    return
  }
})
