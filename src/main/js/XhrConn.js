XhrConn = function() {
    this.pendingMessages = [];
}
XhrConn.prototype.sendText = function(str) {
    this.pendingMessages.push(str);
}
XhrConn.prototype.getMessages = function() {
    return this.pendingMessages;
}
XhrConn.prototype.resetMessages = function() {
    this.pendingMessages = [];
}
XhrConn.prototype.on = function(name, fonction) {
    this["on"+name] = fonction;
}

module.exports = XhrConn;