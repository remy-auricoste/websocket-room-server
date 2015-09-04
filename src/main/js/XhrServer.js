var http = require("http");
var XhrConn = require("./XhrConn");
var ConnManager = require("./ConnManager");
require("./String");

var conns = {};

var XhrServer = function(port) {
    console.log("starting http XhrServer on port "+port);
    http.createServer(function (request, response) {
        var path = request.url;
        var answer = function(str) {
            response.writeHead(200, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
            });
            response.end(typeof str === "object" ? JSON.stringify(str) : str);
        }

        request.addListener('end', function () {
            if (path === "/socket") {
                var conn = new XhrConn();
                ConnManager(conn);
                var idMessage = JSON.parse(conn.getMessages()[0]);
                var id = idMessage.id;
                conn.id = id;
                conns[id] = conn;
                answer({ id: id });
            } else if (path.startsWith("/socket/")) {
                var id = path.substring("/socket/".length);
                var conn = conns[id];
                if (!conn) {
                    answer({error: "connection with id "+id+" not found"});
                } else {
                    var messages = conn.getMessages();
                    conn.resetMessages();
                    answer({messages: messages});
                }
            } else {
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end();
            }
        }).resume();
    }).listen(port);
}

module.exports = XhrServer;