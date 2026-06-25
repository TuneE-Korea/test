module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource: NativeWind 가 className 을 처리할 수 있도록 JSX 변환 소스를 바꿔준다
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // reanimated 4 의 worklets 플러그인은 반드시 마지막에 위치해야 한다
    plugins: ['react-native-worklets/plugin'],
  };
};
