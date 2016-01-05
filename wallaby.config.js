module.exports = function(config) {
  return {
    files: [
       { pattern: 'fixtures/**', instrument: false, load: false, ignore: false },
      'src/*.ts',
      '!src/*.spec.ts'
    ],

    tests: [
      'src/*.spec.ts'
    ],

    compilers: {
      '**/*.ts': config.compilers.typeScript({ module: 1 })
    },
    
    env: {
        type: "node"
    },
    
    debug: true

  };
};
