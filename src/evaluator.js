function forgivingPropertyAccessor(left, right) {
    return typeof left === 'undefined' || left === null ? undefined : left[right];
}

var UNARY_OPERATORS = {
    '!': function (right) { return !right; },
    '-': function (right) { return -right; },
    '[': function (right) { return right; }, //array literal
    '{': function (right) { //object literal

        var result = {}, keyVal;
        for (var i = 0; i < right.length; i++) {
            keyVal = right[i];
            result[keyVal.k] = keyVal.v;
        }

        return result;
    }
};

var BINARY_OPERATORS = {
    '+': function (left, right) { return left + right; },
    '-': function (left, right) { return left - right; },
    '*': function (left, right) { return left * right; },
    '/': function (left, right) { return left / right; },
    '%': function (left, right) { return left % right; },
    '<': function (left, right) { return left < right; },
    '>': function (left, right) { return left > right; },
    '>=': function (left, right) { return left >= right; },
    '<=': function (left, right) { return left <= right; },
    '==': function (left, right) { return left == right; },
    '!=': function (left, right) { return left != right; },
    '===': function (left, right) { return left === right; },
    '!==': function (left, right) { return left !== right; },
    '||': function (left, right) { return left || right; },
    '&&': function (left, right) { return left && right; },
    '(': function (left, right) { //function call on a scope
        return left.apply(left, right);
    },
    '.': forgivingPropertyAccessor,
    '[': forgivingPropertyAccessor
};

var TERNARY_OPERATORS = {
    '(': function (target, name, args) { //function call on an object
        return typeof target === 'undefined' || target === null ?
            undefined : target[name].apply(target, args);
    },
    '?': function (test, trueVal, falseVal) { return test ? trueVal : falseVal; },
    '|': function (input, pipeFn, args) { return pipeFn.apply(pipeFn, [input].concat(args)); } //pipe (filter)
};

module.exports = function getTreeValue(tree, scope) {

    var operatorFn, result;
    var parsedVal, argExp, arrayResult;

    if (tree instanceof Array) {

        if (tree.length > 0) {
            result = new Array(tree.length);
            for (var i = 0; i < tree.length; i++) {
                argExp = tree[i];
                arrayResult = parsedVal = getTreeValue(argExp, scope);
                if (argExp.key) {
                    arrayResult = {
                        k: argExp.key,
                        v: parsedVal
                    };
                }
                result[i] = arrayResult;
            }
        } else {
            result = [];
        }
        return result;
    }

    if (tree.a === 'literal') {
        result = tree.v;
    } else if (tree.a === 'idn') {
        result = scope[tree.v];
    } else if (tree.a === 'unr' && UNARY_OPERATORS[tree.v]) {
        operatorFn = UNARY_OPERATORS[tree.v];
        result = operatorFn(getTreeValue(tree.l, scope));
    } else if (tree.a === 'bnr' && BINARY_OPERATORS[tree.v]) {
        operatorFn = BINARY_OPERATORS[tree.v];
        result = operatorFn(getTreeValue(tree.l, scope), getTreeValue(tree.r, scope));
    } else if (tree.a === 'tnr' && TERNARY_OPERATORS[tree.v]) {
        operatorFn = TERNARY_OPERATORS[tree.v];
        result = operatorFn(getTreeValue(tree.l, scope), getTreeValue(tree.r, scope), getTreeValue(tree.othr, scope));
    } else {
        throw new Error('Unknown tree entry of type "'+ tree.a +' and value ' + tree.v + ' in:' + JSON.stringify(tree));
    }

    return result;
};