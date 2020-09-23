const chai = require('chai');
const sinon = require('sinon');
const abuser = require('abuser');

chai.use(require('sinon-chai'));

Object.assign(
	global,
	chai,
	sinon,
	{ abuser }
);
