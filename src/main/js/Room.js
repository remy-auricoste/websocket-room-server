var Room = function(name) {
    this.name = name;
    this.clients = {};
}
Room.prototype.join = function(client) {
    if (!this.clients[client.id]) {
        this.clients[client.id] = client;
    }
}
Room.prototype.leave = function(client) {
    delete this.clients[client.id];
    if (!this.clients.length) {
        delete Room.all[this.name];
    }
}
Room.prototype.send = function(message) {
    for (var key in this.clients) {
        var client = this.clients[key];
        // TODO send message
    }
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

