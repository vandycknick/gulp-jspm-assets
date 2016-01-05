import * as assets from './index';
import { JspmAssetStream, jspmAssets, IJavascriptPackageManager } from './index';
import * as File from 'vinyl';
import * as chai from 'chai';

let expect: Chai.ExpectStatic = chai.expect;

let jspmMock: IJavascriptPackageManager = {
  normalize(packageName: string): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      resolve(__dirname + '/../fixtures/demo');
    });
  }
};

describe('gulp-jspm-assets', () => {

  beforeEach(() => JspmAssetStream.jspm = jspmMock);

  it('should expose an api', () => {
    expect(assets.jspmAssets).to.exist;
    expect(assets.JspmAssetStream).to.exist;
  });

  it('should return a new instance of JspmAssetStream', () => {
    expect(jspmAssets('demo', 'file1.js')).to.be.instanceOf(JspmAssetStream);
  });

  it('should throw an error when options parameter is incorrect', () => {
    function errorFactory(): void {
        let stream = new JspmAssetStream(<any>{});
    }
    expect(errorFactory).to.throw('Provide a jspm package name and filepath or glob!');
  });

  it('should return a file stream for the requested assets', (done: any) => {
    let stream: JspmAssetStream = jspmAssets('demo', 'file1.js');
    stream.on('error', done);
    stream.on('data', function(file: any): void {
      expect(file).to.be.instanceOf(File);
      expect(file.contents.toString()).to.equal(`var file = '1';`);
      done();
    });
  });

  it('should return a vinyl file stream from a jspm package and glob', (done: any) => {
    let stream: JspmAssetStream = jspmAssets('demo', 'file1.js');
    stream.on('error', done);
    stream.on('data', function(file: any): void {
      expect(file).to.be.instanceOf(File);
      expect(file.contents).to.be.instanceOf(Buffer);
      done();
    });

  });

  it('should emit an error when no files are found', (done: any) => {
    let stream: JspmAssetStream = jspmAssets('demo', 'idonotexist.js');
    stream.on('error', function(error: Error): void {
      expect(error).to.exist;
      done();
    });
    stream.read();
  });

});
