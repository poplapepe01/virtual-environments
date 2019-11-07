import assert = require('assert');
import mocha = require("mocha");
import lib = require('./lib');

describe('Lib Tests', function () {
    before(() => {
    });

    after(() => {
    });

    it('constructs', () => {
        this.timeout(1000);

        assert(lib.Add(5,3) == 8, 'lib can add');
    });
});
