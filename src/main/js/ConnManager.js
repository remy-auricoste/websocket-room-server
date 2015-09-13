var Random = require("rauricoste-random");
var Client = require("./Client");
var Room = require("./Room");

var toArray = function(object) {
    var result = [];
    for (var key in object) {
        result.push(key);
    }
    return result;
}

var clients = {};
var findId = function() {
    var id = Random.nextReadableId();
    return clients[id] ? findId() : id;
}

module.exports = function(conn) {
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
                        members: toArray(room.clients)
                    });
                    break;s
                case "LEAVE":
                    var roomName = message.args[0];
                    console.log(client.id+" joined room "+roomName);
                    var room = Room.getRoom(roomName);
                    room.leave(client);
                    break;
                case "PING":
                    break;
                default:
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

}