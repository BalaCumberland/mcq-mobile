const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    minifierConfig: {
      mangle: {
        keep_fnames: true,
      },
    },
  },
  resolver: {
    alias: {
      '@': './app',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);