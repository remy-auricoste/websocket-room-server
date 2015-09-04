var SocketServer = require("./src/main/js/SocketServer");
var XhrServer = require("./src/main/js/XhrServer");

var port = process.env.PORT || 8001;

new SocketServer(port);
new XhrServer(8002);