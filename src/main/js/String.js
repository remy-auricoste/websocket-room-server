String.prototype.startsWith = function(start) {
    return this.length >= start.length && this.substring(0, start.length) === start;
}