var Meta = require("rauricoste-meta");

var Room = function(name) {
    this.name = name;
    this.clients = {};
}
Room.prototype.join = function(client) {
    var self = this;
    if (!this.clients[client.id]) {
        Meta.map(this.clients, function(clientIte) {
            clientIte.send({
                server: "ROOM_JOIN",
                room: self.name,
                id: client.id
            });
        });
        this.clients[client.id] = client;
    }
    client.rooms[this.name] = this;
}
Room.prototype.leave = function(client) {
    var self = this;
    delete this.clients[client.id];
    if (this.isEmpty()) {
        delete Room.all[this.name];
    } else {
        Meta.map(this.clients, function(clientIte) {
            clientIte.send({
                server: "ROOM_LEAVE",
                room: self.name,
                id: client.id
            });
        })
    }
    delete client.rooms[this.name];
}
Room.prototype.send = function(message) {
    for (var key in this.clients) {
        var client = this.clients[key];
        client.send(message);
    }
}
Room.prototype.isEmpty = function() {
    for (var key in this.clients) {
        return false;
    }
    return true;
}

Room.getRoom = function(name) {
    var room = Room.all[name];
    if (!room) {
        room = new Room(name);
        Room.all[name] = room;
    }
    return room;
};
Room.all = {};

module.exports = Room;

