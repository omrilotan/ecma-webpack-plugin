const { parse } = require('acorn');
const extension = require('../extension');

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
			} catch (error) {
				const { message, loc: { line, column } = {}, raisedAt } = error;
				const issue = { name, message };
				if (line && column) {
					const lineOfCode = (content || '').split('\n')[line - 1];
					const [ prefix, startFrom, indentation ] = column > 20
						? [ '...', column - 17, 20 ]
						: [ '', 0, raisedAt || column ]
					;
					const [ suffix, endAt ] = lineOfCode.length - column > 30
						? [ '...', column + 27 ]
						: [ '', lineOfCode.length ]
					;
					const snippet = lineOfCode.substring(startFrom, endAt);
					issue.content = [
						prefix,
						snippet,
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
