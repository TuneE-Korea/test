const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// global.css 를 입력으로 받아 NativeWind 가 Tailwind 를 컴파일하도록 연결
module.exports = withNativeWind(config, { input: './global.css' });
