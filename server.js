var main = require("./src/main/js/main");

var port = process.env.PORT || 8001;
var serverFactory = process.env.PROTOCOL === "HTTP" ? main.XhrServer : main.SocketServer;

new serverFactory(port);