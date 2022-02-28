const { readFileSync } = require('fs');
const { join } = require('path');
const abuser = require('abuser');
const { spy } = require('sinon');
const { expect } = require('chai');

const { clean } = abuser(__filename);
const ES5 = 'function fn() { return null }';
const ES6 = 'const fn = () => null;';
const ES6file = join(__dirname, '../../fixtures/es6.js');

describe('ecma-webpack-plugin/lib/errors', () => {
	let errors;
	let acorn;

	before(() => {
		clean('.');
		acorn = require('acorn');
		spy(acorn, 'parse');
		errors = require('.');
	});
	afterEach(() => acorn.parse.resetHistory());
	after(() => clean('.'));

	it('Should call on parse function', () => {
		errors({
			assets: { 'filename.js': { _value: ES5 } },
		}, {
			parser: { ecmaVersion: '5' },
			extensions: [ 'js' ],
		});

		expect(acorn.parse).to.have.been.calledWith(ES5, { ecmaVersion: '5' });
	});
	it('Should try to parse for each file', () => {
		errors({
			assets: {
				'filename.js': { _value: ES5 },
				'filename2.js': { _value: ES5 },
				'filename3.js': { _value: ES5 },
			},
		}, {
			parser: { ecmaVersion: '5' },
			extensions: [ 'js' ],
		});

		expect(acorn.parse).to.have.been.calledThrice;
	});
	it('Should not call on parse for irrelevant files', () => {
		errors({
			assets: {
				'filename.js': { _value: ES5 },
				'filename2.js': { _value: ES5 },
				'filename3.svg': { _value: '<svg/>' },
			},
		}, {
			parser: { ecmaVersion: '5' },
			extensions: [ 'js' ],
		});

		expect(acorn.parse).to.have.callCount(2);
	});
	it('Should collect errors', () => {
		const results = errors({
			assets: {
				'filename.js': { _value: ES6 },
				'filename1.js': { _value: ES6 },
				'filename2.js': { _value: ES6 },
				'filename3.js': { _value: ES6 },
			},
		}, {
			parser: { ecmaVersion: '5' },
			extensions: [ 'js' ],
		});

		expect(results).to.have.lengthOf(4);
	});
	it('Should inform messages for each file', () => {
		const [ first, second ] = errors({
			assets: {
				'filename.js': { _value: ES6 },
				'filename1.js': { _value: 'var fn = () => null;' },
			},
		}, {
			parser: { ecmaVersion: '5' },
			extensions: [ 'js' ],
		});

		expect(first.name).to.equal('filename.js');
		expect(first.message).to.include('Unexpected token (1:6)');
		expect(second.name).to.equal('filename1.js');
		expect(second.message).to.include('Unexpected token');
	});
	it('Should point to the error', () => {
		const [ { content } ] = errors({
			assets: {
				[ES6file]: { _value: readFileSync(ES6file).toString() },
			},
		}, {
			parser: { ecmaVersion: '5' },
			extensions: [ 'js' ],
		});
		expect(content).to.include('const a').and.to.include('^');
		expect(content.split('\n')[0]).to.be.lengthOf(50);
	});
});
