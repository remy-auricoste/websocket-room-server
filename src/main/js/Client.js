var Client = function(conn) {
    this.conn = conn;
    this.rooms = {};
}
Client.prototype.send = function(object) {
    this.conn.sendText(JSON.stringify(obj));
}
Client.prototype.close = function() {
    for (var key in this.rooms) {
        var room = this.rooms[key];
        room.leave(this);
    }
}


module.exports = Client;