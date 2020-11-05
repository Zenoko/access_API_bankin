var express = require('express');
var app = express();

//get server.js functions
var server = require("./server");

var port = process.env.PORT || 8000;

server.getAllAccounts();

// start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);