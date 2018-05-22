const _ = require('lodash');
const { cartesianProduct } = require('js-combinatorics');

Number.prototype.pad = size => {
    let s = String(this);
    while (s.length < size) {
        s = "0" + s;
    }

    return s;
}

const digs = _.range(1, 9999 + 1).map(d => d.pad(4));
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toLowerCase().split('');

function genAllPlates() {
    let letters = cartesianProduct(chars, chars, chars);
    letters.lazyMap(l => l.join(''));

    return cartesianProduct(letters, digs);
}

function genPlatesRange(start, end) {
    start = start.toLowerCase().split('').map((v, i, a) => a.charCodeAt(i));
    end = end.toLowerCase().split('');


}

module.exports = {
    genAllPlates,
    genPlatesRange
}