function isWhitespace(ch) {
    return ch === '\t' || ch === '\r' || ch === '\n' || ch === ' ';
}

function isQuote(ch) {
    return ch === '"' || ch === "'";
}

function isDigit(ch) {
    return ch >= '0' && ch <= '9';
}

function isIdentifierStart(ch) {
    return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch === '$' || ch === '_';
}

function isIdentifierPart(ch) {
    return isIdentifierStart(ch) || isDigit(ch);
}

function isOperator(ch) {
    return '+-*/%!|&.,=<>()[]{}?:'.indexOf(ch) > -1;
}

function isSuffixOperator(ch) {
    return '=|&'.indexOf(ch) > -1;
}

/**
 * A lexing function
 * @param input - a string of characters to be tokenised
 * @returns {Array} - an array of token objects with the following properties:
 *  - t: type of token, one of: num (number), idn (identifier), str (string), opr (operator)
 *  - v: value of a token
 *  - f: from where (index) a given token starts in the input
 *  @throws {Error} when an unknown character is detected in the input (ex.: ^)
 */
module.exports = function (initialInput) {

    var input, EOF = String.fromCharCode(0);
    var result = [];
    var i = 0, current, quote; //current is a character that the lexer is currently looking at
    var from, value;

    if (typeof initialInput === 'string') {

        //append special EOF token to avoid constant checks for the input end
        input = initialInput + EOF;

        current = input.charAt(0);
        while (current !== EOF) {

            //reset variables responsible for accumulating results
            from = i;
            value = '';

            if (isWhitespace(current)) {

                current = input.charAt(++i); //skip

            } else if (isOperator(current)) {

                do {
                    value += current;
                    current = input.charAt(++i);

                } while (isSuffixOperator(current));

                result.push({t: 'opr', v: value, f: from});

            } else if (isIdentifierStart(current)) {

                do {
                    value += current;
                    current = input.charAt(++i);

                } while (isIdentifierPart(current));

                result.push({t: 'idn', v: value, f: from});

            } else if (isQuote(current)) {

                quote = current;
                current = input.charAt(++i); //skip the initial quote

                while (current !== quote && current !== EOF) {

                    if (current === '\\' && input.charAt(i + 1) === quote) {
                        value += quote;
                        current = input.charAt(++i);
                    } else {
                        value += current;
                    }
                    current = input.charAt(++i);
                }

                if (isQuote(current)) {
                    result.push({t: 'str', v: value, f: from});
                    current = input.charAt(++i); //consume the closing quote
                } else {
                    throw new Error('Error parsing "' + initialInput + '": unfinished string at ' + from);
                }

            } else if (isDigit(current)) {

                do {
                    value += current;
                    current = input.charAt(++i);

                } while (isDigit(current) || current === '.');

                result.push({
                    t: 'num',
                    v: value.indexOf('.') > -1 ? parseFloat(value) : parseInt(value),
                    f: from});

            } else {
                throw new Error('Error parsing "' + initialInput + '": unknown token ' + current + ' at ' + from);
            }
        }
    }

    return result;
};