import * as assets from '../src/index';
import { JspmAssetStream, jspmAssets, IJavascriptPackageManager } from '../src/index';
import * as File from 'vinyl';
import { Readable } from 'stream';

let jspmMock: IJavascriptPackageManager = {
  normalize(packageName: string): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      resolve(__dirname + '/../fixtures/demo');
    });
  }
};

function noOp(): void { // no op function
}

class UselessStream extends Readable {
  private data: any;
  private times: number;
  constructor(data: any, times: number = 1) {
    super({ objectMode: true });
    this.data = data;
    this.times = times;
  }

  public _read(): void {
    for (let i: number = 0; i < this.times; i++) {
      this.push(this.data);
    }
    this.push(null);
  }
}

describe('gulp-jspm-assets', () => {

  beforeEach(() => JspmAssetStream.jspm = jspmMock);

  it('should expose an api', () => {
    expect(assets.jspmAssets).to.exist;
    expect(assets.JspmAssetStream).to.exist;
  });

  it('should return a new instance of JspmAssetStream', () => {
    expect(jspmAssets('demo', 'file1.js')).to.be.instanceOf(JspmAssetStream);
  });

  it('should throw an error when wrong parameters are given', () => {

    function noParamError(): void {
      jspmAssets.call(null);
    }

    function emptyObjectError(): void {
      jspmAssets.call(null, {});
    }

    function wrongParameterError(): void {
      jspmAssets.call(null, 1, 1);
    }

    expect(noParamError).to.throw('Parameters not provided in the correct format!');
    expect(emptyObjectError).to.throw('No packages or globs paths are provided in the config object!');
    expect(wrongParameterError).to.throw('Parameters not provided in the correct format!');
  });

  it('should throw an error when options parameter is incorrect', () => {
    function errorFactory(): void {
        let stream: JspmAssetStream = new JspmAssetStream(<any>{});
        stream.on('data', noOp);
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

  it('should accept a config object and merge the streams', (done: any) => {
    let counter: number = 0;
    let stream: JspmAssetStream = jspmAssets({
      'demo': 'file1.js',
      'demo2': 'file2.js'
    });

    stream.on('end', () => {
      expect(counter).to.equal(2);
      done();
    });
    stream.on('error', done);
    stream.on('data', () => counter++);
  });

  it('should emit an error when no files are found', (done: any) => {
    let stream: JspmAssetStream = jspmAssets('demo', 'idonotexist.js');
    stream.on('error', function(error: Error): void {
      expect(error).to.exist;
      done();
    });
    stream.read();
  });

  it('should append jspm package assets from a piped stream', (done: any) => {
    let stream1: Readable = new UselessStream({ file: 'whatever.js' });
    let assets: JspmAssetStream = jspmAssets('demo', 'file1.js');
    let counter: number = 0;
    stream1.pipe(assets);

    assets.on('end', () => {
      expect(counter).to.equal(2);
      done();
    });
    assets.on('error', done);

    assets.on('data', () => counter++);

  });

  it('should append jspm package assets from a piped stream and preserve all the original data', (done: any) => {
    let stream1: Readable = new UselessStream({ file: 'whatever.js' }, 2);
    let assets: JspmAssetStream = jspmAssets('demo', 'file1.js');
    let counter: number = 0;
    stream1
      .pipe(assets)
      .on('data', () => counter++)
      .on('error', done)
      .on('end', () => {
        expect(counter).to.equal(3);
        done();
      });

  });

});
