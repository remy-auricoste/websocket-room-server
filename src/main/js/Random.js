
var readableAlphabet = "abcdefghjkmnopqrstuvwxyz0987654321";
module.exports = {
    nextNumber: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    nextInt: function(min, max /* inclusives */) {
        return Math.floor(this.nextNumber(min, max + 1));
    },
    nextChar: function(alphabet) {
        return alphabet.charAt(this.nextInt(0, alphabet.length - 1));
    },
    nextString: function(alphabet, length) {
        if (length === undefined) {
            length = 32;
        }
        var result = "";
        for (var i=0;i<length;i++) {
            result += this.nextChar(alphabet);
        }
        return result;
    },
    nextReadableId: function(length) {
        return this.nextString(readableAlphabet, length);
    }
}