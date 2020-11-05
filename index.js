var express = require('express');
var app = express();

//get server.js functions
var server = require("./server");

var port = process.env.PORT || 8000;

Accounts = server.getAllAccounts();

app.get('/', function(request, response){
  console.log(request.body);      // your JSON
   response.send(request.body);    // echo the result back
});

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);