var ws = require("nodejs-websocket");
var Random = require("./Random");
var Room = require("./Room");
var Client = require("./Client");
var Meta = require("rauricoste-meta");

var clients = {};
var findId = function() {
    var id = Random.nextReadableId();
    return clients[id] ? findId() : id;
}

var SocketServer = function(port) {
    console.log("starting ws server on port "+port);
    return ws.createServer(function (conn) {
        var client = new Client(conn);
        var send = function(obj, destClient) {
            if (!destClient) {
                destClient = client;
            }
            destClient.send(obj);
        };
        var error = function(originalMessage, errorMessage) {
            send({
                originalMessage: originalMessage,
                server: "ERROR",
                error: errorMessage
            });
        }

        var id = findId();
        client.id = id;
        clients[id] = client;
        console.log("New connection", id);
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
                        console.log(client.id+" joined room "+roomName);
                        var room = Room.getRoom(roomName);
                        room.join(client);
                        send({
                            server: "JOIN",
                            room: roomName,
                            members: Meta.map(room.clients, function(client) {
                                return client.id;
                            })
                        });
                        break;
                    error(message, "unknown command "+message.server);
                }
                return;
            }
            if (message.room) {
                Room.getRoom(message.room).send(message);
                return;
            }
            var destClient = clients[message.dest];
            if (!destClient) {
                error(message, "unknown client with id "+message.dest);
                return;
            }
            send(message, destClient);
        });
        conn.on("close", function (code, reason) {
            console.log("Connection closed "+client.id);
            client.close();
            delete clients[client.id];
        });
        conn.on("error", function(err) {
            console.error("error");
            console.error(err);
        });
    }).listen(port);
};

module.exports = SocketServer;