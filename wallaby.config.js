module.exports = function(config) {
  return {
    files: [
       { pattern: 'fixtures/**', instrument: false, load: false, ignore: false },
      'src/*.ts',
      '!src/*.spec.ts'
    ],

    tests: [
      'test/**/*.spec.ts'
    ],

    compilers: {
      '**/*.ts': config.compilers.typeScript({ module: 1 })
    },
    
    env: {
        type: "node"
    },
    
    debug: true,
    
    bootstrap: function (wallaby) {
      var mocha = wallaby.testFramework;
      var chai = require('chai');
      
      mocha.ui('bdd');

      global.expect = chai.expect;

    }

  };
};
