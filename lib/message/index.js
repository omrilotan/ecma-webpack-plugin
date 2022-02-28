const { red, yellow } = require('chalk');

/**
 * Convert error object to a message
 * @param  {object} errors Key value pair of {[filename]: content}
 * @return {string}
 */
module.exports = errors => errors
	.map(
		({ name, message, content }) => [
			red('Found parsing errors in '),
			yellow(name),
			':\n- ',
			message,
			content && '\n',
			content,
		].filter(Boolean).join(''),
	).join('\n');

