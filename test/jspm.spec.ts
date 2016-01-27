import { Jspm } from '../src/jspm';

describe('jspm facade', () => {

  beforeEach(() => Jspm.mock());

  it('should be possible to swap the jspm implementation', (done: Function) => {
    Jspm.mock({
      normalize: function(msg: string): Promise<string> {
        return new Promise((resolve: Function, reject: Function) => {
          resolve(msg);
        });
      }
    });

    let jspm: Jspm = new Jspm();

    jspm.normalize('mocked normalize').then((response: string) => {
      expect(response).to.equal('mocked normalize');
      done();
    });
  });

  it('should pass on module loading to node when no mock is provided', () => {
    let jspm: Jspm = new Jspm();
    expect(jspm).to.exist;
  });

});
