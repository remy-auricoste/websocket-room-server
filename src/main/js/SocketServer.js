var ws = require("nodejs-websocket");
var ConnManager = require("./ConnManager");
var Meta = require("rauricoste-meta");

var SocketServer = function(port) {
    console.log("starting ws server on port "+port);
    return ws.createServer(function (conn) {
        ConnManager(conn);
    }).listen(port);
};

module.exports = SocketServer;