var assets = require('./index');
var index_1 = require('./index');
var File = require('vinyl');
var chai = require('chai');
var expect = chai.expect;
var jspmMock = {
    normalize: function (packageName) {
        return new Promise(function (resolve, reject) {
            resolve('./fixtures/demo');
        });
    }
};
describe('gulp-jspm-assets', function () {
    beforeEach(function () { return index_1.JspmAssetStream.jspm = jspmMock; });
    it('should expose an api', function () {
        expect(assets.jspmAssets).to.exist;
        expect(assets.JspmAssetStream).to.exist;
    });
    it('should return a new instance of JspmAssetStream', function () {
        expect(index_1.jspmAssets('demo', 'file1.js')).to.be.instanceOf(index_1.JspmAssetStream);
    });
    it('should return a file stream from a jspm package and glob', function (done) {
        var stream = index_1.jspmAssets('demo', 'file1.js');
        stream.once('error', function () {
            console.log(arguments);
            done();
        });
        stream.on('data', function (file) {
            console.log('data');
            console.log(arguments);
            expect(file).to.be.instanceOf(File);
        });
        // stream.once('end', done);
        // stream.read();
    });
});
