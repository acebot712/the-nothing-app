// Learn more https://docs.expo.io/guides/customizing-metro
/* global require, module, __dirname */
const { getDefaultConfig } = require('expo/metro-config');
// We're not using path, so let's remove i
// const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Set the entry file explicitly
config.resolver = {
  ...config.resolver,
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json']
};

module.exports = config;
