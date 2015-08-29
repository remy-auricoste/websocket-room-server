var ws = require("nodejs-websocket");
var Random = require("./Random");
var Room = require("./Room");
var Meta = require("rauricoste-meta");

var clients = {};


var findId = function() {
    var id = Random.nextReadableId();
    return clients[id] ? findId() : id;
}

var SocketServer = function(port) {
    return ws.createServer(function (conn) {
        var send = function(obj, destConn) {
            if (!destConn) {
                destConn = conn;
            }
            destConn.sendText(JSON.stringify(obj));
        };
        var error = function(originalMessage, errorMessage) {
            send({
                originalMessage: originalMessage,
                server: "ERROR",
                error: errorMessage
            });
        }

        var id = findId();
        conn.id = id;
        clients[id] = conn;
        console.log("New connection", conn.id);
        send({
            id: id,
            dest: id,
            server: "ID"
        });

        conn.on("text", function (str) {
            if (str.substring(0, 1) !== "{") {
                console.error("Received", str);
                return;
            }
            var message = JSON.parse(str);
            if (message.server) {
                switch(message.server) {
                    case "JOIN":
                        var roomName = message.args[0];
                        console.log(conn.id+" joined room "+roomName);
                        var room = Room.getRoom(roomName);
                        room.join(conn);
                        send({
                            server: "JOIN",
                            room: roomName,
                            members: Meta.map(room.clients, function(client) {
                                return client.id;
                            })
                        });
                        break;
                    error(message, "unknow command "+message.server);
                }
                return;
            }
            var destClient = clients[message.dest];
            if (!destClient) {
                error(message, "unknown client with id "+message.dest);
                return;
            }
            send(message, destClient);
        })
        conn.on("close", function (code, reason) {
            console.log("Connection closed "+conn.id);
            delete clients[conn.id];
        })
    }).listen(port);
};

module.exports = SocketServer;