module.exports = function getIdentifiers(tree) {

    var partialResult;

    if (tree instanceof Array) {
        partialResult = [];
        if (tree.length > 0) {
            for (var i = 0; i < tree.length; i++) {
                partialResult = partialResult.concat(getIdentifiers(tree[i]));
            }
        }
        return partialResult;
    }

    if (tree.a === 'literal') {
        return [];
    } else if (tree.a === 'idn') {
        return [tree.v];
    } else if (tree.a === 'unr') {
        return getIdentifiers(tree.l);
    } else if (tree.a === 'bnr') {
        return getIdentifiers(tree.l).concat(getIdentifiers(tree.r));
    } else if (tree.a === 'tnr') {
        return getIdentifiers(tree.l).concat(getIdentifiers(tree.r))
            .concat(getIdentifiers(tree.othr));
    } else {
        throw new Error('unknown entry' + JSON.stringify(tree));
    }
};