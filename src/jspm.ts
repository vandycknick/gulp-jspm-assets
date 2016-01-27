let _jspm: Jspm;

export class Jspm {

  static mock(jspm?: Jspm): void {
    _jspm = jspm;
  }

  constructor() {
    if (!_jspm) {
      _jspm = loadJspm();
    }
  }

  normalize(packageName: string): Promise<string> {
    return _jspm.normalize(packageName);
  }
}

export function loadJspm(): Jspm {
  let jspm: Jspm;
  try {
    /* tslint:disable:no-require-imports */
    jspm = require('jspm');
    /* tslint:enable:no-require-imports */
  } catch (ex) {
    throw new Error(`Can't load jspm try installing it via npm!`);
  }
  return jspm;
}
