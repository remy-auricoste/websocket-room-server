var SocketServer = require("./src/main/js/SocketServer");

var port = process.env.PORT || 8001;

new SocketServer(port);