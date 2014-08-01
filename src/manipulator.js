var ast = require('./parser');

var UNARY_OPERATORS = {
    '!': function (right) { return !right; },
    '-': function (right) { return -right; },
    '[': function (right) { return right; }, //array literal
    '{': function (right) { //object literal
        return right.reduce(function(fullObj, keyVal){
            fullObj[keyVal.k] = keyVal.v;
            return fullObj;
        }, {})
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
    '.': function (left, right) { return left[right]; },
    '[': function (left, right) { return left[right]; },
    '(': function (left, right) { return left.apply(left, right); }
};

var TERNARY_OPERATORS = {
    '(': function (target, name, args) { return (target[name]).apply(target, args); }, //function call
    '?': function (test, trueVal, falseVal) { return test ? trueVal : falseVal; },
    '|': function (input, pipeFn, args) { return pipeFn.apply(pipeFn, [input].concat(args)); } //pipe (filter)
};

function getTreeValue(tree, scope) {

    var operatorFn, result;

    if (tree instanceof Array) {
        return tree.map(function (argExp) {
            var parsedVal, result;
            result = parsedVal = getTreeValue(argExp, scope);
            if (argExp.key) {
                result = {
                    k: argExp.key,
                    v: parsedVal
                };
            }
            return result;
        })
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
}

/**
 * Expressions handling util that can evaluate and manipulate
 * JavaScript-like expressions
 *
 * @param {String} input - expression to handle
 * @return {Object} an object with the methods described below
 */
module.exports = function(input) {
    var tree = ast(input);

    return {
        /**
         * Evaluates an expression against a scope
         * @param scope
         * @return {*} - value of an expression in a given scope
         */
        getValue: function(scope) {
            return getTreeValue(tree, scope)
        },
        /**
         * Sets value of an expression on a scope. Not all expressions
         * are assignable.
         * @param scope - scope that should be modified
         * @param {*} a new value for a given expression and scope
         */
        setValue: function(scope, newValue) {
            //AST needs to have an identifier or binary . at the top to be assignable
            if (tree.a === 'idn') {
                scope[tree.v] = newValue;
            } else if (tree.a === 'bnr' && tree.v === '.') {
                getTreeValue(tree.l, scope)[tree.r.v] = newValue;
            }
        }
    };
};