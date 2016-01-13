import { Readable } from 'stream';
import {
  MergeStream,
  mergeStream
} from '../src/utils';

class UseLessStream extends Readable {
  private counter: number = 0;
  constructor() {
    super({ objectMode: true });
  }
  public _read(): void {
    this.push(this.counter++);
    this.push(null);
  }
}

class UseLessStringStream extends Readable {
  private msg: string = '';
  constructor(msg?: string) {
    super({ objectMode: true });
    this.msg = msg || '';
  }
  public _read(): void {
    this.push(this.msg);
    this.push(null);
  }
}

describe('utils', () => {

  it('should expose an api', () => {
    expect(MergeStream).to.exist;
    expect(mergeStream).to.exist;
  });

  describe('MergeStream', () => {
    let stream1: Readable;
    let stream2: Readable;
    let stream3: Readable;
    let cnt: number;

    beforeEach(() => {
      stream1 = new UseLessStream();
      stream2 = new UseLessStream();
      stream3 = new UseLessStream();
      cnt = 0;
    });

    it('exposes an api', () => {
      let merged: MergeStream = mergeStream(stream1, stream2);
      expect(merged.add).to.exist;
      expect(merged.remove).to.exist;
      expect(merged.isEmpty).to.exist;
    });

    it('should merge multiple streams into one', (done: any) => {
      let merged: MergeStream = mergeStream(stream1, stream2);

      merged.on('data', () => {
        cnt++;
      });

      merged.on('end', () => {
        expect(cnt).to.equal(2);
        done();
      });

    });

    it('should be possible to add extra streams', (done: any) => {
      let merged: MergeStream = mergeStream(stream1, stream2);

      expect(merged.length()).to.equal(2);

      merged.add(stream3);

      expect(merged.length()).to.equal(3);

      merged.on('data', () => {
        cnt++;
      });

      merged.on('end', () => {
        expect(cnt).to.equal(3);
        done();
      });

    });

    it('should be possible to remove a stream', (done: any) => {
      let merged: MergeStream = mergeStream(stream1, stream2);

      expect(merged.length()).to.equal(2);

      merged.remove(stream2);

      expect(merged.length()).to.equal(1);

      merged.on('data', () => {
        cnt++;
      });

      merged.on('end', () => {
        expect(cnt).to.equal(1);
        done();
      });
    });

    it('should be possible to determine if stream is empty', (done:any) => {
      let merged: MergeStream = mergeStream(stream1, stream2);

      merged.on('data', () => cnt++);

      merged.on('end', () => {
        expect(merged.isEmpty()).to.be.true;
        done();
      });
    });

    it('should be possible to remove and reattach streams', (done: any) => {
      let merged: MergeStream = mergeStream(stream1, stream2);

      expect(merged.length()).to.equal(2);

      merged.remove(stream2);

      expect(merged.length()).to.equal(1);

      merged.add(stream3);
      merged.remove(stream1);
      merged.add(stream2);

      expect(merged.length()).to.equal(2);

      merged.on('data', () => {
        cnt++;
      });

      merged.on('end', () => {
        expect(cnt).to.equal(2);
        done();
      });
    });

    it('should emit the correct data from the merged streams', (done: any) => {
      let string1: UseLessStringStream = new UseLessStringStream('hello');
      let string2: UseLessStringStream = new UseLessStringStream('streams');
      let merged: MergeStream = mergeStream(string1, string2);
      let result: string[] = [];

      merged.on('data', (msg: string) => {
        result.push(msg[0]);
      });

      merged.on('end', () => {
        expect(result[0]).to.equal('hello');
        expect(result[1]).to.equal('streams');
        done();
      });
    });

  });

});
