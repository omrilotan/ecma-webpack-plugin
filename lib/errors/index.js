const { parse } = require('acorn');
const extension = require('../extension');

/**
 * Maximum number of characters we want visibile before the issue location
 * @type {Number}
 */
const MAX_CHARS_BEFORE = 20;

/**
 * Maximum number of characters we want visibile after the issue location
 * @type {Number}
 */
const MAX_CHARS_AFTER = 30;

/**
 * String we use to indicate that the line has been truncated
 * @type {String}
 */
const ELLIPSIS = '...';

/**
 * Length of the ellipsis
 * @type {Number}
 */
const ELLIPSIS_LENGTH = ELLIPSIS.length;

/**
 * Map errors
 * @param  {Object} compilation.assets
 * @param  {Object} options.extensions
 * @return {Object}
 */
module.exports = (
	{ assets } = {},
	{ extensions, parser } = {},
) => Object.entries(assets)
	.reduce(
		(accumulator, [ name, { _value: content } ]) => {
			if (!extensions.includes(extension(name))) {
				return accumulator;
			}

			try {
				parse(content, parser);
			} catch ({ message, loc: { line, column } = {}, raisedAt }) {
				const issue = { name, message };
				if (line && column) {
					const lineOfCode = (content || '').split('\n')[line - 1];
					const [ prefix, startFrom, indentation ] = column > MAX_CHARS_BEFORE
						? [ ELLIPSIS, column - MAX_CHARS_BEFORE + ELLIPSIS_LENGTH, MAX_CHARS_BEFORE ]
						: [ '', 0, raisedAt || column ]
					;
					const [ suffix, endAt ] = lineOfCode.length - column > MAX_CHARS_AFTER
						? [ ELLIPSIS, column + MAX_CHARS_AFTER - ELLIPSIS_LENGTH ]
						: [ '', lineOfCode.length ]
					;
					issue.content = [
						prefix,
						lineOfCode.substring(startFrom, endAt),
						suffix,
						'\n',
						' '.repeat(indentation),
						'^',
					].join('');
				}
				accumulator.push(issue);
			}

			return accumulator;
		},
		[],
	);
