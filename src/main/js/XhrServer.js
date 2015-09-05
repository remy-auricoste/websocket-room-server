var http = require("http");
var XhrConn = require("./XhrConn");
var ConnManager = require("./ConnManager");
require("./String");
var cron = require("./IntervalCall");

var conns = {};
var ttls = {};

var ttl = 20 * 1000;

var closeConn = function(conn) {
    if (!conn) {
        return;
    }
    var id = conn.id;
    conn.onclose();
    delete conns[id];
    delete ttls[id];
}

cron(1000, function() {
    var now = new Date().getTime();
    for (var id in ttls) {
        var ttl = ttls[id];
        if (ttl < now) {
            closeConn(conns[id]);
        }
    }
});

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
        var body = "";
        request.on("data", function(data) {
            body += data;
        });

        request.addListener('end', function () {
            if (path === "/socket") {
                var conn = new XhrConn();
                ConnManager(conn);
                var idMessage = JSON.parse(conn.getMessages()[0]);
                var id = idMessage.id;
                conn.id = id;
                conns[id] = conn;
                ttls[id] = new Date().getTime() + ttl;
                answer({ id: id });
            } else if (path.startsWith("/socket/")) {
                var id = path.substring("/socket/".length);
                var conn = conns[id];
                ttls[id] = new Date().getTime() + ttl;
                if (!conn) {
                    answer({error: "connection with id "+id+" not found"});
                } else if (request.method === "GET") {
                    var messages = conn.getMessages();
                    conn.resetMessages();
                    answer({messages: messages});
                } else if (request.method === "POST") {
                    conn.ontext(body);
                } else if (request.method === "DELETE") {
                    closeConn(conn);
                }
            } else {
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end();
            }
        }).resume();
    }).listen(port);
}

module.exports = XhrServer;