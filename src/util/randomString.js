/* globals module */
'use strict';

function randomString(options) {
    const upperCase = options.upperCase || false;
    const lowerCase = options.lowerCase || false;
    const format = options.format || 'AA9A-AA9A';
    const charactersAlpha = options.charactersAlpha || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersNumeric = options.charactersNumeric || '0123456789';
    const charactersAlphaNumeric = options.charactersAlphaNumeric || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const generator = options.generator || function(chSet) { return chSet.charAt(Math.floor(Math.random() * chSet.length)); };

    return {
        generate: () => {
            let string = '';

            for (let i = 0; i < format.length; ++i) {
                switch (format.charAt(i)) {
                    case 'X':
                        string += generator(charactersAlphaNumeric);
                        break;

                    case 'A':
                        string += generator(charactersAlpha);
                        break;

                    case '9':
                        string += generator(charactersNumeric);
                        break;

                    default:
                        string += format.charAt(i);
                        break;
                }
            }

            if (upperCase === lowerCase) {
                return string;
            } else if (upperCase) {
                return string.toUpperCase();
            } else {
                return string.toLowerCase();
            }
        }
    };
}


module.exports = randomString;
