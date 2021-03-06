var http = require("http");
var XhrConn = require("./XhrConn");
var ConnManager = require("./ConnManager");
require("./String");
var cron = require("./IntervalCall");

var cache = {};

var ttl = 20 * 1000;

var createConn = function() {
    var conn = new XhrConn();
    ConnManager(conn);
    var idMessage = JSON.parse(conn.getMessages()[0]);
    id = idMessage.id;
    conn.id = id;
    cache[id] = {
        conn: conn,
        ttl: new Date().getTime() + ttl
    };
    return conn;
}

var closeConn = function(conn) {
    if (!conn) {
        return;
    }
    var id = conn.id;
    conn.onclose();
    delete cache[id];
}

cron(1000, function() {
    var now = new Date().getTime();
    for (var id in cache) {
        var object = cache[id];
        var ttl = object.ttl;
        if (ttl < now) {
            closeConn(object.conn);
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
                'Access-Control-Allow-Origin': request.headers.origin
            });
            response.end(typeof str === "object" ? JSON.stringify(str) : str);
        }
        var body = "";
        request.on("data", function(data) {
            body += data;
        });

        request.addListener('end', function () {
            if (path === "/socket") {
                var conn = createConn();
                var id = conn.id;
                answer({ id: id });
            } else if (path.startsWith("/socket/")) {
                var id = path.substring("/socket/".length);
                var object = cache[id];
                var conn = object && object.conn;
                if (object) {
                    object.ttl = new Date().getTime() + ttl
                }
                if (!conn) {
                    conn = createConn();
                    answer({newId: conn.id});
                } else if (request.method === "GET") {
                    var messages = conn.getMessages();
                    conn.resetMessages();
                    answer({messages: messages});
                } else if (request.method === "POST") {
                    conn.ontext(body);
                    answer({});
                } else if (request.method === "DELETE") {
                    closeConn(conn);
                    answer({});
                }
            } else {
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end();
            }
        }).resume();
    }).listen(port);
}

module.exports = XhrServer;