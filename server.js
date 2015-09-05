var main = require("./src/main/js/main");

var port = process.env.PORT || 8001;

new main.SocketServer(port);