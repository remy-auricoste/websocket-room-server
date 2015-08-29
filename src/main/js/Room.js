var Room = function(name) {
    this.name = name;
    this.clients = {};
}
Room.prototype.join = function(client) {
    if (!this.clients[client.id]) {
        this.clients[client.id] = client;
    }
    client.rooms[this.name] = this;
}
Room.prototype.leave = function(client) {
    delete this.clients[client.id];
    if (this.isEmpty()) {
        delete Room.all[this.name];
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

