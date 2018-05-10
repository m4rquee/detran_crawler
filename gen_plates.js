const _ = require('lodash');
const { cartesianProduct } = require('js-combinatorics');

Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

const digs = _.range(1, 9999 + 1).map(d => d.pad(4));
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase().split('');

const joinAll = m => m.map(l => l.reduce((a, x) => a + x));

function gen_plates() {
    let letters = cartesianProduct(chars, chars, chars);
    letters = joinAll(letters);

    return cartesianProduct(letters, digs);
}

module.exports = {
    gen_plates
}